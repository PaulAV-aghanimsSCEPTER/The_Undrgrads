"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/components/ui/use-toast"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DefectiveItem {
  id: number
  name: string
  color: string
  size: string
  design: string
  defectiveNote?: string
}

interface DefectiveItemsSectionProps {
  defectiveItems: DefectiveItem[]
  onRetrieve: (item: DefectiveItem) => void
  onDeleteLocal: (id: number) => void
}

export default function DefectiveItemsSection({
  defectiveItems,
  onRetrieve,
  onDeleteLocal,
}: DefectiveItemsSectionProps) {
  const handleRetrieve = (item: DefectiveItem) => {
    onRetrieve(item)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this defective item?")) return

    try {
      const { error } = await supabase.from("orders").delete().eq("id", id)
      if (error) throw error

      toast({ title: "Deleted", description: "Defective item deleted successfully." })
      onDeleteLocal(id) // update parent state
    } catch (err: any) {
      console.error("Failed to delete defective item:", err)
      toast({ title: "Error", description: err.message || "Failed to delete item.", variant: "destructive" })
    }
  }

  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-red-700">
          Defective Items ({defectiveItems.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-red-100 text-red-700 font-semibold">
              <th className="p-2 text-left">CUSTOMER</th>
              <th className="p-2 text-left">COLOR</th>
              <th className="p-2 text-left">SIZE</th>
              <th className="p-2 text-left">DESIGN</th>
              <th className="p-2 text-left">NOTE</th>
              <th className="p-2 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {defectiveItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-3">
                  No defective items.
                </td>
              </tr>
            ) : (
              defectiveItems.map(item => (
                <tr key={item.id} className="border-b border-red-100 hover:bg-red-50">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.color}</td>
                  <td className="p-2">{item.size}</td>
                  <td className="p-2">{item.design}</td>
                  <td className="p-2 text-gray-600">{item.defectiveNote || "—"}</td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => handleRetrieve(item)}>Retrieve</Button>
                      <Button onClick={() => handleDelete(item.id)} variant="destructive">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
