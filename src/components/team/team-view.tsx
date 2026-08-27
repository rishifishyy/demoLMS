'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Edit2, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck,
  Building,
  Key,
  Trash2,
  Download,
  UserMinus,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Eye,
  EyeOff,
  Camera,
  Lock
} from 'lucide-react';
import { getDefaultAvatar, compressImageFile } from '@/lib/utils';

export function TeamManagementView() {
  const { 
    users, 
    leads, 
    currentUser, 
    updateUserProfile, 
    deleteUserAndReassignLeads, 
    exportAgentLeadsCSV, 
    refreshTeam 
  } = useLMS();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [offboardingUser, setOffboardingUser] = useState<UserProfile | null>(null);
  const [reassignToUserId, setReassignToUserId] = useState<string>('');
  const [isOffboarding, setIsOffboarding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'salesperson'>('salesperson');
  const [avatar, setAvatar] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const compressed = await compressImageFile(file, 256, 0.85);
      setAvatar(compressed);
    } catch (err) {
      console.error('Photo processing error:', err);
      setError('Could not process the selected photo. Please try a different image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleStartEdit = (u: UserProfile) => {
    setOffboardingUser(null);
    setEditingUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setAvatar(u.avatar && !u.avatar.includes('ui-avatars.com') ? u.avatar : '');
    setPassword('');
    setIsAddingUser(true);
    setError('');
    setSuccessMsg('');
  };

  const handleStartAdd = () => {
    setOffboardingUser(null);
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('salesperson');
    setAvatar('');
    setPassword('');
    setIsAddingUser(true);
    setError('');
    setSuccessMsg('');
  };

  const handleStartOffboarding = (u: UserProfile) => {
    setIsAddingUser(false);
    setOffboardingUser(u);
    const otherMember = users.find(other => other.id !== u.id);
    setReassignToUserId(otherMember?.id || '');
    setError('');
    setSuccessMsg('');
  };

  const handleConfirmOffboarding = async () => {
    if (!offboardingUser) return;
    setIsOffboarding(true);
    setError('');

    const res = await deleteUserAndReassignLeads(
      offboardingUser.id,
      reassignToUserId || null
    );

    setIsOffboarding(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccessMsg(`✓ Successfully removed ${offboardingUser.name} and transferred leads!`);
    setOffboardingUser(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Please enter full name');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Email address is mandatory for login and receiving lead notifications.');
      return;
    }

    if (!trimmedPhone) {
      setError('WhatsApp Mobile number is mandatory so team members can receive 1-tap lead updates.');
      return;
    }

    if (trimmedPhone.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp phone number (e.g. 9876543210)');
      return;
    }

    // Check duplicate in local team state
    const isEmailTakenLocal = users.some(
      (u) => u.email.toLowerCase() === trimmedEmail && u.id !== editingUserId
    );
    if (isEmailTakenLocal) {
      setError(`A team member with email "${email.trim()}" already exists in the team.`);
      return;
    }

    setLoading(true);

    try {
      const finalAvatar = avatar || getDefaultAvatar(trimmedName, role);

      if (editingUserId) {
        // Update user profile
        const res = await updateUserProfile(editingUserId, {
          name: trimmedName,
          phone: trimmedPhone,
          role: role,
          avatar: finalAvatar
        });

        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        setSuccessMsg(`✓ Successfully updated profile for ${trimmedName}!`);
        setTimeout(() => {
          setIsAddingUser(false);
          setEditingUserId(null);
        }, 1000);
      } else {
        // Add new member
        if (!password || password.length < 6) {
          setError('Please set an initial login password of at least 6 characters for the new member');
          setLoading(false);
          return;
        }

        if (isSupabaseConfigured) {
          const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', trimmedEmail);

          if (existingProfiles && existingProfiles.length > 0) {
            setError(`A team member with email "${email.trim()}" is already registered in the system.`);
            setLoading(false);
            return;
          }

          const { createClient } = await import('@supabase/supabase-js');
          const authClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
              }
            }
          );

          const { data: authData, error: signupErr } = await authClient.auth.signUp({
            email: trimmedEmail,
            password: password,
            options: {
              emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://happy-lms.vercel.app/login',
              data: {
                full_name: trimmedName,
                role: role,
                phone: trimmedPhone || null,
                avatar_url: finalAvatar
              }
            }
          });

          if (signupErr) {
            if (signupErr.message.toLowerCase().includes('already registered') || signupErr.message.toLowerCase().includes('already exists')) {
              setError(`A user with email "${email.trim()}" already exists in Supabase Auth.`);
              setLoading(false);
              return;
            }
            throw signupErr;
          }

          if (authData?.user && authData.user.identities && authData.user.identities.length === 0) {
            setError(`A user with email "${email.trim()}" already exists in the system.`);
            setLoading(false);
            return;
          }

          if (authData?.user) {
            // First attempt with authClient (using new user credentials if auto-confirmed)
            const clientToUse = authData.session ? authClient : supabase;
            const { error: profileErr } = await clientToUse.from('profiles').upsert({
              id: authData.user.id,
              full_name: trimmedName,
              email: trimmedEmail,
              role: role,
              phone: trimmedPhone || null,
              avatar_url: finalAvatar
            });

            if (profileErr) {
              // Fallback to main client
              const { error: fallbackErr } = await supabase.from('profiles').upsert({
                id: authData.user.id,
                full_name: trimmedName,
                email: trimmedEmail,
                role: role,
                phone: trimmedPhone || null,
                avatar_url: finalAvatar
              });
              if (fallbackErr) throw fallbackErr;
            }
          }

          await refreshTeam();

          // Trigger Welcome Email in background
          fetch('/api/welcome-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: trimmedName,
              email: trimmedEmail,
              role: role,
              phone: trimmedPhone,
              password: password
            })
          }).catch((e) => console.warn('Welcome email error:', e));
        }

        setSuccessMsg(`✓ New ${role === 'admin' ? 'Admin' : 'Team Agent'} "${trimmedName}" created! Welcome email sent to ${trimmedEmail}.`);
        setTimeout(() => {
          setIsAddingUser(false);
          setEditingUserId(null);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Team & WhatsApp Settings</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure phone numbers for 1-tap WhatsApp lead alerts and manage team member access.
          </p>
        </div>

        {isAdmin && !isAddingUser && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Team Member</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form or Offboarding or List */}
      {offboardingUser ? (
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <UserMinus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Offboard & Remove Member: <span className="text-rose-700">{offboardingUser.name}</span>
                </h4>
                <p className="text-[11px] text-slate-500">Back up their assigned leads and reassign them before removing.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOffboardingUser(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {(() => {
            const userLeads = leads.filter(l => !l.isArchived && l.assignedTo === offboardingUser.id);
            return (
              <div className="space-y-4">
                {/* Backup Leads Banner */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        📊 {offboardingUser.name} has <span className="text-blue-600 underline font-black">{userLeads.length} active leads</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Download an offline CSV file backup containing all customer names, phone numbers, and call remarks.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportAgentLeadsCSV(offboardingUser.id)}
                    disabled={userLeads.length === 0}
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Leads Backup (CSV)</span>
                  </button>
                </div>

                {/* Transfer Leads Selection */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                  <label className="block text-xs font-bold text-slate-700">
                    Transfer all {userLeads.length} leads to:
                  </label>
                  <select
                    value={reassignToUserId}
                    onChange={(e) => setReassignToUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">⚪ Leave Leads Unassigned</option>
                    {users
                      .filter(u => u.id !== offboardingUser.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.id === currentUser?.id ? `👑 You (${u.name} - Admin)` : `👤 ${u.name} (${u.role === 'admin' ? 'Admin' : 'Agent'})`}
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    The selected team member will immediately see all {userLeads.length} leads in their dashboard and calling list.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOffboardingUser(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isOffboarding}
                    onClick={handleConfirmOffboarding}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isOffboarding ? 'Removing...' : 'Confirm & Remove Member'}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : isAddingUser ? (
        <form onSubmit={handleSaveUser} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              {editingUserId ? 'Edit Profile & WhatsApp Mobile Number' : '+ Register New Team Member'}
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          {/* Profile Photo Uploader & Preview */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="relative group shrink-0">
              <img
                src={avatar || getDefaultAvatar(name || 'Member', role)}
                alt="Profile Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs bg-slate-200"
              />
              <label className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h5 className="text-xs font-bold text-slate-800">Profile Photo</h5>
                <span className="text-[10px] font-semibold text-slate-400">
                  {avatar ? '(Custom Photo Uploaded)' : '(Auto Initials Default)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">Upload a photo from your phone/computer or use default icon</p>
              
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer transition-all">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{uploadingPhoto ? 'Processing...' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 cursor-pointer"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address * <span className="text-blue-600 font-semibold">(Mandatory for Login & Alerts)</span>
              </label>
              <input
                type="email"
                required
                disabled={!!editingUserId}
                placeholder="e.g. rohan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Mobile Number * <span className="text-emerald-600 font-bold">(Mandatory for Alerts)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2.5 text-xs text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Lead alerts & 1-tap WhatsApp notifications will open this number</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Access Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="salesperson">💼 Team Agent (Only assigned leads)</option>
                <option value="admin">👑 Admin (Full company access)</option>
              </select>
            </div>
          </div>

          {!editingUserId && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters (e.g. Agent@123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading ? 'Saving...' : editingUserId ? 'Save Profile Changes' : 'Create & Add Member'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => {
            const isUserAdmin = u.role === 'admin';
            const isSelf = u.id === currentUser?.id;
            const canEdit = isSelf || (isAdmin && !isUserAdmin);
            const canDelete = isAdmin && !isSelf && !isUserAdmin;
            const memberLeadsCount = leads.filter(l => !l.isArchived && l.assignedTo === u.id).length;

            return (
              <div
                key={u.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{u.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isUserAdmin
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isUserAdmin ? 'Admin' : 'Agent'}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {memberLeadsCount} Leads
                      </span>
                    </div>

                    <div className="space-y-1 mt-2 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-mono font-bold text-emerald-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{u.phone ? `+91 ${u.phone}` : 'No WhatsApp number set'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {u.phone ? '✓ Ready for 1-tap alerts' : '⚠️ Add WhatsApp number'}
                  </span>
                  
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                    {/* 1-Tap WhatsApp Welcome / Login Invitation */}
                    {isAdmin && u.phone && (
                      <a
                        href={`https://wa.me/91${u.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                          `🎉 *WELCOME TO HAPPYLMS CRM*\n\nHello *${u.name}*,\n\nYou have been added to HappyLMS CRM as a *${u.role === 'admin' ? 'Admin' : 'Team Agent'}*!\n\n🔗 *Login Portal:* https://happy-lms.vercel.app/login\n📧 *Email:* ${u.email}\n📱 *WhatsApp Number:* +91 ${u.phone}\n\nLog in now to view your assigned leads and manage property inquiries.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Send Login Portal Link & Welcome Message via WhatsApp"
                        className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold py-2 px-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Invite / WA</span>
                      </a>
                    )}

                    {/* 1-Click Backup Leads Button */}
                    {memberLeadsCount > 0 && (
                      <button
                        type="button"
                        title="Download CSV backup of this agent's leads"
                        onClick={() => exportAgentLeadsCSV(u.id)}
                        className="inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-2 px-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Backup Leads</span>
                      </button>
                    )}

                    {/* Edit Button (Only self or admin editing agents) */}
                    {canEdit && (
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Offboard / Remove Button (Admin only on agents) */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleStartOffboarding(u)}
                        className="inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Remove</span>
                      </button>
                    )}

                    {/* Protected Admin indicator when another admin views */}
                    {isUserAdmin && !isSelf && (
                      <span className="inline-flex items-center justify-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold py-2 px-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Admin Protected</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
