import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Globe, MapPin, Calendar, Clock, DollarSign, Copy, Check, User, ArrowRight } from 'lucide-react';

export default function SharedTripPage() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shared/${token}`);
        setTrip(res.data);
      } catch (err) {
        console.error('Failed to load shared trip:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  if (loading) {
    return <LoadingSpinner text="Loading shared travel itinerary..." />;
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-card space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Itinerary Not Found 🔒</h2>
        <p className="text-xs text-slate-500">This trip link may have expired or public sharing was disabled by the creator.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl">
          Back to GlobeTrotter Home
        </Link>
      </div>
    );
  }

  const handleCopyTrip = async () => {
    if (!user) {
      alert('Please log in or create an account to copy this trip to your dashboard.');
      navigate('/login');
      return;
    }

    try {
      setCopying(true);
      const res = await api.post(`/shared/${token}/copy`);
      alert('Trip copied successfully to your account!');
      navigate(`/trips/${res.data.newTripId}/builder`);
    } catch (err) {
      alert('Failed to copy trip.');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Shared Header Banner */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-8 overflow-hidden shadow-card">
        <img
          src={trip.cover_image}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
        />
        <div className="relative z-10 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={trip.traveler_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={trip.traveler_name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <div>
                <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Shared Itinerary by</span>
                <span className="text-sm font-bold text-white">{trip.traveler_name}</span>
              </div>
            </div>

            <button
              onClick={handleCopyTrip}
              disabled={copying}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-glow flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Copy className="w-4 h-4" /> {copying ? 'Copying Trip...' : 'Copy This Trip to My Account'}
            </button>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">{trip.description}</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-sky-400 mt-3">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trip.start_date} – {trip.end_date}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.stops?.length || 0} Destination Cities</span>
            </div>
          </div>

        </div>
      </div>

      {/* Cities Sequence Showcase */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base">Travel Cities Sequence</h3>
        <div className="flex flex-wrap items-center gap-3">
          {(trip.stops || []).map((stop) => (
            <div key={stop.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img src={stop.city_image} alt={stop.city_name} className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{stop.city_name}, {stop.city_country}</h4>
                <p className="text-[10px] text-slate-400">{stop.arrival_date} – {stop.departure_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary Activities List */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-slate-800 text-xl">Day-by-Day Itinerary</h3>

        {(trip.stops || []).map((stop) => (
          <div key={stop.id} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h4 className="font-extrabold text-slate-800 text-base">{stop.city_name}, {stop.city_country}</h4>
              <span className="text-xs text-slate-400">({stop.arrival_date} – {stop.departure_date})</span>
            </div>

            <div className="space-y-3">
              {(stop.activities || []).map((act) => (
                <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                      {act.start_time || '09:00'}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{act.title}</h5>
                      {act.notes && <p className="text-[11px] text-slate-500">{act.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-emerald-600">${act.cost || 0}</span>
                    <span className="block text-[10px] text-slate-400">{act.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Copy Button */}
      <div className="p-8 rounded-3xl bg-sky-50 border border-sky-200 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-800">Like this itinerary?</h3>
        <p className="text-xs text-slate-600">Copy this exact itinerary to your GlobeTrotter account to customize dates, budget, or activities.</p>
        <button
          onClick={handleCopyTrip}
          disabled={copying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-sky-700 transition-colors"
        >
          <Copy className="w-4 h-4" /> {copying ? 'Copying...' : 'Copy This Itinerary'}
        </button>
      </div>

    </div>
  );
}
