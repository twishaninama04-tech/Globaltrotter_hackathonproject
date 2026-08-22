import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    try {
      setLoading(true);
      await login(demoEmail, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Please try registering a new account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Globe<span className="text-sky-400">Trotter</span>
          </span>
        </Link>

        <Link
          to="/signup"
          className="text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
        >
          Create Account
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-md w-full mx-auto px-4 py-8 z-10">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome back 👋</h1>
            <p className="text-sm text-slate-400 mt-1">Log in to manage your multi-city itineraries & budgets.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@globetrotter.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo environment: Use default demo password "Password123!"'); }} className="text-xs text-sky-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Log In to GlobeTrotter'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@globetrotter.com')}
                className="py-2.5 px-3 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-600/50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Demo Traveler
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@globetrotter.com')}
                className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Demo Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="p-6 text-center text-xs text-slate-500 z-10">
        GlobeTrotter Travel SaaS Platform © 2026. All rights reserved.
      </div>
    </div>
  );
}

function Shield(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
