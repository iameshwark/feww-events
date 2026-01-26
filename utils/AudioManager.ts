class AudioManager {
  private hoverSound: HTMLAudioElement;
  private clickSound: HTMLAudioElement;
  private ambientSound: HTMLAudioElement;
  private hasStarted: boolean = false;

  constructor() {
    // SFX: Tech Chirp / Blip
    this.hoverSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3');
    this.hoverSound.volume = 0.05; // Keep it subtle

    // SFX: Heavy Switch / Impact
    // Using a cinematic transition sound
    this.clickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-transition-2298.mp3');
    this.clickSound.volume = 0.25;

    // Ambient: Dark Drone
    this.ambientSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cinematic-atmosphere-drone-240.mp3');
    this.ambientSound.loop = true;
    this.ambientSound.volume = 0.4; // Slightly increased base volume
  }

  playHover() {
    if (!this.hasStarted) return;
    const sound = this.hoverSound.cloneNode() as HTMLAudioElement;
    sound.volume = 0.05;
    sound.play().catch(() => {});
  }

  playClick() {
    if (!this.hasStarted) return;
    this.clickSound.currentTime = 0;
    this.clickSound.play().catch(() => {});
  }

  startAmbient() {
    if (this.hasStarted) return;
    
    this.hasStarted = true;
    
    // Attempt to play. Browsers require this to happen strictly inside a user interaction event handler.
    const playPromise = this.ambientSound.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Audio autoplay prevented by browser policy.", error);
        // Reset state so user can try again if needed
        this.hasStarted = false;
      });
    }
  }
}

export const audioManager = new AudioManager();