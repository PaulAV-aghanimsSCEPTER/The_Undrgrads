"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddDesignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddDesign: (design: string) => void
  onDeleteDesign: (design: string) => void
  existingDesigns: string[]
}

export default function AddDesignDialog({
  open,
  onOpenChange,
  onAddDesign,
  onDeleteDesign,
  existingDesigns,
}: AddDesignDialogProps) {
  const [newDesign, setNewDesign] = useState("")

  const handleAdd = () => {
    if (!newDesign.trim()) return
    onAddDesign(newDesign)
    setNewDesign("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Manage Designs</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Add New Design</label>
            <div className="flex gap-2">
              <Input
                value={newDesign}
                onChange={(e) => setNewDesign(e.target.value)}
                placeholder="Enter design name"
              />
              <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
                Add
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Existing Designs</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingDesigns.map((design) => (
                <div key={design} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>{design}</span>
                  <Button onClick={() => onDeleteDesign(design)} variant="destructive" size="sm">
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
