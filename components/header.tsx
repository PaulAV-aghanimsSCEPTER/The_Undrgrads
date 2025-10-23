"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface HeaderProps {
  onAddOrder: () => void
  onAddDesign: () => void
  onAddColor: () => void
  onDeleteAll: () => void
  onViewTrash: () => void  // NEW prop for Trash
}

export default function Header({ onAddOrder, onAddDesign, onAddColor, onDeleteAll, onViewTrash }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">The Undergrads</h1>
        <div className="flex gap-2">
          {/* Add Order */}
          <Button onClick={onAddOrder} className="bg-blue-600 hover:bg-blue-700">
            Add Order
          </Button>

          {/* Add Design */}
          <Button onClick={onAddDesign} variant="outline" className="border-gray-300 bg-transparent">
            Add Design
          </Button>

          {/* Add Color */}
          <Button onClick={onAddColor} variant="outline" className="border-gray-300 bg-transparent">
            Add Color
          </Button>

          {/* Delete All */}
          <Button onClick={onDeleteAll} className="bg-red-600 hover:bg-red-700">
            Delete All
          </Button>

          {/* Trash - icon button */}
          <Button onClick={onViewTrash} variant="outline" size="icon" className="border-gray-300 bg-transparent">
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Optional: Trash with text */}
          {/* <Button onClick={onViewTrash} className="bg-gray-700 hover:bg-gray-800">
            Trash
          </Button> */}
        </div>
      </div>
    </header>
  )
}
