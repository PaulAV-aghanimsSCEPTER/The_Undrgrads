"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

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
  const [design, setDesign] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (design.trim()) {
      onAddDesign(design)
      setDesign("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Design</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 font-semibold">Existing Designs</h3>
            <div className="space-y-2 rounded border bg-muted/30 p-3 max-h-40 overflow-y-auto">
              {existingDesigns.length > 0 ? (
                existingDesigns.map((d) => (
                  <div key={d} className="flex items-center justify-between rounded bg-background p-2">
                    <span className="text-sm">{d}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDesign(d)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No designs yet</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Design Name</label>
              <Input
                value={design}
                onChange={(e) => setDesign(e.target.value)}
                placeholder="Enter design name"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Design
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
