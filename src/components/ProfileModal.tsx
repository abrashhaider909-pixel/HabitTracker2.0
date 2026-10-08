import React, { useState } from 'react';
import { X, User, Image, Check, Mail, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSaveProfile: (updated: Partial<AuthUser>) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || user.email.split('@')[0] || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      displayName: displayName.trim() || user.email.split('@')[0],
      photoUrl: photoUrl.trim() || undefined,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Profile</h3>
              <p className="text-[11px] text-slate-500">Personalize your name and avatar picture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-[#0F766E] uppercase">
                  {(displayName || user.email || 'U')[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {displayName || 'Unnamed User'}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <Mail className="w-3 h-3 text-slate-400" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Private Cloud Workspace
              </span>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your preferred name or moniker"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
              required
            />
          </div>

          {/* Profile Picture URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Profile Picture URL
            </label>
            <div className="relative">
              <Image className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
              />
            </div>
          </div>

          {/* Preset Avatars Selection */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-2">
              Or choose from preset avatars:
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPhotoUrl(url)}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    photoUrl === url ? 'border-[#0F766E] ring-2 ring-teal-200' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={url} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
