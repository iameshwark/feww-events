import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// ---------------------------------------------------------------------------------------
// SHADERS
// ---------------------------------------------------------------------------------------

const baseVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const displayVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const splatShader = `
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main() {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
}
`;

const advectionShader = `
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
}
`;

const divergenceShader = `
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 texelSize;

void main() {
    float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
    float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;
    
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vUv.x < texelSize.x) L = -C.x;
    if (vUv.x > 1.0 - texelSize.x) R = -C.x;
    if (vUv.y < texelSize.y) B = -C.y;
    if (vUv.y > 1.0 - texelSize.y) T = -C.y;
    
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const pressureShader = `
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 texelSize;

void main() {
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    float C = texture2D(uPressure, vUv).x;
    float div = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + T + B - div) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const gradientSubtractShader = `
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 texelSize;

void main() {
    float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const displayShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
void main() {
    vec3 c = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(c, 1.0);
}
`;

// ---------------------------------------------------------------------------------------
// FBO HELPER
// ---------------------------------------------------------------------------------------

class DoubleFBO {
    read: THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;

    constructor(width: number, height: number, options: any) {
        this.read = new THREE.WebGLRenderTarget(width, height, options);
        this.write = new THREE.WebGLRenderTarget(width, height, options);
    }

    swap() {
        const temp = this.read;
        this.read = this.write;
        this.write = temp;
    }
}

// ---------------------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------------------

interface FluidBackgroundProps {
    targetColor: string; // Hex color
}

