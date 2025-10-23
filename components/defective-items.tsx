"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DefectiveItem {
  id: number
  customer: string
  color: string
  size: string
  design: string
  note?: string
}

export default function DefectiveItemsSection() {
  const [defectiveItems, setDefectiveItems] = useState<DefectiveItem[]>([
    { id: 1, customer: "qwqar3wrq", color: "White", size: "3XL", design: "Vintage", note: "Faded print" },
    { id: 2, customer: "awew", color: "Blue", size: "M", design: "Classic", note: "Loose stitch" },
    { id: 3, customer: "afawefa", color: "Red", size: "5XL", design: "Classic", note: "Misaligned design" },
  ])

  const handleRetrieve = (item: DefectiveItem) => {
    alert(`✅ Retrieved order for ${item.customer}`)
    setDefectiveItems(defectiveItems.filter((i) => i.id !== item.id))
  }

  const handleDelete = (id: number) => {
    if (!confirm("Delete this defective item?")) return
    setDefectiveItems(defectiveItems.filter((i) => i.id !== id))
  }

  const handleRetrieveAll = () => {
    if (defectiveItems.length === 0) return
    if (!confirm(`Retrieve all ${defectiveItems.length} defective items?`)) return
    alert(`✅ Retrieved ${defectiveItems.length} defective items.`)
    setDefectiveItems([])
  }

  const handleDeleteAll = () => {
    if (defectiveItems.length === 0) return
    if (!confirm(`Permanently delete all ${defectiveItems.length} defective records?`)) return
    setDefectiveItems([])
    alert(`🗑️ Deleted ${defectiveItems.length} records.`)
  }

  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-red-700">Defective Items ({defectiveItems.length})</h2>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            size="sm"
            onClick={handleRetrieveAll}
            disabled={defectiveItems.length === 0}
          >
            Retrieve All ({defectiveItems.length})
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            size="sm"
            onClick={handleDeleteAll}
            disabled={defectiveItems.length === 0}
          >
            Delete All ({defectiveItems.length})
          </Button>
        </div>
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
              defectiveItems.map((item) => (
                <tr key={item.id} className="border-b border-red-100 hover:bg-red-50">
                  <td className="p-2">{item.customer}</td>
                  <td className="p-2">{item.color}</td>
                  <td className="p-2">{item.size}</td>
                  <td className="p-2">{item.design}</td>
                  <td className="p-2 text-gray-600">{item.note || "—"}</td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleRetrieve(item)}
                      >
                        Retrieve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
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
