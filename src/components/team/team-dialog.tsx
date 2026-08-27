'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types';
import { 
  X, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Check, 
  Edit2, 
  Plus, 
  AlertCircle, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface TeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamDialog({ isOpen, onClose }: TeamDialogProps) {
  const { users, currentUser, updateUserProfile, refreshTeam } = useLMS();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'salesperson'>('salesperson');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
  };

  const handleStartEdit = (u: UserProfile) => {
    setEditingUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setPassword('');
    setIsAddingUser(true);
    setError('');
    setSuccessMsg('');
  };

  const handleStartAdd = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('salesperson');
    setPassword('');
    setIsAddingUser(true);
    setError('');
    setSuccessMsg('');
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
      setError('Please enter a valid 10-digit mobile number (e.g. 9876543210)');
      return;
    }

    // 1. Check for duplicate email in local team state
    const isEmailTakenLocal = users.some(
      (u) => u.email.toLowerCase() === trimmedEmail && u.id !== editingUserId
    );
    if (isEmailTakenLocal) {
      setError(`A team member with email "${email.trim()}" already exists in the team.`);
      return;
    }

    setLoading(true);

    try {
      if (editingUserId) {
        // Update user profile
        const res = await updateUserProfile(editingUserId, {
          name: trimmedName,
          phone: trimmedPhone,
          role: role
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
        // Creating a new team member
        if (!password || password.length < 6) {
          setError('Please set an initial login password of at least 6 characters for the new member');
          setLoading(false);
          return;
        }

        if (isSupabaseConfigured) {
          // 2. Check for duplicate email in Supabase profiles database table
          const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', trimmedEmail);

          if (existingProfiles && existingProfiles.length > 0) {
            setError(`A team member with email "${email.trim()}" is already registered in the system.`);
            setLoading(false);
            return;
          }

          // Use an isolated non-persisting client so the Admin's active login session is not replaced
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
              data: {
                full_name: trimmedName,
                role: role,
                phone: trimmedPhone || null
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

          // Supabase security returns empty identities if user already exists
          if (authData?.user && authData.user.identities && authData.user.identities.length === 0) {
            setError(`A user with email "${email.trim()}" already exists in the system.`);
            setLoading(false);
            return;
          }

          if (authData?.user) {
            const { error: profileErr } = await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: trimmedName,
              email: trimmedEmail,
              role: role,
              phone: trimmedPhone || null,
              avatar_url: role === 'admin' ? '/admin-avatar.png' : '/agent-avatar.png'
            });

            if (profileErr) throw profileErr;
          }

          await refreshTeam();
        }

        setSuccessMsg(`✓ New ${role === 'admin' ? 'Admin' : 'Team Agent'} "${trimmedName}" created successfully!`);
        setTimeout(() => {
          setIsAddingUser(false);
          setEditingUserId(null);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Team & WhatsApp Settings</h3>
              <p className="text-xs text-slate-500">Manage Admins, Team Agents & direct WhatsApp mobile numbers</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
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

          {/* Add / Edit Form */}
          {isAddingUser ? (
            <form onSubmit={handleSaveUser} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingUserId ? 'Edit Team Member / Phone Number' : '+ Add New Team Member'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Back to List
                </button>
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
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 10-digit WhatsApp Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Mobile Number * <span className="text-emerald-600 font-semibold">(Mandatory for Alerts)</span>
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
                      className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-3 py-2 text-xs text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Lead alerts & 1-tap WhatsApp notifications will be sent here</p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Access Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="salesperson">💼 Team Agent (Only assigned leads)</option>
                    <option value="admin">👑 Admin (Full access, CSV & team management)</option>
                  </select>
                </div>
              </div>

              {/* Password field only when creating new member */}
              {!editingUserId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Login Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters (e.g. Agent@123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {loading ? 'Saving...' : editingUserId ? 'Save Profile Changes' : 'Create & Add Member'}
                </button>
              </div>
            </form>
          ) : (
            /* Team Members List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Team ({users.length})
                </span>
                {isAdmin && (
                  <button
                    onClick={handleStartAdd}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Member</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {users.map((u) => {
                  const isUserAdmin = u.role === 'admin';
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <div
                      key={u.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
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
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {u.email}
                            </span>
                            <span className="flex items-center gap-1 font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {u.phone ? `+91 ${u.phone}` : 'No WhatsApp number'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button (Admin can edit all, agent can edit self) */}
                      {(isAdmin || isSelf) && (
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit Phone / Info</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
