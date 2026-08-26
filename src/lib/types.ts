export type LeadStatus =
  | 'New Lead'
  | 'Interested'
  | 'Not Picked'
  | 'Visit Done'
  | 'Not Interested'
  | 'Junk';

export type LeadSource =
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'REFERRAL'
  | string;

export const LEAD_SOURCES: string[] = [
  'WHATSAPP',
  'INSTAGRAM',
  'REFERRAL',
  'OTHER'
];

export type ActivityType =
  | 'Call'
  | 'WhatsApp'
  | 'Visit'
  | 'Remark'
  | 'Status Change'
  | 'Follow-up'
  | 'Assignment';

export interface Activity {
  id: string;
  leadId: string;
  userId: string;
  type: ActivityType;
  details: string;
  previousStatus?: LeadStatus | 'None';
  newStatus?: LeadStatus;
  scheduledFollowup?: string | null;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  whatsapp?: string;
  projectId: string;
  source: string;
  assignedTo: string;
  status: LeadStatus;
  lastContacted: string | null;
  nextFollowup: string | null;
  latestRemark: string;
  timeline: Activity[];
  isArchived: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'salesperson';
  avatar: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  priceRange: string;
}

export interface StatusConfig {
  badgeClass: string;
  indicatorClass: string;
  borderClass: string;
  color: string;
}

export const STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  'New Lead': {
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    indicatorClass: 'bg-blue-600',
    borderClass: 'border-l-blue-600',
    color: '#2563eb'
  },
  'Interested': {
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indicatorClass: 'bg-emerald-600',
    borderClass: 'border-l-emerald-600',
    color: '#059669'
  },
  'Not Picked': {
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    indicatorClass: 'bg-amber-500',
    borderClass: 'border-l-amber-500',
    color: '#d97706'
  },
  'Visit Done': {
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    indicatorClass: 'bg-purple-600',
    borderClass: 'border-l-purple-600',
    color: '#7c3aed'
  },
  'Not Interested': {
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    indicatorClass: 'bg-slate-500',
    borderClass: 'border-l-slate-400',
    color: '#64748b'
  },
  'Junk': {
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    indicatorClass: 'bg-rose-600',
    borderClass: 'border-l-rose-600',
    color: '#e11d48'
  }
};
