import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import type { Application, WalletDoc } from "@/types"
import { initialApplications, initialWallet } from "@/data/mock"

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write errors (e.g. private browsing)
    }
  }, [key, value])
  return [value, setValue] as const
}

interface Toast {
  id: number
  message: string
}

interface AppDataContextValue {
  wallet: WalletDoc[]
  applications: Application[]
  addWalletDoc: (doc: Omit<WalletDoc, "id" | "status" | "updated"> & { id?: string }) => void
  markWalletVerified: (category: string, name: string) => void
  addApplication: (app: Application) => void
  toasts: Toast[]
  showToast: (message: string) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

const TODAY = "Jul 18, 2026"

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useLocalStorage<WalletDoc[]>("ekaratig.wallet", initialWallet)
  const [applications, setApplications] = useLocalStorage<Application[]>("ekaratig.applications", initialApplications)
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200)
  }, [])

  const markWalletVerified = useCallback((category: string, name: string) => {
    setWallet((prev) =>
      prev.map((d) =>
        d.category === category ? { ...d, status: "verified", name, updated: TODAY } : d
      )
    )
  }, [setWallet])

  const addWalletDoc: AppDataContextValue["addWalletDoc"] = useCallback((doc) => {
    setWallet((prev) => {
      const exists = prev.find((d) => d.category === doc.category)
      if (exists) {
        return prev.map((d) =>
          d.category === doc.category ? { ...d, name: doc.name, status: "verified", updated: TODAY } : d
        )
      }
      return [...prev, { id: `w${Date.now()}`, name: doc.name, category: doc.category, status: "verified", updated: TODAY }]
    })
  }, [setWallet])

  const addApplication = useCallback((app: Application) => {
    setApplications((prev) => [app, ...prev])
  }, [setApplications])

  const value = useMemo(
    () => ({ wallet, applications, addWalletDoc, markWalletVerified, addApplication, toasts, showToast }),
    [wallet, applications, addWalletDoc, markWalletVerified, addApplication, toasts, showToast]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider")
  return ctx
}
