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

export function isSuperAdminUser(user?: { email?: string; role?: string } | null): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  return email === 'rishinehra1@gmail.com' || user.role === 'superadmin';
}

export function getUserRoleDisplay(user?: { email?: string; role?: string } | null): { label: string; tagClass: string } {
  if (!user) return { label: 'Guest', tagClass: 'bg-slate-100 text-slate-700' };
  if (isSuperAdminUser(user)) {
    return { label: '👑 Super Admin', tagClass: 'bg-purple-100 text-purple-800 border border-purple-200' };
  }
  if (user.role === 'admin') {
    return { label: '🛡️ Admin', tagClass: 'bg-blue-100 text-blue-800 border border-blue-200' };
  }
  return { label: '💼 Agent', tagClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
}

export function getDefaultAvatar(name: string, role?: string): string {
  const cleanName = (name || 'User').trim();
  const safeName = encodeURIComponent(cleanName);
  const bg = role === 'admin' || role === 'superadmin' ? '1d4ed8' : '0d9488'; // Vibrant Blue for Admin, Emerald for Agent
  return `https://ui-avatars.com/api/?name=${safeName}&background=${bg}&color=ffffff&bold=true&size=160&font-size=0.38`;
}

export function compressImageFile(file: File, maxSize = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = img.width;
        const height = img.height;

        // Crop to square aspect ratio from center
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = Math.min(minDim, maxSize);
        canvas.height = Math.min(minDim, maxSize);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

