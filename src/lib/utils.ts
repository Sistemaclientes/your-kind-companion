import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function hashString(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

export function buildStudentSlug(name: string, email: string) {
  const base = slugify(name || 'aluno');
  const hash = Math.abs(hashString(email || ''))
    .toString(36)
    .slice(0, 6);
  return `${base}-${hash}`;
}

export const STUDENT_SLUG_MAP_KEY = 'student_slug_map';

export function getStudentSlugMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STUDENT_SLUG_MAP_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function setStudentSlugMap(map: Record<string, string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STUDENT_SLUG_MAP_KEY, JSON.stringify(map));
}
