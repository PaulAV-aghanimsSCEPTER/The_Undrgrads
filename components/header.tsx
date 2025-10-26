"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Palette, Layers, Trash2, LogOut, FileDown } from "lucide-react"

interface HeaderProps {
  onAddOrder: () => void
  onAddDesign: () => void
  onAddColor: () => void
  onDeleteAll: () => void
  onViewTrash: () => void
  onLogout: () => void
  onExportPDF?: () => void
}

export default function Header({
  onAddOrder,
  onAddDesign,
  onAddColor,
  onDeleteAll,
  onViewTrash,
  onLogout,
  onExportPDF,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 sm:h-14 sm:w-14 object-contain" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">The Undergrads</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={onAddOrder}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            Add Order
          </Button>

          <Button
            onClick={onAddDesign}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm flex items-center gap-1"
          >
            <Layers className="w-4 h-4" />
            Add Design
          </Button>

          <Button
            onClick={onAddColor}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex items-center gap-1"
          >
            <Palette className="w-4 h-4" />
            Add Color
          </Button>

          <Button
            onClick={onViewTrash}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Trash2 className="w-4 h-4" />
            Trash
          </Button>

          <Button
            onClick={onDeleteAll}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </Button>

          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
