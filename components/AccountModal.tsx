import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

interface AccountModalProps {
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const meta = session.user.user_metadata;
        
        // 1. Set fallbacks from Google/Auth metadata
        setFullName(meta.full_name || meta.name || '');
        setAvatarUrl(meta.avatar_url || "https://www.svgrepo.com/show/5125/user.svg");

        // 2. Try to fetch the saved phone number from your profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            if (profile.phone) setPhone(profile.phone);
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

      // Save new image URL to database
      await supabase.from('profiles').upsert([{ id: user.id, avatar_url: data.publicUrl }]);
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });

    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Update Auth & Profiles Table
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    const { error } = await supabase.from('profiles').upsert([
        { id: user.id, full_name: fullName, phone: phone, avatar_url: avatarUrl }
    ]);

    setSaving(false);
    if (error) alert(error.message);
    else alert("Coordinates Updated Successfully.");
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-zinc-800 p-8 w-full max-w-md text-white relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl font-bold w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">✕</button>

        <div className="flex flex-col items-center mb-8 relative">
            {/* Clickable Avatar Area */}
            <div className="relative group cursor-pointer mb-4" onClick={() => document.getElementById('avatar-upload')?.click()}>
                <img src={avatarUrl} alt="Profile" className={`w-24 h-24 rounded-full border-2 border-zinc-700 object-cover bg-black transition-opacity ${uploading ? 'opacity-50' : 'group-hover:opacity-70'}`} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-widest bg-black/80 px-2 py-1 rounded">Edit</span>
                </div>
                {uploading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
            </div>
            {/* Hidden File Input (accepts images, opens camera on mobile) */}
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            
            <h2 className="text-xl font-bold uppercase tracking-wider">{fullName || 'Operator'}</h2>
            <p className="text-xs text-zinc-500 font-mono">{user?.email}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Display Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-white font-mono text-sm" />
            </div>
            
            <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-widest">Comms Number (WhatsApp)</label>
                <div className="flex bg-black border border-zinc-800 focus-within:border-white transition-colors">
                    <span className="p-3 text-zinc-500 border-r border-zinc-800 font-mono">+91</span>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} placeholder="10-digit number" className="w-full bg-transparent p-3 text-white outline-none font-mono text-sm" />
                </div>
            </div>

            <button type="submit" disabled={saving || uploading} className="w-full mt-4 bg-white text-black p-4 font-bold uppercase tracking-widest hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Transmitting...' : 'Save Coordinates'}
            </button>
        </form>
      </motion.div>
    </div>
  );
};