'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, UserProfile, Project, LeadStatus, ActivityType } from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { getFollowupCategory } from './utils';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    name: 'Greenfield Meadows',
    location: 'Sector 84, Gurugram',
    type: 'Luxury Plots & Villas',
    priceRange: '₹1.25 Cr - ₹3.5 Cr'
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    name: 'Skyline Heights',
    location: 'Whitefield, Bengaluru',
    type: '3 & 4 BHK Luxury Condos',
    priceRange: '₹1.80 Cr - ₹2.90 Cr'
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    name: 'Godrej Palm Grove',
    location: 'Kandivali East, Mumbai',
    type: '2 & 3 BHK Premium Apartments',
    priceRange: '₹2.10 Cr - ₹4.20 Cr'
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    name: 'CyberTech Business Hub',
    location: 'HITEC City, Hyderabad',
    type: 'Commercial Office Spaces',
    priceRange: '₹85 Lakh - ₹5.0 Cr'
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    name: 'Serene Riverside',
    location: 'Wakad, Pune',
    type: 'Townhouses & 3 BHKs',
    priceRange: '₹95 Lakh - ₹1.65 Cr'
  }
];

interface LMSContextType {
  leads: Lead[];
  users: UserProfile[];
  projects: Project[];
  currentUser: UserProfile | null;
  activeTab: 'dashboard' | 'leads' | 'queue' | 'reports';
  searchQuery: string;
  filterStatus: string;
  filterProject: string;
  filterSource: string;
  filterSalesperson: string;
  filterFollowup: string;
  sortBy: string;
  selectedLeadId: string | null;
  quickLogLeadId: string | null;
  isNewLeadModalOpen: boolean;
  isDrawerOpen: boolean;
  isQuickLogOpen: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;

  setActiveTab: (tab: 'dashboard' | 'leads' | 'queue' | 'reports') => void;
  setSearchQuery: (q: string) => void;
  setFilterStatus: (s: string) => void;
  setFilterProject: (p: string) => void;
  setFilterSource: (src: string) => void;
  setFilterSalesperson: (sp: string) => void;
  setFilterFollowup: (fu: string) => void;
  setSortBy: (sb: string) => void;

