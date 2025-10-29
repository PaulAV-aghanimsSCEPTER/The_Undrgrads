"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AddColorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddColor: (newColor: string) => void
  onDeleteColor: (colorToDelete: string) => Promise<void>
}

export default function AddColorDialog({
  open,
  onOpenChange,
  onAddColor,
  onDeleteColor,
}: AddColorDialogProps) {
  const [newColor, setNewColor] = useState("")
  const [existingColors, setExistingColors] = useState<string[]>([])

  // Fetch colors from Supabase
  useEffect(() => {
    if (!open) return

    const fetchColors = async () => {
      const { data, error } = await supabase
        .from("colors")
        .select("name")
        .order("created_at", { ascending: true })
        

      if (error) {
        console.error("Failed to fetch colors:", error)
      } else if (data) {
        // Remove duplicates
        const uniqueColors = Array.from(new Set(data.map((c) => c.name)))
        setExistingColors(uniqueColors)
      }
    }

    fetchColors()
  }, [open])

  const handleAdd = async () => {
    const colorTrimmed = newColor.trim()
    if (!colorTrimmed) return

    // Prevent duplicates locally
    if (existingColors.includes(colorTrimmed)) {
      alert("This color already exists.")
      return
    }

    try {
      const { data, error } = await supabase
        .from("colors")
        .insert({ name: colorTrimmed })
        .select()

      if (error) throw error
      if (data && data.length > 0) {
        const addedColor = data[0].name
        setExistingColors((prev) => [...prev, addedColor])
        onAddColor(addedColor)
        setNewColor("")
      }
    } catch (err) {
      console.error("Failed to add color:", err)
      alert("Failed to add color. Maybe it already exists in database.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Manage Colors</h2>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter new color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="text-xs sm:text-sm"
          />
          <Button onClick={handleAdd} className="text-xs sm:text-sm">
            Add
          </Button>
        </div>

        {existingColors.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500">No colors added yet.</p>
        ) : (
          existingColors.map((color, index) => (
            <div
              key={`${color}-${index}`}
              className="flex justify-between items-center p-2 bg-gray-100 rounded mb-1"
            >
              <span>{color}</span>
              <button
                onClick={async () => {
                  await onDeleteColor(color)
                  setExistingColors((prev) => prev.filter((c) => c !== color))
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs sm:text-sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
