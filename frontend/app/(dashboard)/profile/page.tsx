'use client';

import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import Footer from '@/components/layout/Footer';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex-1 p-lg md:p-xl space-y-xl max-w-[900px]">
        {/* Header */}
        <div>
          <h1 className="text-headline-lg text-primary mb-xs" style={{ fontFamily: 'Inter', fontWeight: 700 }}>Profile</h1>
          <p className="text-body-md text-on-surface-variant">Manage your personal information and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
          {/* Banner */}
          <div className="h-32 primary-gradient relative">
            <div className="absolute -bottom-12 left-xl">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-surface-container-lowest object-cover shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-surface-container-lowest bg-surface-dim flex items-center justify-center text-headline-md font-bold text-primary shadow-xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
            </div>
          </div>

          <div className="pt-16 pb-xl px-xl">
            <div className="flex items-start justify-between mb-xl">
              <div>
                <h2 className="text-headline-md text-primary font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-body-md text-on-surface-variant">{user?.email}</p>
                <div className="flex gap-sm mt-sm">
                  <span className="px-md py-xs bg-primary/5 border border-primary/20 rounded-full text-label-md font-semibold text-primary capitalize">{user?.role}</span>
                  <span className="px-md py-xs bg-secondary/5 border border-secondary/20 rounded-full text-label-md font-semibold text-secondary capitalize">{user?.subscriptionTier} Plan</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-sm px-lg py-sm rounded-xl font-semibold transition-all ${
                  isEditing ? 'primary-gradient text-on-primary' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{isEditing ? 'save' : 'edit'}</span>
                {isEditing ? 'Save' : 'Edit Profile'}
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div>
                <label className="text-body-sm text-on-surface-variant font-medium mb-xs block">First Name</label>
                {isEditing ? (
                  <input defaultValue={user?.firstName} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                ) : (
                  <p className="text-body-md text-primary font-medium py-md">{user?.firstName}</p>
                )}
              </div>
              <div>
                <label className="text-body-sm text-on-surface-variant font-medium mb-xs block">Last Name</label>
                {isEditing ? (
                  <input defaultValue={user?.lastName} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                ) : (
                  <p className="text-body-md text-primary font-medium py-md">{user?.lastName}</p>
                )}
              </div>
              <div>
                <label className="text-body-sm text-on-surface-variant font-medium mb-xs block">Company</label>
                {isEditing ? (
                  <input defaultValue={user?.company} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                ) : (
                  <p className="text-body-md text-primary font-medium py-md">{user?.company || '—'}</p>
                )}
              </div>
              <div>
                <label className="text-body-sm text-on-surface-variant font-medium mb-xs block">Company Size</label>
                {isEditing ? (
                  <select defaultValue={user?.companySize} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none">
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-250">51-250</option>
                    <option value="251-1000">251-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                ) : (
                  <p className="text-body-md text-primary font-medium py-md">{user?.companySize || '—'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-body-sm text-on-surface-variant font-medium mb-xs block">Email Address</label>
                <p className="text-body-md text-primary font-medium py-md flex items-center gap-sm">
                  {user?.email}
                  {user?.isVerified && <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 text-center">
            <span className="material-symbols-outlined text-secondary text-[32px] mb-sm block">description</span>
            <p className="text-headline-md text-primary font-bold">6</p>
            <p className="text-label-md text-on-surface-variant">Documents</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 text-center">
            <span className="material-symbols-outlined text-secondary text-[32px] mb-sm block">forum</span>
            <p className="text-headline-md text-primary font-bold">4</p>
            <p className="text-label-md text-on-surface-variant">Chat Sessions</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 text-center">
            <span className="material-symbols-outlined text-secondary text-[32px] mb-sm block">calendar_month</span>
            <p className="text-headline-md text-primary font-bold">Jan 2024</p>
            <p className="text-label-md text-on-surface-variant">Member Since</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-error/5 rounded-2xl p-xl border border-error/20">
          <h3 className="text-headline-sm text-error font-semibold mb-sm">Danger Zone</h3>
          <p className="text-body-sm text-on-surface-variant mb-lg">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="bg-error text-on-error px-xl py-sm rounded-xl font-semibold hover:bg-error/90 transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
