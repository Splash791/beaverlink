import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './useToast'
import type { ToastOptions } from './useToast'

interface ToastItem {
  id: number
  message: string
  demo: boolean
}

const AUTO_DISMISS_MS = 4000

/** Lightweight toast stack with an accessible live region. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = nextId.current++
      setToasts((list) => [...list, { id, message, demo: options?.demo ?? false }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-lg"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-osu-tint text-osu-dark">
              <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 10.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{toast.message}</p>
              {toast.demo && (
                <p className="mt-0.5 text-xs text-stone-500">Demo only — no action taken.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded text-stone-400 hover:text-ink"
              aria-label="Dismiss notification"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6.2 6.2a1 1 0 011.4 0L10 8.6l2.4-2.4a1 1 0 111.4 1.4L11.4 10l2.4 2.4a1 1 0 01-1.4 1.4L10 11.4l-2.4 2.4a1 1 0 01-1.4-1.4L8.6 10 6.2 7.6a1 1 0 010-1.4z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
