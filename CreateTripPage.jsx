import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plane, Calendar, DollarSign, Image, AlignLeft, ArrowRight, Check } from 'lucide-react';

const SAMPLE_COVERS = [
  { name: 'European Classic', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Asian Skylines', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Tropical Paradise', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Swiss Alpines', url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Desert Oasis', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80' }
];

export default function CreateTripPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [coverImage, setCoverImage] = useState(SAMPLE_COVERS[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
      setError('Please provide trip name, start date, and end date.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/trips', {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        cover_image: coverImage,
        budget: budget ? parseFloat(budget) : 0
      });

      // Redirect immediately to Itinerary Builder
      const newTripId = res.data.trip.id;
      navigate(`/trips/${newTripId}/builder`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Plan a New Trip ✈️</h1>
        <p className="text-sm text-slate-500 mt-1">Set up your trip dates, overall budget, and details to get started.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-card space-y-8">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Trip Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Trip Name *
            </label>
            <div className="relative">
              <Plane className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Europe Summer Adventure 2026"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Planned Budget */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Target Trip Budget ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Trip Notes / Description
            </label>
            <div className="relative">
              <AlignLeft className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Exploring France, Switzerland, and Italy..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Cover Image Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Cover Image
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
              {SAMPLE_COVERS.map((sample) => (
                <button
                  type="button"
                  key={sample.name}
                  onClick={() => setCoverImage(sample.url)}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all group ${
                    coverImage === sample.url ? 'border-sky-600 ring-2 ring-sky-500/30' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                  {coverImage === sample.url && (
                    <div className="absolute inset-0 bg-sky-600/40 flex items-center justify-center text-white">
                      <Check className="w-6 h-6" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Image className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste custom image URL..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create & Build Itinerary'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
