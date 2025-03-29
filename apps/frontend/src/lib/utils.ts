import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBackendUrl() {
  return import.meta.env.VITE_BACKEND_URL
}

export function getChatUrl() {
  return `${getBackendUrl()}/api/chat`
}