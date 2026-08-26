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
  Key
} from 'lucide-react';

export function TeamManagementView() {
  const { users, currentUser } = useLMS();

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

    if (!name.trim()) {
      setError('Please enter full name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (phone && phone.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }

    setLoading(true);

    try {
      if (editingUserId) {
        // Update user profile in Supabase
        if (isSupabaseConfigured) {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({
              full_name: name.trim(),
              phone: phone.trim() || null,
              role: role
            })
            .eq('id', editingUserId);

          if (updateErr) throw updateErr;
        }

        setSuccessMsg(`✓ Updated profile for ${name}! Reloading...`);
      } else {
        // Add new member
        if (isSupabaseConfigured) {
          if (!password || password.length < 6) {
            setError('Please set an initial password of at least 6 characters for the new member');
            setLoading(false);
            return;
          }

          const { data: authData, error: signupErr } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                name: name.trim(),
                role: role,
                phone: phone.trim() || null
              }
            }
          });

          if (signupErr) throw signupErr;

          if (authData?.user) {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: name.trim(),
              email: email.trim(),
              role: role,
              phone: phone.trim() || null,
              avatar_url: role === 'admin' ? '/admin-avatar.png' : '/agent-avatar.png'
            });
          }
        }

        setSuccessMsg(`✓ New ${role === 'admin' ? 'Admin' : 'Team Agent'} ${name} added successfully! Reloading...`);
      }

      setTimeout(() => {
        setIsAddingUser(false);
        setEditingUserId(null);
        window.location.reload();
      }, 1500);

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

      {/* Form or List */}
      {isAddingUser ? (
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
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
                WhatsApp Phone Number <span className="text-emerald-600 font-bold">(For 1-Tap Alerts)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2.5 text-xs text-slate-900 font-mono font-bold tracking-wider focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Lead alerts will open this exact number on WhatsApp</p>
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
              <input
                type="password"
                required
                placeholder="Min 6 characters (e.g. Agent@123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
              />
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

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {u.phone ? '✓ Ready for 1-tap alerts' : '⚠️ Add WhatsApp number'}
                  </span>
                  {(isAdmin || isSelf) && (
                    <button
                      onClick={() => handleStartEdit(u)}
                      className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Phone Number</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
