"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase"


interface AddOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddOrder: (order: any) => void
  colors?: string[]
  designs?: string[]
}

export default function AddOrderDialog({
  open,
  onOpenChange,
  onAddOrder,
  colors = [],
  designs = [],
}: AddOrderDialogProps) {
  const [supabaseDesigns, setSupabaseDesigns] = useState<string[]>([])
  const availableDesigns = supabaseDesigns.length > 0 ? supabaseDesigns : designs

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    facebook: "",
    chapter: "",
    address: "",
    color: colors[0] || "",
    size: "M",
    design: availableDesigns[0] || "",
    paymentStatus: "pending",
    price: "",
  })

  const [ordersToAdd, setOrdersToAdd] = useState<any[]>([])

  // Fetch latest designs from Supabase
  useEffect(() => {
    const fetchDesigns = async () => {
      const { data, error } = await supabase
        .from("designs")
        .select("name")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("❌ Error fetching designs:", error.message)
      } else if (data) {
        setSupabaseDesigns(data.map((d) => d.name))
      }
    }

    if (open) fetchDesigns()
  }, [open])

  // Keep formData updated if colors or designs change while dialog is open
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      color: colors[0] || prev.color,
      design: availableDesigns[0] || prev.design,
    }))
  }, [colors, availableDesigns])

  const handleAddMoreOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.color || !formData.size || !formData.design) {
      alert("Please fill in all required fields")
      return
    }

    setOrdersToAdd([
      ...ordersToAdd,
      { ...formData, price: formData.price ? parseFloat(formData.price) : undefined },
    ])

    // Reset only order-specific fields
    setFormData({
      ...formData,
      color: colors[0] || "",
      size: "M",
      design: availableDesigns[0] || "",
      paymentStatus: "pending",
      price: "",
    })
  }

const handleSubmitAll = async () => {
  if (ordersToAdd.length === 0) {
    alert("Please add at least one order")
    return
  }

  try {
    const formattedOrders = ordersToAdd.map((order) => ({
      name: formData.name,
      phone: formData.phone,
      facebook: formData.facebook,
      chapter: formData.chapter,
      address: formData.address,
      color: order.color,
      size: order.size,
      design: order.design,
      note: "",
      payment_status: order.paymentStatus || "pending", // ✅ FIXED: Correct column name
      price: order.price || 0,
      created_at: new Date(),
    }))

    const { data, error } = await supabase.from("orders").insert(formattedOrders).select()
    if (error) {
      console.error("❌ Error saving orders:", error.message)
      alert("Failed to save orders.")
      return
    }

    console.log("✅ Saved to Supabase:", data)
    alert("Orders successfully saved to Supabase!")

    if (data && Array.isArray(data)) {
      data.forEach((order) => onAddOrder(order))
    }

    // Reset after saving
    setFormData({
      name: "",
      phone: "",
      facebook: "",
      chapter: "",
      address: "",
      color: colors[0] || "White",
      size: "M",
      design: availableDesigns[0] || "",
      paymentStatus: "pending",
      price: "",
    })
    setOrdersToAdd([])
    onOpenChange(false)
  } catch (err) {
    console.error("Unexpected error:", err)
    alert("Something went wrong while saving.")
  }
}


  const handleRemoveOrder = (index: number) => {
    setOrdersToAdd((prevOrders) => prevOrders.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Add New Order</h2>
        <form onSubmit={handleAddMoreOrder} className="space-y-4 sm:space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Customer Name *", value: "name" },
                { label: "Phone", value: "phone" },
                { label: "Facebook Name", value: "facebook" },
                { label: "Chapter", value: "chapter" },
              ].map((field) => (
                <div key={field.value}>
                  <label className="block text-xs sm:text-sm font-medium mb-1">{field.label}</label>
                  <Input
                    value={formData[field.value as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.value]: e.target.value })
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="text-xs sm:text-sm"
                  />
                </div>
              ))}
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

          {/* Order Details */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
              Order Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
  <label className="block text-xs sm:text-sm font-medium mb-1">Color *</label>
  <select
    value={formData.color}
    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
  >
    {colors.map((c, i) => (
  <option key={`${c}-${i}`} value={c}>
    {c}
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
   {availableDesigns.map((d, i) => (
  <option key={`${d}-${i}`} value={d}>
    {d}
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
                <label className="block text-xs sm:text-sm font-medium mb-1">Payment Status *</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value })
                  }
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="partially paid">Partially Paid</option>
                  <option value="fully paid">Fully Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Orders To Add */}
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
                      {order.color} - {order.size} - {order.design} - {order.paymentStatus}
                      {order.price && ` - ${order.price}`}
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

          {/* Buttons */}
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
                  design: availableDesigns[0] || "",
                  paymentStatus: "",
                  price: "",
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
