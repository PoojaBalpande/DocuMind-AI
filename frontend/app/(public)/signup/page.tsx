'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup({
      firstName: firstName || 'John',
      lastName: lastName || 'Doe',
      email: email || 'john@company.com',
      password: password || 'password',
    });
    if (success) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex w-1/2 primary-gradient flex-col justify-center items-start px-margin-desktop relative overflow-hidden">
        <div className="relative z-10 max-w-[500px]">
          <h2 className="text-display text-white mb-md" style={{ fontFamily: 'Inter', fontWeight: 700 }}>DocuMind AI</h2>
          <p className="text-body-lg text-white/70 mb-xxl">
            Experience the next generation of document intelligence. Secure, fast, and engineered for enterprise precision.
          </p>
          <div className="bg-white/10 backdrop-blur-xl p-xl rounded-2xl border border-white/10 mb-xl">
            <div className="flex items-center gap-md mb-md">
              <span className="material-symbols-outlined text-secondary-fixed">verified</span>
              <h3 className="text-headline-sm text-white font-semibold">Trusted by Global Leaders</h3>
            </div>
            <p className="text-body-sm text-white/60">
              Over 500+ enterprises trust our cold-winter architecture for their sensitive data processing.
            </p>
          </div>
          <div className="flex gap-lg">
            <span className="material-symbols-outlined text-white/30 text-[32px]">verified</span>
            <span className="material-symbols-outlined text-white/30 text-[32px]">cloud</span>
            <span className="material-symbols-outlined text-white/30 text-[32px]">trending_up</span>
            <span className="material-symbols-outlined text-white/30 text-[32px]">auto_awesome</span>
          </div>
          <div className="mt-xxl rounded-2xl overflow-hidden shadow-2xl h-[200px] bg-surface-dim/20">
            <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-[60px] text-white/40">blur_on</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 bg-background flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-xxl">
        <div className="max-w-[560px] w-full">
          <h2 className="text-headline-md text-primary mb-xs" style={{ fontFamily: 'Inter', fontWeight: 600 }}>Create your account</h2>
          <p className="text-body-md text-on-surface-variant mb-lg">Join the workspace of the future today.</p>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-xl">
            <div className="flex gap-sm">
              <div className="step-active h-1.5 rounded-full transition-all"></div>
              <div className="step-inactive h-1.5 rounded-full transition-all"></div>
              <div className="step-inactive h-1.5 rounded-full transition-all"></div>
            </div>
            <span className="text-label-lg text-secondary font-semibold">Step 1 of 3: Account Details</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="text-body-sm text-primary font-medium mb-xs block">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-body-sm text-primary font-medium mb-xs block">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-body-sm text-primary font-medium mb-xs block">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-body-sm text-primary font-medium mb-xs block">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select range...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-250">51-250 employees</option>
                <option value="251-1000">251-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div>
              <label className="text-body-sm text-primary font-medium mb-xs block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg pr-xl text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary focus:outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-lg top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="primary-gradient text-on-primary text-body-md py-md rounded-xl font-semibold inner-glow shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-sm"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : null}
              Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-lg">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"></div></div>
            <div className="relative flex justify-center"><span className="bg-background px-lg text-label-lg text-on-surface-variant uppercase">or sign up with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <button className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-md flex items-center justify-center gap-sm text-body-md font-medium hover:bg-surface-container transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-md flex items-center justify-center gap-sm text-body-md font-medium hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined">key</span>
              SSO
            </button>
          </div>

          <p className="text-body-md text-on-surface-variant mt-xl text-center">
            Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log In</Link>
          </p>

          <div className="mt-xxl flex gap-lg justify-center text-label-md text-on-surface-variant">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Security</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
