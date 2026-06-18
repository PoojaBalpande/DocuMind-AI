'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { mockApiKeys } from '@/lib/mockData';
import Footer from '@/components/layout/Footer';

const tabs = ['AI Settings', 'General', 'Security', 'API Keys', 'Notifications', 'Billing'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('AI Settings');
  const { user } = useAuthStore();
  const { settings, isLoading, error, fetchSettings, updateSettings, resetSettings } = useSettingsStore();

  // Local form state for AI Settings
  const [modelName, setModelName] = useState('qwen2.5');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [retrievalTopK, setRetrievalTopK] = useState(5);
  const [defaultScope, setDefaultScope] = useState('workspace');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Existing tab state (preserved)
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync local form state when settings load
  useEffect(() => {
    if (settings) {
      setModelName(settings.model_name);
      setTemperature(settings.temperature);
      setMaxTokens(settings.max_tokens);
      setRetrievalTopK(settings.retrieval_top_k);
      setDefaultScope(settings.default_scope);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const success = await updateSettings({
      model_name: modelName,
      temperature: Number(temperature),
      max_tokens: Number(maxTokens),
      retrieval_top_k: Number(retrievalTopK),
      default_scope: defaultScope as 'workspace' | 'current_document' | 'selected_documents',
    });
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset all AI settings to defaults?')) return;
    await resetSettings();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex-1 p-lg md:p-xl space-y-xl max-w-[1100px]">
        {/* Header */}
        <div>
          <h1 className="text-headline-lg text-primary mb-xs" style={{ fontFamily: 'Inter', fontWeight: 700 }}>Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your account preferences, security credentials, and API access.</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-outline-variant/30">
          <div className="flex gap-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-md px-xs text-body-md font-medium whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}

        {/* ── V9: AI Settings Tab ── */}
        {activeTab === 'AI Settings' && (
          <div className="space-y-xl">
            {error && (
              <div className="bg-errorContainer text-error p-md rounded-xl border border-error/20 text-body-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {isLoading && !settings ? (
              <div className="flex items-center justify-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin mr-sm">sync</span>
                Loading settings...
              </div>
            ) : (
              <>
                {/* Model Configuration */}
                <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
                  <div className="flex items-center gap-md mb-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary-container">smart_toy</span>
                    </div>
                    <div>
                      <h3 className="text-headline-sm text-primary font-semibold">Model Configuration</h3>
                      <p className="text-body-sm text-on-surface-variant">Configure the AI model used for document analysis.</p>
                    </div>
                  </div>

                  <div className="space-y-lg">
                    {/* Model Name */}
                    <div>
                      <label className="text-body-sm text-primary font-medium mb-xs block">Model</label>
                      <select
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      >
                        <option value="qwen2.5">Qwen 2.5</option>
                        <option value="qwen3:8b">Qwen 3 (8B)</option>
                        <option value="qwen2.5-coder:7b">Qwen 2.5 Coder (7B)</option>
                        <option value="llama3">Llama 3</option>
                        <option value="deepseek-r1">DeepSeek R1</option>
                      </select>
                    </div>

                    {/* Temperature */}
                    <div>
                      <div className="flex justify-between items-center mb-xs">
                        <label className="text-body-sm text-primary font-medium">Temperature</label>
                        <span className="text-label-md text-on-surface-variant font-mono">{temperature.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="2.0"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-full h-2 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-secondary"
                      />
                      <div className="flex justify-between text-label-md text-on-surface-variant mt-xs">
                        <span>0.0 — Deterministic</span>
                        <span>2.0 — Creative</span>
                      </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <label className="text-body-sm text-primary font-medium mb-xs block">Max Tokens</label>
                      <input
                        type="number"
                        min={100}
                        max={8000}
                        step={100}
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      />
                      <p className="text-label-md text-on-surface-variant mt-xs">Range: 100 – 8000</p>
                    </div>
                  </div>
                </div>

                {/* Retrieval Configuration */}
                <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
                  <div className="flex items-center gap-md mb-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary-container">manage_search</span>
                    </div>
                    <div>
                      <h3 className="text-headline-sm text-primary font-semibold">Retrieval Configuration</h3>
                      <p className="text-body-sm text-on-surface-variant">Control how documents are searched and retrieved.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    {/* Top-K */}
                    <div>
                      <label className="text-body-sm text-primary font-medium mb-xs block">Retrieval Top-K</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={retrievalTopK}
                        onChange={(e) => setRetrievalTopK(Number(e.target.value))}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      />
                      <p className="text-label-md text-on-surface-variant mt-xs">Number of document chunks retrieved (1–20)</p>
                    </div>

                    {/* Default Scope */}
                    <div>
                      <label className="text-body-sm text-primary font-medium mb-xs block">Default Scope</label>
                      <select
                        value={defaultScope}
                        onChange={(e) => setDefaultScope(e.target.value)}
                        className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                      >
                        <option value="workspace">Workspace (All Documents)</option>
                        <option value="current_document">Current Document</option>
                        <option value="selected_documents">Selected Documents</option>
                      </select>
                      <p className="text-label-md text-on-surface-variant mt-xs">Default document search scope for new chats</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-md">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="primary-gradient text-on-primary px-xl py-sm rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-sm disabled:opacity-60"
                  >
                    {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                    Save Changes
                  </button>
                  <button
                    onClick={handleResetDefaults}
                    className="bg-surface-container border border-outline-variant/30 px-xl py-sm rounded-xl text-body-sm font-medium hover:bg-surface-dim transition-colors"
                  >
                    Reset Defaults
                  </button>
                  {saveSuccess && (
                    <span className="text-body-sm text-secondary font-medium flex items-center gap-xs ml-sm">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Settings saved successfully
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'General' && (
          <div className="space-y-xl">
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
              <h3 className="text-headline-sm text-primary font-semibold mb-xl">Profile Information</h3>
              <div className="flex items-center gap-xl mb-xl">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-outline-variant object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-surface-dim flex items-center justify-center text-headline-md font-bold text-primary">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <button className="bg-surface-container border border-outline-variant/30 px-md py-sm rounded-xl text-body-sm font-medium hover:bg-surface-dim transition-colors">
                  Change Photo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label className="text-body-sm text-primary font-medium mb-xs block">First Name</label>
                  <input defaultValue={user?.firstName} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                </div>
                <div>
                  <label className="text-body-sm text-primary font-medium mb-xs block">Last Name</label>
                  <input defaultValue={user?.lastName} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-body-sm text-primary font-medium mb-xs block">Email</label>
                  <input defaultValue={user?.email} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                </div>
              </div>
              <button className="mt-xl primary-gradient text-on-primary px-xl py-sm rounded-xl font-semibold hover:shadow-lg transition-all">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="space-y-xl">
            {/* Two-Factor Authentication */}
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-lg">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container">shield_lock</span>
                  </div>
                  <div>
                    <h3 className="text-headline-sm text-primary font-semibold">Two-Factor Authentication</h3>
                    <p className="text-body-sm text-on-surface-variant">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${twoFaEnabled ? 'bg-secondary' : 'bg-outline-variant'}`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow ${twoFaEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              {twoFaEnabled && (
                <div className="mt-lg bg-secondary/5 p-md rounded-xl flex items-center gap-sm text-body-sm text-secondary border border-secondary/20">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Your account is currently protected by SMS-based authentication (+1 ••• ••• 4492).
                </div>
              )}
            </div>

            {/* Change Password + Active Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
              <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
                <h3 className="text-headline-sm text-primary font-semibold mb-xl">Change Password</h3>
                <div className="space-y-lg">
                  <div>
                    <label className="text-body-sm text-primary font-medium mb-xs block">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-body-sm text-primary font-medium mb-xs block">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white border border-outline-variant/30 rounded-xl py-md px-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none" />
                  </div>
                  <button className="primary-gradient text-on-primary px-xl py-sm rounded-xl font-semibold hover:shadow-lg transition-all">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
                <h3 className="text-headline-sm text-primary font-semibold mb-xl">Active Sessions</h3>
                <div className="space-y-lg">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant">computer</span>
                    <div className="flex-1">
                      <p className="text-body-sm text-primary font-semibold">MacBook Pro 16&quot;</p>
                      <p className="text-label-md text-on-surface-variant">San Francisco, CA • Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant">phone_iphone</span>
                    <div className="flex-1">
                      <p className="text-body-sm text-primary font-semibold">iPhone 15 Pro</p>
                      <p className="text-label-md text-on-surface-variant">San Francisco, CA • 2h ago</p>
                    </div>
                  </div>
                  <button className="w-full bg-surface-container border border-outline-variant/30 py-sm rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-dim transition-colors">
                    Revoke All Sessions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'API Keys' && (
          <div className="space-y-xl">
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
              <div className="flex justify-between items-center mb-xl">
                <h3 className="text-headline-sm text-primary font-semibold">API Keys</h3>
                <button className="primary-gradient text-on-primary px-lg py-sm rounded-xl font-semibold flex items-center gap-sm hover:shadow-lg transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span>Generate New Key
                </button>
              </div>
              <div className="space-y-md">
                {mockApiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-md bg-surface-container rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-secondary">key</span>
                      <div>
                        <p className="text-body-sm text-primary font-semibold">{key.name}</p>
                        <p className="text-label-md text-on-surface-variant font-mono">{key.keyPreview}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-lg">
                      <div className="text-right hidden sm:block">
                        <p className="text-label-md text-on-surface-variant">Last used: {key.lastUsed}</p>
                        <p className="text-label-md text-on-surface-variant">Created: {key.createdAt}</p>
                      </div>
                      <button className="text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 space-y-xl">
            <h3 className="text-headline-sm text-primary font-semibold">Notification Preferences</h3>
            {[
              { label: 'Email Notifications', desc: 'Receive email alerts for document processing and chat mentions', icon: 'mail', defaultOn: true },
              { label: 'Push Notifications', desc: 'Browser push notifications for real-time updates', icon: 'notifications_active', defaultOn: true },
              { label: 'Weekly Digest', desc: 'Receive a weekly summary of workspace activity', icon: 'summarize', defaultOn: false },
              { label: 'Security Alerts', desc: 'Get notified about login attempts and security events', icon: 'security', defaultOn: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-md border-b border-outline-variant/10 last:border-0">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
                  <div>
                    <p className="text-body-sm text-primary font-semibold">{item.label}</p>
                    <p className="text-label-md text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
                <button className={`relative w-12 h-6 rounded-full transition-colors ${item.defaultOn ? 'bg-secondary' : 'bg-outline-variant'}`}>
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow ${item.defaultOn ? 'translate-x-[26px]' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Billing' && (
          <div className="space-y-xl">
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
              <h3 className="text-headline-sm text-primary font-semibold mb-lg">Current Plan</h3>
              <div className="flex items-center justify-between p-lg bg-secondary/5 rounded-xl border border-secondary/20">
                <div>
                  <p className="text-headline-md text-primary font-bold">Precision Plan</p>
                  <p className="text-body-sm text-on-surface-variant">$29/month • Renews on Jan 15, 2025</p>
                </div>
                <button className="bg-surface-container border border-outline-variant/30 px-lg py-sm rounded-xl text-body-sm font-medium hover:bg-surface-dim transition-colors">
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
