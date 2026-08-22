import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { DollarSign, AlertCircle, Plus, ArrowLeft, TrendingUp, Calendar, Trash2, X } from 'lucide-react';

export default function BudgetPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Expense Form
  const [category, setCategory] = useState('transport');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${id}/budget`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [id]);

  if (loading || !data) {
    return <LoadingSpinner text="Calculating financial analytics & charts..." />;
  }

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount) return;

    try {
      setSubmitting(true);
      await api.post(`/trips/${id}/expenses`, {
        category,
        amount: parseFloat(amount),
        description,
        date
      });
      setShowAddModal(false);
      setAmount('');
      setDescription('');
      fetchBudgetData();
    } catch (err) {
      alert('Failed to log expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchBudgetData();
    } catch (err) {
      alert('Failed to delete expense.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-4">
        <Link to={`/trips/${id}/builder`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Itinerary Builder
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-emerald-600" /> Financial Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{data.tripName} • Cost Analytics & Alerts</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-center px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" /> Log Custom Expense
          </button>
        </div>
      </div>

      {/* Over-Budget Alert Banners */}
      {data.isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-extrabold text-sm">⚠️ Total Trip Budget Exceeded!</span>
            <p className="opacity-90">
              Your estimated spending (${data.totalSpending}) exceeds planned budget (${data.plannedBudget}) by <span className="font-bold text-rose-700">${data.overBudgetAmount}</span>.
            </p>
          </div>
        </div>
      )}

      {data.overBudgetDays.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold space-y-1 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Daily Target Alert ({data.overBudgetDays.length} day{data.overBudgetDays.length === 1 ? '' : 's'} above target)
          </div>
          <p className="opacity-90">
            Daily budget target is <span className="font-bold">${data.dailyBudget}/day</span>. Over-budget dates:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.overBudgetDays.map((d) => (
              <span key={d.date} className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold">
                ⚠️ {d.date}: ${d.amount} (+${Math.round(d.exceededBy)})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planned Budget</span>
          <p className="text-2xl font-black text-slate-900 mt-1">${data.plannedBudget.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-medium">Trip Target Limit</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Estimated Spent</span>
          <p className="text-2xl font-black text-sky-600 mt-1">${data.totalSpending.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-medium">{data.totalDays} Days Trip</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Budget</span>
          <p className={`text-2xl font-black mt-1 ${data.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ${data.remainingBudget.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {data.remainingBudget < 0 ? 'Budget Deficit' : 'Surplus Available'}
          </span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Cost / Day</span>
          <p className="text-2xl font-black text-purple-600 mt-1">${data.avgCostPerDay}</p>
          <span className="text-[11px] text-slate-400 font-medium">Daily Average</span>
        </div>

      </div>

      {/* Recharts Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown Pie & Bar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base">Expense Category Breakdown</h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.breakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {data.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            {data.breakdown.map((item) => (
              <div key={item.category} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-600">{item.category}:</span>
                <span className="font-bold text-slate-900">${item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Line Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base">Daily Spending Trend</h3>

          {data.dailySpending.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailySpending}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Line type="monotone" dataKey="amount" stroke="#0284c7" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-20">No dated expenses recorded yet.</p>
          )}

          {data.highestSpendingDay && (
            <div className="p-3 rounded-2xl bg-slate-50 text-xs font-semibold text-slate-600 flex justify-between items-center">
              <span>Highest Spending Day:</span>
              <span className="font-bold text-sky-700">{data.highestSpendingDay.date} (${data.highestSpendingDay.amount})</span>
            </div>
          )}
        </div>

      </div>

      {/* Expenses Log Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-base">Logged Custom Expenses</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors"
          >
            + Add Expense
          </button>
        </div>

        {data.expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount ($)</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="py-3 capitalize font-bold text-slate-800">{exp.category}</td>
                    <td className="py-3 text-slate-600">{exp.description || '—'}</td>
                    <td className="py-3 text-slate-500">{exp.date}</td>
                    <td className="py-3 text-right font-extrabold text-emerald-600">${exp.amount}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-6">No custom transport/stay expenses logged yet.</p>
        )}
      </div>

      {/* Log Custom Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-lg">Log Custom Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                >
                  <option value="transport">Transport (Flight, Train, Rental)</option>
                  <option value="accommodation">Accommodation / Hotel</option>
                  <option value="meals">Meals & Dining</option>
                  <option value="activities">Activities / Tour</option>
                  <option value="other">Other Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Amount ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Paris Hotel 3 nights"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Logging...' : 'Save Expense'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
