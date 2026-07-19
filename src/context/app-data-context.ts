import { createContext } from "react"
import type { Application, WalletDoc } from "@/types"

export interface Toast {
  id: number
  message: string
}

export interface AppDataContextValue {
  wallet: WalletDoc[]
  applications: Application[]
  addWalletDoc: (doc: Omit<WalletDoc, "id" | "status" | "updated"> & { id?: string }) => void
  markWalletVerified: (category: string, name: string) => void
  addApplication: (app: Application) => void
  toasts: Toast[]
  showToast: (message: string) => void
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
