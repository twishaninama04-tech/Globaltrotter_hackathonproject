import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StopManager from '../components/itinerary/StopManager';
import ActivityPickerModal from '../components/itinerary/ActivityPickerModal';
import CalendarView from '../components/itinerary/CalendarView';
import ShareModal from '../components/trips/ShareModal';
import { Calendar as CalendarIcon, Clock, DollarSign, Plus, Share2, Trash2, Edit2, List, LayoutList, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'list' | 'calendar'
  
  // Modal states
  const [activePickerDay, setActivePickerDay] = useState(null); // { date, stop }
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error('Failed to load trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  if (loading || !trip) {
    return <LoadingSpinner text="Building interactive itinerary..." />;
  }

  // Generate array of days between start_date and end_date
  const getTripDays = () => {
    const days = [];
    let current = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    let dayNum = 1;

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Find matching stop for this date
      const matchingStop = trip.stops.find(s => dateStr >= s.arrival_date && dateStr <= s.departure_date);

      // Collect all activities across stops scheduled for dateStr
      let dayActivities = [];
      trip.stops.forEach(s => {
        const filtered = (s.activities || []).filter(a => a.date === dateStr);
        dayActivities.push(...filtered);
      });

      days.push({
        dayNumber: dayNum,
        date: dateStr,
        stop: matchingStop || null,
        activities: dayActivities
      });

      current.setDate(current.getDate() + 1);
      dayNum++;
    }
    return days;
  };

  const tripDays = getTripDays();

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Remove this activity from your itinerary?')) return;
    try {
      await api.delete(`/itinerary/${activityId}`);
      fetchTripDetails();
    } catch (err) {
      alert('Failed to remove activity.');
    }
  };

  const financials = trip.financials || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link to="/trips" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </Link>

        {/* Hero Card */}
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 overflow-hidden shadow-card">
          <img
            src={trip.cover_image}
            alt={trip.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-sky-600 text-white rounded-full text-xs font-extrabold uppercase tracking-wider">
                  Itinerary Builder
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {trip.start_date} – {trip.end_date}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">{trip.description}</p>
            </div>

            {/* Quick Actions & Financial Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/trips/${trip.id}/budget`}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 border border-white/20 transition-all"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Est. Cost: <span className="text-emerald-400 font-black">${financials.totalSpending || 0}</span>
              </Link>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-glow transition-all"
              >
                <Share2 className="w-4 h-4" /> Share Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Over-Budget Alert Banner */}
      {financials.isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <span className="font-extrabold">⚠️ Budget Alert:</span> Your total estimated spending (${financials.totalSpending}) exceeds planned budget (${financials.budget}) by ${financials.overBudgetAmount}.
            </div>
          </div>
          <Link to={`/trips/${trip.id}/budget`} className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[11px] font-bold hover:bg-rose-700">
            View Budget Details
          </Link>
        </div>
      )}

      {/* Multi-City Stops Manager Component */}
      <StopManager
        tripId={trip.id}
        stops={trip.stops || []}
        onStopsUpdated={fetchTripDetails}
      />

      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">Day-by-Day Schedule</h3>
          <p className="text-xs text-slate-500">Organize activities, calculate daily expenses, and arrange timing.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'timeline' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" /> Timeline View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'calendar' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar View
          </button>
        </div>
      </div>

      {/* Main View Content */}
      {viewMode === 'calendar' ? (
        <CalendarView
          tripDays={tripDays}
          onSelectDayToAdd={(dayItem) => setActivePickerDay({ date: dayItem.date, stop: dayItem.stop })}
        />
      ) : (
        /* Timeline / List View */
        <div className="space-y-6">
          {tripDays.map((dayItem) => {
            const dailyTotal = dayItem.activities.reduce((acc, a) => acc + (a.cost || 0), 0);

            return (
              <div
                key={dayItem.date}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6 hover:shadow-card transition-all"
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-500 text-white flex flex-col items-center justify-center font-black shadow-md">
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Day</span>
                      <span className="text-lg leading-none">{dayItem.dayNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-base">{dayItem.date}</h3>
                        {dayItem.stop ? (
                          <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-extrabold">
                            📍 {dayItem.stop.city_name}, {dayItem.stop.city_country}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
                            Transit / Travel Day
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {dayItem.activities.length} activities scheduled
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/60 text-xs font-extrabold">
                      Daily Total: ${dailyTotal}
                    </div>

                    {dayItem.stop ? (
                      <button
                        onClick={() => setActivePickerDay({ date: dayItem.date, stop: dayItem.stop })}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Activity
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Add a city stop first</span>
                    )}
                  </div>
                </div>

                {/* Scheduled Activities for Day */}
                {dayItem.activities.length > 0 ? (
                  <div className="space-y-3 pl-0 sm:pl-4">
                    {dayItem.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-sky-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-center font-mono font-bold text-xs text-slate-700 shadow-sm flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-sky-600 mx-auto mb-0.5" />
                            {act.start_time || '09:00'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-sm">{act.title}</h4>
                              {act.category && (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold">
                                  {act.category}
                                </span>
                              )}
                            </div>

                            {act.notes && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{act.notes}</p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                              <span>Duration: {act.duration || 60} mins</span>
                              <span className="font-extrabold text-emerald-600">${act.cost || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="Remove Activity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No activities planned for this day yet. Click "+ Add Activity" to browse recommendations.
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Activity Picker Modal */}
      {activePickerDay && (
        <ActivityPickerModal
          stop={activePickerDay.stop}
          targetDate={activePickerDay.date}
          onClose={() => setActivePickerDay(null)}
          onActivityAdded={fetchTripDetails}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          trip={trip}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
}
