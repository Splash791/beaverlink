import { createContext, useContext } from 'react'

export interface ToastOptions {
  /** Marks the toast as a demo-only mock action. */
  demo?: boolean
}

export interface ToastApi {
  show: (message: string, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastApi | undefined>(undefined)

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used within a ToastProvider')
  return api
}
