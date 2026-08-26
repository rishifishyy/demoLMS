import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'Never';
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return 'Invalid date';

  return dt.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Not set';
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return 'Invalid date';

  return dt.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return '';

  return dt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFollowupCategory(dateStr: string | null | undefined): 'overdue' | 'today' | 'upcoming' | 'none' {
  if (!dateStr) return 'none';
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 'none';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (target < startOfToday) return 'overdue';
  if (target >= startOfToday && target <= endOfToday) return 'today';
  return 'upcoming';
}
