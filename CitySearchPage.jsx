import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Compass, MapPin, TrendingUp, Bookmark, Star, Plus, ArrowRight, X, Clock, DollarSign } from 'lucide-react';

const REGIONS = ['All', 'Europe', 'Asia', 'Middle East', 'North America'];
const COST_INDICES = ['All', '$', '$$', '$$$', '$$$$'];

export default function CitySearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [savedCityIds, setSavedCityIds] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');
  const [sort, setSort] = useState('popularity');

  // Active City Drawer / Modal
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityActivities, setCityActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');

  const fetchCities = async () => {
    try {
      setLoading(true);
      let url = `/cities?sort=${sort}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedRegion !== 'All') url += `&region=${selectedRegion}`;
      if (selectedCost !== 'All') url += `&cost_index=${encodeURIComponent(selectedCost)}`;

      const [citiesRes, savedRes, tripsRes] = await Promise.all([
        api.get(url),
        api.get('/user/saved').catch(() => ({ data: [] })),
        api.get('/trips').catch(() => ({ data: [] }))
      ]);

      setCities(citiesRes.data);
      setSavedCityIds((savedRes.data || []).map(c => c.id));
      setUserTrips(tripsRes.data || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search, selectedRegion, selectedCost, sort]);

  const handleToggleBookmark = async (cityId) => {
    try {
      const res = await api.post('/user/saved', { city_id: cityId });
      if (res.data.saved) {
        setSavedCityIds([...savedCityIds, cityId]);
      } else {
        setSavedCityIds(savedCityIds.filter(id => id !== cityId));
      }
    } catch (err) {
      alert('Please log in to save destinations.');
    }
  };

  const handleOpenCityModal = async (city) => {
    setSelectedCity(city);
    setLoadingActivities(true);
    try {
      const res = await api.get(`/cities/${city.id}`);
      setCityActivities(res.data.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleAddStopToSelectedTrip = async () => {
    if (!selectedTripId) {
      alert('Please select a trip to add this destination.');
      return;
    }
    const targetTrip = userTrips.find(t => t.id === parseInt(selectedTripId, 10));
    if (!targetTrip) return;

    try {
      await api.post('/stops', {
        trip_id: targetTrip.id,
        city_id: selectedCity.id,
        arrival_date: targetTrip.start_date,
        departure_date: targetTrip.end_date
      });
      alert(`Added ${selectedCity.name} to ${targetTrip.name}!`);
      setSelectedCity(null);
      navigate(`/trips/${targetTrip.id}/builder`);
    } catch (err) {
      alert('Failed to add city stop to trip.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Compass className="w-8 h-8 text-sky-600" /> Explore Global Destinations
        </h1>
        <p className="text-sm text-slate-500 mt-1">Discover world-class cities, cost indices, and curated activities.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Paris, Tokyo, Zurich..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Region */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {REGIONS.map(r => <option key={r} value={r}>Region: {r}</option>)}
            </select>
          </div>

          {/* Cost Index */}
          <div>
            <select
              value={selectedCost}
              onChange={(e) => setSelectedCost(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              {COST_INDICES.map(c => <option key={c} value={c}>Cost Index: {c}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="name">Sort Alphabetically</option>
            </select>
          </div>

        </div>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <LoadingSpinner text="Searching global destinations..." />
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => {
            const isSaved = savedCityIds.includes(city.id);

            return (
              <div
                key={city.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Bookmark Button */}
                    <button
                      onClick={() => handleToggleBookmark(city.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-amber-400 text-slate-900' : 'bg-white/80 text-slate-700 hover:bg-white'
                      }`}
                      title={isSaved ? 'Saved to profile' : 'Save destination'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-900' : ''}`} />
                    </button>

                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 text-amber-400 backdrop-blur-md rounded-full text-xs font-bold tracking-wider">
                      {city.cost_index}
                    </span>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-2xl font-black drop-shadow-md">{city.name}</h3>
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
                  <button
                    onClick={() => handleOpenCityModal(city)}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Activities & Add to Trip <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3 shadow-soft">
          <p className="text-slate-500 text-sm">No destinations found matching filters.</p>
        </div>
      )}

      {/* Selected City Details & Activities Modal */}
      {selectedCity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col justify-between animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-xl">{selectedCity.name}, {selectedCity.country}</h3>
                <p className="text-xs text-slate-500">{selectedCity.region} • Cost Index: {selectedCity.cost_index}</p>
              </div>
              <button onClick={() => setSelectedCity(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              <p className="text-xs text-slate-600 leading-relaxed">{selectedCity.description}</p>

              {/* Add Stop to Existing Trip Widget */}
              {userTrips.length > 0 ? (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                    Add {selectedCity.name} to One of Your Trips
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Select Active Trip --</option>
                      {userTrips.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.start_date})</option>
                      ))}
                    </select>

                    <button
                      onClick={handleAddStopToSelectedTrip}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      Add Stop
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 text-xs flex justify-between items-center">
                  <span>Want to plan a trip to {selectedCity.name}?</span>
                  <button onClick={() => navigate('/trips/new')} className="text-sky-600 font-bold hover:underline">
                    Create New Trip →
                  </button>
                </div>
              )}

              {/* Top Activities in City */}
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-3">Popular Activities in {selectedCity.name}</h4>
                {loadingActivities ? (
                  <p className="text-xs text-slate-400">Loading activities...</p>
                ) : (
                  <div className="space-y-2.5">
                    {cityActivities.map((act) => (
                      <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-800 text-xs">{act.name}</h5>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">{act.category}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0 text-xs">
                          <span className="font-extrabold text-emerald-600">${act.estimated_cost}</span>
                          <span className="block text-[10px] text-slate-400">{act.duration} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedCity(null)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
