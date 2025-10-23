"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Order {
  id: number
  color: string
  size: string
  design: string
  orderDate: string
}

interface AddDefectiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onConfirm: (note: string) => void // ✅ Added this prop
}

export default function AddDefectiveDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: AddDefectiveDialogProps) {
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!open) setNote("")
  }, [open])

  if (!order) return null

  const handleConfirm = () => {
    onConfirm(note)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as Defective</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm">
            You are marking <b>{order.color}</b> ({order.size}) - {order.design} as defective.
          </p>
          <Textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-red-600 text-white" onClick={handleConfirm}>
            Confirm Defective
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
