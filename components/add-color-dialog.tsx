"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

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
  const [color, setColor] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (color.trim()) {
      onAddColor(color)
      setColor("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Color</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 font-semibold">Existing Colors</h3>
            <div className="space-y-2 rounded border bg-muted/30 p-3 max-h-40 overflow-y-auto">
              {existingColors.length > 0 ? (
                existingColors.map((c) => (
                  <div key={c} className="flex items-center justify-between rounded bg-background p-2">
                    <span className="text-sm">{c}</span>
                    <button
                      onClick={() => onDeleteColor(c)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete color"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No colors yet</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Color Name</label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Enter color name" required />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Color
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
