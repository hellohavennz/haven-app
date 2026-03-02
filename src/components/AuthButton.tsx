import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from '../lib/auth';
import type { User } from '@supabase/supabase-js';
import { CheckCircle } from 'lucide-react';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getCurrentUser().then(setUser);
    
    const { data: authListener } = onAuthStateChange(setUser);
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess('Account created! You can now sign in.');
        setEmail('');
        setPassword('');
        // Auto-switch to sign in after 2 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess('');
        }, 2000);
      } else {
        await signIn(email, password);
        setShowModal(false);
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  }

  function closeModal() {
    setShowModal(false);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
  }

  const modalContent = showModal ? (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold mb-4 text-slate-900">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="your@email.com"
              required
              disabled={loading || !!success}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Min. 6 characters"
              required
              minLength={6}
              disabled={loading || !!success}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {!success && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              disabled={loading}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={closeModal}
          disabled={loading}
          className="mt-4 w-full px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition disabled:opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 hidden sm:inline">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium hover:opacity-90 transition"
      >
        Sign In
      </button>

      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
