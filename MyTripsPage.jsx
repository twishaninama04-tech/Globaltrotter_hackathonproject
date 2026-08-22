import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShareModal from '../components/trips/ShareModal';
import { Plus, Search, MapPin, Calendar, DollarSign, Share2, Trash2, Edit3, ArrowRight } from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [shareTrip, setShareTrip] = useState(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let url = '/trips';
      const params = [];
      if (filter !== 'All') params.push(`filter=${filter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setTrips(res.data);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [filter, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete trip.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Travel Itineraries</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, edit, visualize and share your multi-city trips.</p>
        </div>

        <Link
          to="/trips/new"
          className="self-start sm:self-center px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Plan New Trip
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {['All', 'Upcoming', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching your trips..." />
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.cover_image}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    trip.status === 'Completed' ? 'bg-slate-800/90 text-slate-300' : 'bg-sky-600/90 text-white'
                  }`}>
                    {trip.status}
                  </span>

                  <button
                    onClick={() => setShareTrip(trip)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-sky-600 rounded-full shadow-md backdrop-blur-md transition-colors"
                    title="Share Itinerary"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-xl font-black drop-shadow-sm leading-tight">{trip.name}</h3>
                    <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{trip.description}</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{trip.start_date} – {trip.end_date}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Cities</span>
                      <span className="font-extrabold text-slate-800">{trip.stops_count}</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Activities</span>
                      <span className="font-extrabold text-sky-600">{trip.activities_count}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Est. Cost</span>
                      <span className="font-extrabold text-emerald-600">${trip.total_cost || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <Link
                  to={`/trips/${trip.id}/builder`}
                  className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Itinerary Builder
                </Link>

                <Link
                  to={`/trips/${trip.id}/budget`}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  title="View Budget Breakdown"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </Link>

                <button
                  onClick={() => handleDelete(trip.id, trip.name)}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800">No trips found ✈️</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {search ? 'No trips match your search keyword. Try clearing filters.' : 'You haven’t created any trips yet. Start planning your next dream adventure!'}
          </p>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-md hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Plan New Trip
          </Link>
        </div>
      )}

      {/* Share Modal Component */}
      {shareTrip && (
        <ShareModal
          trip={shareTrip}
          onClose={() => setShareTrip(null)}
        />
      )}

    </div>
  );
}
