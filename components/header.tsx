"use client"

import { Button } from "@/components/ui/button"

interface HeaderProps {
  onAddOrder: () => void
  onAddDesign: () => void
  onAddColor: () => void
  onDeleteAll: () => void
  onViewTrash: () => void
}

export default function Header({ onAddOrder, onAddDesign, onAddColor, onDeleteAll, onViewTrash }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Order Management</h1>
          <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto">
            <Button onClick={onViewTrash} variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
              🗑️ Trash
            </Button>
            <Button onClick={onDeleteAll} variant="destructive" size="sm" className="text-xs sm:text-sm">
              Delete All
            </Button>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <Button
            onClick={onAddOrder}
            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm flex-1 sm:flex-none"
            size="sm"
          >
            + Add Order
          </Button>
          <Button
            onClick={onAddDesign}
            className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm flex-1 sm:flex-none"
            size="sm"
          >
            + Design
          </Button>
          <Button
            onClick={onAddColor}
            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
            size="sm"
          >
            + Color
          </Button>
        </div>
      </div>
    </header>
  )
}
