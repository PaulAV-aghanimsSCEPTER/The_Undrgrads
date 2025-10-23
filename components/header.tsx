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
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <div className="flex gap-2">
            <Button onClick={onViewTrash} variant="outline" size="sm">
              🗑️ Trash
            </Button>
            <Button onClick={onDeleteAll} variant="destructive" size="sm">
              Delete All Orders
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onAddOrder} className="bg-blue-600 hover:bg-blue-700" size="sm">
            + Add Order
          </Button>
          <Button onClick={onAddDesign} className="bg-purple-600 hover:bg-purple-700" size="sm">
            + Add Design
          </Button>
          <Button onClick={onAddColor} className="bg-green-600 hover:bg-green-700" size="sm">
            + Add Color
          </Button>
        </div>
      </div>
    </header>
  )
}
