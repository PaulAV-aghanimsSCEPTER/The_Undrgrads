"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddOrder: (order: any) => void
  colors: string[]
  designs: string[]
}

export default function AddOrderDialog({ open, onOpenChange, onAddOrder, colors, designs }: AddOrderDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    facebook: "",
    chapter: "",
    address: "",
    color: colors[0] || "",
    size: "M",
    design: designs[0] || "",
  })

  const [ordersToAdd, setOrdersToAdd] = useState<any[]>([])

  const handleAddMoreOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.color || !formData.size || !formData.design) {
      alert("Please fill in all required fields")
      return
    }
    setOrdersToAdd([...ordersToAdd, { ...formData }])
    setFormData({
      ...formData,
      color: colors[0] || "",
      size: "M",
      design: designs[0] || "",
    })
  }

  const handleSubmitAll = () => {
    if (ordersToAdd.length === 0) {
      alert("Please add at least one order")
      return
    }
    ordersToAdd.forEach((order) => onAddOrder(order))
    setFormData({
      name: "",
      phone: "",
      facebook: "",
      chapter: "",
      address: "",
      color: colors[0] || "",
      size: "M",
      design: designs[0] || "",
    })
    setOrdersToAdd([])
    onOpenChange(false)
  }

  const handleRemoveOrder = (index: number) => {
    setOrdersToAdd(ordersToAdd.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Add New Order</h2>
        <form onSubmit={handleAddMoreOrder} className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Customer Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Facebook Name</label>
                <Input
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="Enter Facebook profile"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Chapter</label>
                <Input
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="Enter chapter"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">Order Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Color *</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                >
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Size *</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                >
                  {["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Design *</label>
                <select
                  value={formData.design}
                  onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                >
                  {designs.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {ordersToAdd.length > 0 && (
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-700">
                Orders to Add ({ordersToAdd.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ordersToAdd.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm"
                  >
                    <span>
                      {order.color} - {order.size} - {order.design}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOrder(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
              Add More Order
            </Button>
            {ordersToAdd.length > 0 && (
              <Button
                type="button"
                onClick={handleSubmitAll}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
              >
                Submit All ({ordersToAdd.length})
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent text-xs sm:text-sm"
              onClick={() => {
                onOpenChange(false)
                setOrdersToAdd([])
                setFormData({
                  name: "",
                  phone: "",
                  facebook: "",
                  chapter: "",
                  address: "",
                  color: colors[0] || "",
                  size: "M",
                  design: designs[0] || "",
                })
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
