import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, Users, MapPin, Compass, Calendar, DollarSign, TrendingUp, Layers } from 'lucide-react';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load admin analytics. Please make sure your account role is admin.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching platform analytics..." />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-card text-center space-y-4">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Admin Access Required</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <p className="text-xs font-semibold text-sky-600">Tip: Log in using Demo Admin button on Login page!</p>
      </div>
    );
  }

  const { stats, popularCities, categoryDistribution, recentTrips } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Analytics & Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform overview, user activity, trip stats, and destination metrics.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
          <span className="text-[11px] text-emerald-600 font-bold">+100% active</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Trips</span>
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalTrips}</p>
          <span className="text-[11px] text-slate-400 font-medium">Created on platform</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cities</span>
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalCities}</p>
          <span className="text-[11px] text-slate-400 font-medium">Available destinations</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Activities</span>
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalActivities}</p>
          <span className="text-[11px] text-slate-400 font-medium">Catalog items</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">${stats.totalBudgetSum.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-medium">Cumulative value</span>
        </div>

      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Popular Cities Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base">Top Destination Cities</h3>

          <div className="space-y-3">
            {popularCities.map((city, idx) => (
              <div key={city.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-extrabold text-slate-400">#{idx + 1}</span>
                  <img src={city.image} alt={city.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{city.name}, {city.country}</h4>
                    <span className="text-[10px] text-slate-400">Popularity rating: {city.popularity}/100</span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="font-extrabold text-sky-600">{city.trip_count}</span>
                  <span className="block text-[10px] text-slate-400">Trip stops</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Category Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base">Activity Catalog by Category</h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categoryDistribution.map((cat, idx) => (
              <span key={cat.category} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                {cat.category}: <span className="font-extrabold text-slate-900">{cat.count}</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Trips Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base">Recent Platform Trips</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Trip Name</th>
                <th className="pb-3">Created By</th>
                <th className="pb-3">Dates</th>
                <th className="pb-3 text-right">Budget ($)</th>
                <th className="pb-3 text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80">
                  <td className="py-3 font-bold text-slate-800">{t.name}</td>
                  <td className="py-3">
                    <span className="font-bold text-slate-700">{t.user_name}</span>
                    <span className="block text-[10px] text-slate-400">{t.user_email}</span>
                  </td>
                  <td className="py-3 text-slate-500">{t.start_date} – {t.end_date}</td>
                  <td className="py-3 text-right font-extrabold text-emerald-600">${t.budget || 0}</td>
                  <td className="py-3 text-right text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