  openLeadDrawer: (id: string) => void;
  closeLeadDrawer: () => void;
  openQuickLog: (id: string) => void;
  closeQuickLog: () => void;
  openNewLeadModal: () => void;
  closeNewLeadModal: () => void;

  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'isArchived' | 'lastContacted'>) => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus, note?: string) => Promise<void>;
  updateLeadAssignee: (leadId: string, userId: string) => Promise<void>;
  recordActivity: (leadId: string, activity: { type: ActivityType; details: string; newStatus?: LeadStatus; scheduledFollowup?: string | null }) => Promise<void>;
  archiveLead: (leadId: string) => Promise<void>;
  triggerCall: (leadId: string) => void;
  triggerWhatsApp: (leadId: string) => void;
  exportCSV: () => void;

  getFilteredLeads: () => Lead[];
  getMetrics: () => {
    total: number;
    new: number;
    interested: number;
    notPicked: number;
    visitDone: number;
    notInterested: number;
    junk: number;
    todayFollowups: number;
    overdueFollowups: number;
  };
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export function LMSProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'queue' | 'reports'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterSalesperson, setFilterSalesperson] = useState('ALL');
  const [filterFollowup, setFilterFollowup] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [quickLogLeadId, setQuickLogLeadId] = useState<string | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // Sync Supabase Auth session
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const authedUser: UserProfile = {
              id: session.user.id,
              name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: profile?.role === 'admin' ? 'admin' : 'salesperson',
              phone: profile?.phone || '',
              avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
            };

            if (mounted) {
              setCurrentUser(authedUser);
              setIsAuthenticated(true);
            }
          } else {
            if (mounted) {
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (e) {
          console.error('Session check error:', e);
        }
      }
      if (mounted) setAuthLoading(false);
    };

    checkSession();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const authedUser: UserProfile = {
            id: session.user.id,
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: profile?.role === 'admin' ? 'admin' : 'salesperson',
            phone: profile?.phone || '',
            avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
          };

          if (mounted) {
            setCurrentUser(authedUser);
            setIsAuthenticated(true);
            setAuthLoading(false);
          }
        } else {
          if (mounted) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setAuthLoading(false);
          }
        }
      });

      return () => {
        mounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Fetch leads and profiles
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCloudData = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: cloudLeads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
          if (cloudLeads) {
            setLeads(cloudLeads.map((cl: any) => ({
              id: cl.lead_code || cl.id,
              name: cl.name,
              mobile: cl.mobile,
              whatsapp: cl.whatsapp || cl.mobile,
              projectId: cl.project_id || 'a1b2c3d4-0001-4000-8000-000000000001',
              source: cl.source,
              assignedTo: cl.assigned_to || '',
              status: cl.status,
              lastContacted: cl.last_contacted,
              nextFollowup: cl.next_followup,
              latestRemark: cl.latest_remark || '',
              isArchived: cl.is_archived || false,
              createdAt: cl.created_at,
              updatedAt: cl.updated_at,
              timeline: []
            })));
          }

          const { data: cloudProfiles } = await supabase.from('profiles').select('*');
          if (cloudProfiles) {
            setUsers(cloudProfiles.map((p: any) => ({
              id: p.id,
              name: p.full_name,
              email: p.email,
              role: p.role,
              phone: p.phone || '',
              avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
            })));
          }
        } catch (e) {
          console.error('Error fetching Supabase data:', e);
        }
      }
    };

    fetchCloudData();
  }, [isAuthenticated]);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      if (data.user) {
        setIsAuthenticated(true);
        return {};
      }
    }
    return { error: 'Database connection failed' };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLeads([]);
  };

  const openLeadDrawer = (id: string) => {
    setSelectedLeadId(id);
    setIsDrawerOpen(true);
  };

  const closeLeadDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLeadId(null);
  };

  const openQuickLog = (id: string) => {
    setQuickLogLeadId(id);
    setIsQuickLogOpen(true);
  };

  const closeQuickLog = () => {
    setIsQuickLogOpen(false);
    setQuickLogLeadId(null);
  };

  const openNewLeadModal = () => setIsNewLeadModalOpen(true);
  const closeNewLeadModal = () => setIsNewLeadModalOpen(false);

  const getNextLeadId = () => {
    let max = 1000;
    leads.forEach(l => {
      const match = l.id.match(/^LD-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    });
    return 'LD-' + (max + 1);
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'isArchived' | 'lastContacted'>) => {
    const newId = getNextLeadId();
    const nowIso = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id: newId,
      lastContacted: null,
      isArchived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          id: 'ACT-' + newId + '-1',
          leadId: newId,
          userId: currentUser?.id || '',
          type: 'Status Change',
          details: 'Lead registered into system.',
          previousStatus: 'None',
          newStatus: leadData.status,
          timestamp: nowIso
        }
      ]
    };

    setLeads([newLead, ...leads]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('leads').insert({
          lead_code: newId,
          name: leadData.name,
          mobile: leadData.mobile,
          whatsapp: leadData.whatsapp,
          project_id: leadData.projectId,
          source: leadData.source,
          assigned_to: leadData.assignedTo,
          status: leadData.status,
          next_followup: leadData.nextFollowup,
          latest_remark: leadData.latestRemark
        });
      } catch (e) {
        console.error('Supabase insert lead error:', e);
      }
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, note?: string) => {
    const updated = leads.map(l => {
      if (l.id !== leadId) return l;
      const nowIso = new Date().toISOString();
      return {
        ...l,
        status,
        updatedAt: nowIso,
        timeline: [
          {
            id: 'ACT-' + l.id + '-' + Date.now(),
            leadId: l.id,
            userId: currentUser?.id || '',
            type: 'Status Change' as ActivityType,
            details: note || ('Status changed to ' + status),
            previousStatus: l.status,
            newStatus: status,
            timestamp: nowIso
          },
          ...l.timeline
        ]
      };
    });
    setLeads(updated);

    if (isSupabaseConfigured) {
      await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('lead_code', leadId);
    }
  };

  const updateLeadAssignee = async (leadId: string, userId: string) => {
    const updated = leads.map(l => {
      if (l.id !== leadId) return l;
      const nowIso = new Date().toISOString();
      return {
        ...l,
        assignedTo: userId,
        updatedAt: nowIso,
        timeline: [
          {
            id: 'ACT-' + l.id + '-' + Date.now(),
            leadId: l.id,
            userId: currentUser?.id || '',
            type: 'Assignment' as ActivityType,
            details: 'Reassigned to ' + (users.find(u => u.id === userId)?.name || 'agent'),
            previousStatus: l.status,
            newStatus: l.status,
            timestamp: nowIso
          },
          ...l.timeline
        ]
      };
    });
    setLeads(updated);

    if (isSupabaseConfigured) {
      await supabase.from('leads').update({ assigned_to: userId, updated_at: new Date().toISOString() }).eq('lead_code', leadId);
    }
  };

  const recordActivity = async (leadId: string, activity: { type: ActivityType; details: string; newStatus?: LeadStatus; scheduledFollowup?: string | null }) => {
    const updated = leads.map(l => {
      if (l.id !== leadId) return l;
      const nowIso = new Date().toISOString();
      return {
        ...l,
        status: activity.newStatus || l.status,
        lastContacted: nowIso,
        nextFollowup: activity.scheduledFollowup !== undefined ? activity.scheduledFollowup : l.nextFollowup,
        latestRemark: activity.details || l.latestRemark,
        updatedAt: nowIso,
        timeline: [
          {
            id: 'ACT-' + l.id + '-' + Date.now(),
            leadId: l.id,
            userId: currentUser?.id || '',
            type: activity.type,
            details: activity.details,
            previousStatus: l.status,
            newStatus: activity.newStatus || l.status,
            scheduledFollowup: activity.scheduledFollowup,
            timestamp: nowIso
          },
          ...l.timeline
        ]
      };
    });
    setLeads(updated);

    if (isSupabaseConfigured) {
      await supabase.from('leads').update({
        status: activity.newStatus,
        last_contacted: new Date().toISOString(),
        next_followup: activity.scheduledFollowup,
        latest_remark: activity.details,
        updated_at: new Date().toISOString()
      }).eq('lead_code', leadId);
    }
  };

  const archiveLead = async (leadId: string) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, isArchived: true, updatedAt: new Date().toISOString() } : l);
    setLeads(updated);
    closeLeadDrawer();

    if (isSupabaseConfigured) {
      await supabase.from('leads').update({ is_archived: true }).eq('lead_code', leadId);
    }
  };

  const triggerCall = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const cleanNumber = lead.mobile.replace(/\s+/g, '');
    window.location.href = 'tel:' + cleanNumber;
    setTimeout(() => {
      openQuickLog(leadId);
    }, 400);
  };

  const triggerWhatsApp = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const project = projects.find(p => p.id === lead.projectId)?.name || 'our property';
    const targetPhone = (lead.whatsapp || lead.mobile).replace(/[^0-9]/g, '');
    const defaultMsg = encodeURIComponent(
      'Hello ' + lead.name + ', this is ' + (currentUser?.name || 'our team') + ' regarding ' + project + '. How can I assist you with brochures and pricing today?'
    );
    window.open('https://wa.me/' + targetPhone + '?text=' + defaultMsg, '_blank');
    recordActivity(leadId, {
      type: 'WhatsApp',
      details: 'Sent WhatsApp message regarding ' + project + '.',
      newStatus: lead.status === 'New Lead' ? 'Interested' : lead.status
    });
  };

  const exportCSV = () => {
    const filtered = getFilteredLeads();
    const headers = ['Lead ID', 'Name', 'Mobile', 'WhatsApp', 'Project', 'Source', 'Assigned To', 'Status', 'Last Contacted', 'Next Followup', 'Latest Remark'];
    const rows = filtered.map(l => [
      '"' + l.id + '"',
      '"' + l.name.replace(/"/g, '""') + '"',
      '"' + l.mobile + '"',
      '"' + (l.whatsapp || '') + '"',
      '"' + (projects.find(p => p.id === l.projectId)?.name || '') + '"',
      '"' + l.source + '"',
      '"' + (users.find(u => u.id === l.assignedTo)?.name || '') + '"',
      '"' + l.status + '"',
      '"' + (l.lastContacted || '') + '"',
      '"' + (l.nextFollowup || '') + '"',
      '"' + (l.latestRemark || '').replace(/"/g, '""') + '"'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'HappyLMS_Leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredLeads = () => {
    const isSalesperson = currentUser?.role === 'salesperson';

    return leads.filter(lead => {
      if (lead.isArchived) return false;

      if (isSalesperson && filterSalesperson === 'ALL') {
        if (lead.assignedTo !== currentUser?.id) return false;
      } else if (filterSalesperson !== 'ALL' && lead.assignedTo !== filterSalesperson) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const pName = projects.find(p => p.id === lead.projectId)?.name.toLowerCase() || '';
        const match =
          lead.name.toLowerCase().includes(q) ||
          lead.mobile.toLowerCase().includes(q) ||
          lead.id.toLowerCase().includes(q) ||
          pName.includes(q);
        if (!match) return false;
      }

      if (filterStatus !== 'ALL' && lead.status !== filterStatus) return false;
      if (filterProject !== 'ALL' && lead.projectId !== filterProject) return false;
      if (filterSource !== 'ALL' && lead.source !== filterSource) return false;

      if (filterFollowup !== 'ALL') {
        const cat = getFollowupCategory(lead.nextFollowup);
        if (filterFollowup === 'TODAY' && cat !== 'today') return false;
        if (filterFollowup === 'OVERDUE' && cat !== 'overdue') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'lastContacted') return new Date(b.lastContacted || 0).getTime() - new Date(a.lastContacted || 0).getTime();
      if (sortBy === 'followup') {
        if (!a.nextFollowup) return 1;
        if (!b.nextFollowup) return -1;
        return new Date(a.nextFollowup).getTime() - new Date(b.nextFollowup).getTime();
      }
      return 0;
    });
  };

  const getMetrics = () => {
    const isSalesperson = currentUser?.role === 'salesperson';
    const base = leads.filter(l => {
      if (l.isArchived) return false;
      if (isSalesperson && l.assignedTo !== currentUser?.id) return false;
      return true;
    });

    return {
      total: base.length,
      new: base.filter(l => l.status === 'New Lead').length,
      interested: base.filter(l => l.status === 'Interested').length,
      notPicked: base.filter(l => l.status === 'Not Picked').length,
      visitDone: base.filter(l => l.status === 'Visit Done').length,
      notInterested: base.filter(l => l.status === 'Not Interested').length,
      junk: base.filter(l => l.status === 'Junk').length,
      todayFollowups: base.filter(l => getFollowupCategory(l.nextFollowup) === 'today').length,
      overdueFollowups: base.filter(l => getFollowupCategory(l.nextFollowup) === 'overdue').length
    };
  };

  return (
    <LMSContext.Provider
      value={{
        leads,
        users,
        projects,
        currentUser,
        activeTab,
        searchQuery,
        filterStatus,
        filterProject,
        filterSource,
        filterSalesperson,
        filterFollowup,
        sortBy,
        selectedLeadId,
        quickLogLeadId,
        isNewLeadModalOpen,
        isDrawerOpen,
        isQuickLogOpen,
        isAuthenticated,
        authLoading,
        setActiveTab,
        setSearchQuery,
        setFilterStatus,
        setFilterProject,
        setFilterSource,
        setFilterSalesperson,
        setFilterFollowup,
        setSortBy,
        openLeadDrawer,
        closeLeadDrawer,
        openQuickLog,
        closeQuickLog,
        openNewLeadModal,
        closeNewLeadModal,
        login,
        logout,
        createLead,
        updateLeadStatus,
        updateLeadAssignee,
        recordActivity,
        archiveLead,
        triggerCall,
        triggerWhatsApp,
        exportCSV,
        getFilteredLeads,
        getMetrics
      }}
    >
      {children}
    </LMSContext.Provider>
  );
}

export function useLMS() {
  const context = useContext(LMSContext);
  if (!context) throw new Error('useLMS must be used within an LMSProvider');
  return context;
}
