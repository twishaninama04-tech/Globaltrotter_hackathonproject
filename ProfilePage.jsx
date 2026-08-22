import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { User, Mail, Globe, Lock, Bookmark, Trash2, Check, ArrowRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/user/saved')
      .then(res => setSavedDestinations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSaving(true);
      const res = await api.put('/user/profile', {
        name,
        language,
        profile_image: profileImage,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });

      updateUser(res.data.user);
      setMessage('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSaved = async (cityId) => {
    try {
      await api.post('/user/saved', { city_id: cityId });
      setSavedDestinations(savedDestinations.filter(c => c.id !== cityId));
    } catch (err) {
      alert('Failed to remove saved destination.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete your GlobeTrotter account? All your trips and itineraries will be permanently deleted.')) {
      return;
    }
    try {
      await api.delete('/user/account');
      logout();
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account & Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile details, language preferences, and saved destinations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Edit Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-card space-y-6">
          <h2 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-3">Personal Information</h2>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> {message}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Language Preference
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Change Password</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Delete Account
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Saved Destinations */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-400" /> Saved Destinations
          </h2>

          {loading ? (
            <p className="text-xs text-slate-400">Loading saved cities...</p>
          ) : savedDestinations.length > 0 ? (
            <div className="space-y-3">
              {savedDestinations.map((city) => (
                <div key={city.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={city.image} alt={city.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{city.name}</h4>
                      <p className="text-[10px] text-slate-400">{city.country} • {city.cost_index}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveSaved(city.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No saved destinations yet. Click the bookmark icon on any city card to save it here!</p>
          )}
        </div>

      </div>
    </div>
  );
}
