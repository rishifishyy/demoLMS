/**
 * TypeScript Data Models for EstateFlow Real Estate LMS
 */

export type LeadStatus =
  | 'New Lead'
  | 'Interested'
  | 'Not Picked'
  | 'Visit Done'
  | 'Not Interested'
  | 'Junk';

export type LeadSource =
  | 'Meta Ads'
  | 'WhatsApp'
  | 'Website'
  | 'Referral'
  | 'Walk-in'
  | 'Google Ads'
  | 'Exhibition / Event'
  | 'Direct Call';

export type ActivityType =
  | 'Call'
  | 'WhatsApp'
  | 'Visit'
  | 'Remark'
  | 'Status Change'
  | 'Follow-up'
  | 'Assignment';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'salesperson';
  phone: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  priceRange: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  type: ActivityType;
  details: string;
  previousStatus?: string;
  newStatus?: string;
  scheduledFollowup?: string | null;
  timestamp: string;
}

export interface Lead {
  id: string; // e.g. LD-1001
  name: string;
  mobile: string;
  whatsapp: string;
  projectId: string;
  source: LeadSource;
  assignedTo: string; // User ID
  status: LeadStatus;
  lastContacted: string | null;
  nextFollowup: string | null;
  latestRemark: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  timeline: LeadActivity[];
}

export interface StatusConfigItem {
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  description: string;
}

export const STATUS_CONFIG: Record<LeadStatus, StatusConfigItem> = {
  'New Lead': {
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Newly received lead that has not yet been qualified/contacted.'
  },
  'Interested': {
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Customer has shown genuine interest in the property/project.'
  },
  'Not Picked': {
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Customer has not answered the call/contact attempt.'
  },
  'Visit Done': {
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Customer has completed a site/property visit.'
  },
  'Not Interested': {
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Customer has clearly declined or is not interested.'
  },
  'Junk': {
    color: '#64748b',
    bgColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    description: 'Invalid, duplicate, spam or otherwise unusable lead.'
  }
};

export const LEAD_SOURCES: LeadSource[] = [
  'Meta Ads',
  'WhatsApp',
  'Website',
  'Referral',
  'Walk-in',
  'Google Ads',
  'Exhibition / Event',
  'Direct Call'
];
