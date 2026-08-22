import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, MapPin, Compass, DollarSign, Calendar, ArrowRight, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [tripsRes, citiesRes] = await Promise.all([
          api.get('/trips?filter=Upcoming'),
          api.get('/cities?sort=popularity')
        ]);
        setTrips(tripsRes.data);
        setCities(citiesRes.data.slice(0, 6)); // Top 6 destinations
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching your personalized dashboard..." />;
  }

  // Calculate global budget stats across user trips
  const totalPlannedBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const totalEstimatedCost = trips.reduce((acc, t) => acc + (t.total_cost || 0), 0);
  const remainingBudget = totalPlannedBudget - totalEstimatedCost;
  const budgetUsagePercent = totalPlannedBudget > 0 ? Math.min(100, Math.round((totalEstimatedCost / totalPlannedBudget) * 100)) : 0;

  const upcomingTrip = trips[0]; // Nearest upcoming trip

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Personalized Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-8 overflow-hidden shadow-card">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to GlobeTrotter
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Traveler'} 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
              You have <span className="text-sky-400 font-bold">{trips.length} upcoming trip{trips.length === 1 ? '' : 's'}</span> planned. Ready to organize your next adventure?
            </p>
          </div>

          <Link
            to="/trips/new"
            className="self-start md:self-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-bold text-sm shadow-glow flex items-center gap-2 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            Plan New Trip
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/trips/new"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-sky-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base group-hover:text-sky-600 transition-colors">Plan New Trip</h3>
            <p className="text-xs text-slate-500">Create multi-city itinerary</p>
          </div>
        </Link>

        <Link
          to="/trips"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-sky-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-600 transition-colors">My Trips</h3>
            <p className="text-xs text-slate-500">Manage saved itineraries</p>
          </div>
        </Link>

        <Link
          to="/explore"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-sky-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base group-hover:text-purple-600 transition-colors">Explore Destinations</h3>
            <p className="text-xs text-slate-500">Discover cities & activities</p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Budget Widget & Upcoming Trip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Nearest Upcoming Trip Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" /> Next Upcoming Trip
            </h2>
            <Link to="/trips" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All Trips <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingTrip ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-all">
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <img
                  src={upcomingTrip.cover_image}
                  alt={upcomingTrip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                
                <span className="absolute top-4 left-4 px-3 py-1 bg-sky-600/90 text-white backdrop-blur-md rounded-full text-xs font-bold">
                  {upcomingTrip.status}
                </span>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-black">{upcomingTrip.name}</h3>
                  <p className="text-xs text-slate-200 mt-1 line-clamp-1">{upcomingTrip.description}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Dates</span>
                    <span className="text-sm font-extrabold text-slate-800">{upcomingTrip.start_date}</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Stops</span>
                    <span className="text-sm font-extrabold text-sky-600">{upcomingTrip.stops_count} Cities</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Est. Budget</span>
                    <span className="text-sm font-extrabold text-emerald-600">${upcomingTrip.total_cost || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <Link
                    to={`/trips/${upcomingTrip.id}/builder`}
                    className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl text-center shadow-md shadow-sky-600/20 transition-colors flex items-center justify-center gap-2"
                  >
                    Open Itinerary Builder <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/trips/${upcomingTrip.id}/budget`}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl text-center transition-colors"
                  >
                    Budget Breakdown
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-white border border-slate-200/80 shadow-soft text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No upcoming trips scheduled ✈️</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Start planning your dream adventure today. Select destinations, set dates, and organize daily activities.
              </p>
              <Link
                to="/trips/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 text-white font-bold text-sm shadow-md hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Your First Trip
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Global Budget Summary Card */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Budget Summary
          </h2>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Total Planned Budget</span>
                <span className="font-extrabold text-slate-900">${totalPlannedBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-500">Estimated Total Cost</span>
                <span className="font-extrabold text-sky-600">${totalEstimatedCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-500">Remaining Budget</span>
                <span className={`font-extrabold ${remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${remainingBudget.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                <span>Budget Allocated</span>
                <span>{budgetUsagePercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    remainingBudget < 0 ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-500 to-emerald-500'
                  }`}
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>
            </div>

            {remainingBudget < 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                ⚠️ Your estimated costs exceed total planned budget by ${Math.abs(remainingBudget).toLocaleString()}.
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Active Trips: {trips.length}</span>
              <Link to="/explore" className="font-bold text-sky-600 hover:underline">
                Explore Destinations →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Destinations Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600" /> Recommended Destinations
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">Explore world-class cities with activities and cost indices.</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            View All Destinations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 text-amber-400 backdrop-blur-md rounded-full text-xs font-bold tracking-wider">
                    {city.cost_index}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="text-lg font-bold drop-shadow-md">{city.name}</h4>
                    <p className="text-xs text-slate-200 drop-shadow-md">{city.country} • {city.region}</p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{city.description}</p>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                    <span>Popularity Rating:</span>
                    <span className="text-slate-900 font-extrabold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {city.popularity}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/explore?city=${city.id}`}
                  className="w-full py-2.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs rounded-xl text-center block transition-colors border border-slate-200/60"
                >
                  Explore Activities in {city.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
