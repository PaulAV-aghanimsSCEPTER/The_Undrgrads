"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddColorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddColor: (color: string) => void
  onDeleteColor: (color: string) => void
  existingColors: string[]
}

export default function AddColorDialog({
  open,
  onOpenChange,
  onAddColor,
  onDeleteColor,
  existingColors,
}: AddColorDialogProps) {
  const [newColor, setNewColor] = useState("")

  const handleAdd = () => {
    if (!newColor.trim()) return
    onAddColor(newColor)
    setNewColor("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Manage Colors</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Add New Color</label>
            <div className="flex gap-2">
              <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Enter color name" />
              <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
                Add
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Existing Colors</label>
            <div className="space-y-2">
              {existingColors.map((color) => (
                <div key={color} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>{color}</span>
                  <Button onClick={() => onDeleteColor(color)} variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
