import React, { useState } from 'react';
import { Github, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const url = `${BACKEND_URL}${endpoint}`;

      // for login we just need username + password
      const payload = isLogin
        ? { username: formData.username || formData.email, password: formData.password }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            name: formData.name
          };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // important for cookies
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // success → redirect to dashboard or home
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Advanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand with glow effect */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="text-6xl font-light text-white mb-3 tracking-wider relative z-10" style={{fontFamily: 'Ubuntu, sans-serif'}}>
              NEXUS
            </h1>
            <div className="absolute inset-0 text-6xl font-light text-white blur-xl opacity-50" style={{fontFamily: 'Ubuntu, sans-serif'}}>
              NEXUS
            </div>
          </div>
          <p className="text-xs text-gray-400 tracking-[0.3em] uppercase">Secure Access Portal</p>
        </div>

        {/* Form Container with glass morphism */}
        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50 animate-slide-up relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            {/* Toggle Buttons with better design */}
            <div className="flex mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3 text-xs font-semibold transition-all duration-500 rounded-xl ${
                  isLogin 
                    ? 'bg-gradient-to-r from-white to-gray-100 text-black shadow-lg shadow-white/20 scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={{fontFamily: 'Ubuntu, sans-serif'}}
              >
                LOGIN
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3 text-xs font-semibold transition-all duration-500 rounded-xl ${
                  !isLogin 
                    ? 'bg-gradient-to-r from-white to-gray-100 text-black shadow-lg shadow-white/20 scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={{fontFamily: 'Ubuntu, sans-serif'}}
              >
                SIGN UP
              </button>
            </div>

            {/* OAuth Buttons with colored icons */}
            <div className="space-y-3 mb-8">
              <button
                className="w-full py-3.5 border border-white/20 rounded-2xl text-white text-xs font-medium hover:bg-white/5 hover:border-white/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                type="button"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="relative z-10">Continue with Google</span>
              </button>
              
              <button
                className="w-full py-3.5 border border-white/20 rounded-2xl text-white text-xs font-medium hover:bg-white/5 hover:border-white/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                type="button"
                onClick={handleGithubLogin}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                  <Github className="w-3 h-3 text-white" />
                </div>
                <span className="relative z-10">Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-4 text-gray-500 tracking-wider">Or continue with</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 mb-4">
                {error}
              </p>
            )}

            {/* Input Fields with icons */}
            <div className="space-y-5">
              {!isLogin && (
                <div className="animate-slide-down">
                  <label className="block text-gray-400 text-xs mb-2.5 uppercase tracking-wide font-medium" style={{fontFamily: 'Ubuntu, sans-serif'}}>
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder-gray-600"
                      placeholder="John Doe"
                      style={{fontFamily: 'Ubuntu, sans-serif'}}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="animate-slide-down" style={{animationDelay: '0.1s'}}>
                  <label className="block text-gray-400 text-xs mb-2.5 uppercase tracking-wide font-medium" style={{fontFamily: 'Ubuntu, sans-serif'}}>
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder-gray-600"
                      placeholder="you@example.com"
                      style={{fontFamily: 'Ubuntu, sans-serif'}}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-xs mb-2.5 uppercase tracking-wide font-medium" style={{fontFamily: 'Ubuntu, sans-serif'}}>
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder-gray-600"
                    placeholder="johndoe"
                    style={{fontFamily: 'Ubuntu, sans-serif'}}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-2.5 uppercase tracking-wide font-medium" style={{fontFamily: 'Ubuntu, sans-serif'}}>
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-12 py-3.5 text-white text-sm focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all placeholder-gray-600"
                    placeholder="••••••••"
                    style={{fontFamily: 'Ubuntu, sans-serif'}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-gray-400 hover:text-white transition-colors hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-white to-gray-100 text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-wider hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-[1.02] mt-6 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                style={{fontFamily: 'Ubuntu, sans-serif'}}
              >
                <span className="relative z-10">
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Terms */}
            {!isLogin && (
              <p className="text-xs text-gray-500 text-center mt-6 animate-fade-in leading-relaxed">
                By signing up, you agree to our{' '}
                <button className="text-gray-300 hover:text-white transition-colors underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-gray-300 hover:text-white transition-colors underline">
                  Privacy Policy
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-600 space-y-2">
          <p>© 2024 Nexus. All rights reserved.</p>
          <div className="flex justify-center gap-4 text-gray-500">
            <button className="hover:text-white transition-colors">Help</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Contact</button>
            <span>•</span>
            <button className="hover:text-white transition-colors">Privacy</button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 100px;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