interface Splat {
    x: number;
    y: number;
    dx: number;
    dy: number;
    color: THREE.Vector3;
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ targetColor }) => {
    const { gl, size, viewport } = useThree();
    const MESH_SCALE = 1.15;
    const simRes = 128; 
    const dyeRes = 512; 
    
    const fboOpts = useMemo(() => ({
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
    }), []);

    const velocity = useMemo(() => new DoubleFBO(simRes, simRes, fboOpts), [fboOpts]);
    const density = useMemo(() => new DoubleFBO(dyeRes, dyeRes, fboOpts), [fboOpts]);
    const divergence = useMemo(() => new THREE.WebGLRenderTarget(simRes, simRes, fboOpts), [fboOpts]);
    const pressure = useMemo(() => new DoubleFBO(simRes, simRes, fboOpts), [fboOpts]);

    const advectionMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uVelocity: { value: null },
            uSource: { value: null },
            texelSize: { value: new THREE.Vector2() },
            dt: { value: 0.016 },
            dissipation: { value: 0.98 },
        },
        vertexShader: baseVertexShader,
        fragmentShader: advectionShader,
        depthTest: false,
        depthWrite: false,
    }), []);

    const splatMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTarget: { value: null },
            aspectRatio: { value: 1 },
            color: { value: new THREE.Vector3() },
            point: { value: new THREE.Vector2() },
            radius: { value: 0.005 },
        },
        vertexShader: baseVertexShader,
        fragmentShader: splatShader,
        depthTest: false,
        depthWrite: false,
    }), []);

    const divergenceMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uVelocity: { value: null },
            texelSize: { value: new THREE.Vector2() },
        },
        vertexShader: baseVertexShader,
        fragmentShader: divergenceShader,
        depthTest: false,
        depthWrite: false,
    }), []);

    const pressureMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uPressure: { value: null },
            uDivergence: { value: null },
            texelSize: { value: new THREE.Vector2() },
        },
        vertexShader: baseVertexShader,
        fragmentShader: pressureShader,
        depthTest: false,
        depthWrite: false,
    }), []);

    const gradientSubtractMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uPressure: { value: null },
            uVelocity: { value: null },
            texelSize: { value: new THREE.Vector2() },
        },
        vertexShader: baseVertexShader,
        fragmentShader: gradientSubtractShader,
        depthTest: false,
        depthWrite: false,
    }), []);

    const displayMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
        },
        vertexShader: displayVertexShader,
        fragmentShader: displayShader,
        depthTest: false,
        depthWrite: false,
    }), []);

    const fsQuad = useMemo(() => {
        const geom = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geom, advectionMat);
        const scene = new THREE.Scene();
        scene.add(mesh);
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return { scene, camera, mesh };
    }, [advectionMat]);

    const lastMouse = useRef(new THREE.Vector2(0, 0));
    const targetColorVec = useMemo(() => new THREE.Color(targetColor), [targetColor]);
    const splatQueue = useRef<Splat[]>([]);

    useEffect(() => {
        for (let i = 0; i < 8; i++) {
            splatQueue.current.push({
                x: Math.random(),
                y: Math.random(),
                dx: (Math.random() - 0.5) * 1000,
                dy: (Math.random() - 0.5) * 1000,
                color: new THREE.Vector3(Math.random(), Math.random(), 1.0).multiplyScalar(0.8)
            });
        }
    }, []);

    useFrame((state) => {
        const dt = 0.016;
        const currentRenderTarget = gl.getRenderTarget();
        
        const mouse = state.pointer;
        const currentMouse = new THREE.Vector2(
            0.5 + (mouse.x * 0.5) / MESH_SCALE,
            0.5 + (mouse.y * 0.5) / MESH_SCALE
        );
        
        const velocityVec = new THREE.Vector2()
            .copy(currentMouse)
            .sub(lastMouse.current)
            .multiplyScalar(50.0); 

        if (velocityVec.length() > 0) {
            splatQueue.current.push({
                x: currentMouse.x,
                y: currentMouse.y,
                dx: velocityVec.x,
                dy: velocityVec.y,
                color: new THREE.Vector3(targetColorVec.r, targetColorVec.g, targetColorVec.b)
            });
        }
        
        lastMouse.current.copy(currentMouse);
        const splatsToProcess = splatQueue.current.splice(0, 5);

        splatsToProcess.forEach(splat => {
            splatMat.uniforms.point.value.set(splat.x, splat.y);
            splatMat.uniforms.aspectRatio.value = size.width / size.height;
            splatMat.uniforms.radius.value = 0.005; 

            splatMat.uniforms.uTarget.value = velocity.read.texture;
            splatMat.uniforms.color.value.set(splat.dx, splat.dy, 1.0);
            fsQuad.mesh.material = splatMat;
            gl.setRenderTarget(velocity.write);
            gl.render(fsQuad.scene, fsQuad.camera);
            velocity.swap();

            splatMat.uniforms.uTarget.value = density.read.texture;
            splatMat.uniforms.color.value.copy(splat.color);
            fsQuad.mesh.material = splatMat;
            gl.setRenderTarget(density.write);
            gl.render(fsQuad.scene, fsQuad.camera);
            density.swap();
        });

        advectionMat.uniforms.dt.value = dt;
        advectionMat.uniforms.texelSize.value.set(1 / simRes, 1 / simRes);
        advectionMat.uniforms.uVelocity.value = velocity.read.texture;
        advectionMat.uniforms.uSource.value = velocity.read.texture;
        advectionMat.uniforms.dissipation.value = 0.985;
        fsQuad.mesh.material = advectionMat;
        gl.setRenderTarget(velocity.write);
        gl.render(fsQuad.scene, fsQuad.camera);
        velocity.swap();

        advectionMat.uniforms.uVelocity.value = velocity.read.texture;
        advectionMat.uniforms.uSource.value = density.read.texture;
        advectionMat.uniforms.dissipation.value = 0.99;
        fsQuad.mesh.material = advectionMat;
        gl.setRenderTarget(density.write);
        gl.render(fsQuad.scene, fsQuad.camera);
        density.swap();

        divergenceMat.uniforms.uVelocity.value = velocity.read.texture;
        divergenceMat.uniforms.texelSize.value.set(1 / simRes, 1 / simRes);
        fsQuad.mesh.material = divergenceMat;
        gl.setRenderTarget(divergence);
        gl.render(fsQuad.scene, fsQuad.camera);

        pressureMat.uniforms.uDivergence.value = divergence.texture;
        pressureMat.uniforms.texelSize.value.set(1 / simRes, 1 / simRes);
        for (let i = 0; i < 40; i++) {
            pressureMat.uniforms.uPressure.value = pressure.read.texture;
            fsQuad.mesh.material = pressureMat;
            gl.setRenderTarget(pressure.write);
            gl.render(fsQuad.scene, fsQuad.camera);
            pressure.swap();
        }

        gradientSubtractMat.uniforms.uPressure.value = pressure.read.texture;
        gradientSubtractMat.uniforms.uVelocity.value = velocity.read.texture;
        gradientSubtractMat.uniforms.texelSize.value.set(1 / simRes, 1 / simRes);
        fsQuad.mesh.material = gradientSubtractMat;
        gl.setRenderTarget(velocity.write);
        gl.render(fsQuad.scene, fsQuad.camera);
        velocity.swap();

        gl.setRenderTarget(currentRenderTarget);
    });

    useFrame(() => {
        if (displayMat.uniforms.uTexture.value !== density.read.texture) {
             displayMat.uniforms.uTexture.value = density.read.texture;
        }
        targetColorVec.set(targetColor);
    });

    return (
        <mesh scale={[viewport.width * MESH_SCALE, viewport.height * MESH_SCALE, 1]}>
            <planeGeometry args={[1, 1]} />
            <primitive object={displayMat} attach="material" />
        </mesh>
    );
};