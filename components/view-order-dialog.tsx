"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Order {
  id?: number
  name: string
  phone?: string
  facebook?: string
  chapter?: string
  address?: string
  color: string
  size: string
  design: string
  isDefective?: boolean
  defectiveNote?: string
}

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string | null
  customerOrders: Order[]
  colors: string[]
  designs: string[]
  onAddMoreOrder: (order: any) => void
  onDeleteOrder: (orderId: number) => void
  onEditOrder: (order: Order) => void
  onMarkDefective: (orderId: number, note?: string) => void
  onEditCustomer: (customer: any) => void
}

export default function ViewOrderDialog({
  open,
  onOpenChange,
  customerName,
  customerOrders,
  colors,
  designs,
  onAddMoreOrder,
  onDeleteOrder,
  onEditOrder,
  onMarkDefective,
  onEditCustomer,
}: ViewOrderDialogProps) {
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: customerName || "",
    phone: customerOrders[0]?.phone || "",
    facebook: customerOrders[0]?.facebook || "",
    chapter: customerOrders[0]?.chapter || "",
    address: customerOrders[0]?.address || "",
  })
  const [defectiveNote, setDefectiveNote] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showAddMoreForm, setShowAddMoreForm] = useState(false)
  const [newOrderData, setNewOrderData] = useState({
    color: colors[0] || "",
    size: "M",
    design: designs[0] || "",
  })

  const handleSaveCustomer = () => {
    onEditCustomer(customerData)
    setEditingCustomer(false)
  }

  const handleAddMoreOrder = () => {
    const orderToAdd = {
      ...customerData,
      ...newOrderData,
    }
    onAddMoreOrder(orderToAdd)
    setShowAddMoreForm(false)
    setNewOrderData({
      color: colors[0] || "",
      size: "M",
      design: designs[0] || "",
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full my-4 sm:my-8 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Customer: {customerName}</h2>

        {editingCustomer ? (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-sm sm:text-base">Edit Customer Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1">Name</label>
                <Input
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Phone</label>
                <Input
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Facebook</label>
                <Input
                  value={customerData.facebook}
                  onChange={(e) => setCustomerData({ ...customerData, facebook: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Chapter</label>
                <Input
                  value={customerData.chapter}
                  onChange={(e) => setCustomerData({ ...customerData, chapter: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Address</label>
                <Input
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSaveCustomer} className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm flex-1">
                Save
              </Button>
              <Button onClick={() => setEditingCustomer(false)} variant="outline" className="text-xs sm:text-sm flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
              <div>
                <span className="font-medium">Phone:</span> {customerData.phone}
              </div>
              <div>
                <span className="font-medium">Facebook:</span> {customerData.facebook}
              </div>
              <div>
                <span className="font-medium">Chapter:</span> {customerData.chapter}
              </div>
              <div>
                <span className="font-medium">Address:</span> {customerData.address}
              </div>
            </div>
            <Button onClick={() => setEditingCustomer(true)} variant="outline" size="sm" className="text-xs">
              Edit Info
            </Button>
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Orders ({customerOrders.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="p-2 sm:p-3 border border-gray-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div className="text-xs sm:text-sm flex-1">
                  <div>
                    {order.color} - {order.size} - {order.design}
                  </div>
                  {order.isDefective && <div className="text-red-600 text-xs">Defective: {order.defectiveNote}</div>}
                </div>
                <div className="flex gap-1 w-full sm:w-auto">
                  <Button
                    onClick={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id || null)}
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1 sm:flex-none"
                  >
                    {selectedOrderId === order.id ? "Hide" : "Mark"}
                  </Button>
                  <Button
                    onClick={() => order.id && onDeleteOrder(order.id)}
                    size="sm"
                    variant="destructive"
                    className="text-xs flex-1 sm:flex-none"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedOrderId && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-3 bg-yellow-50 border border-yellow-200 rounded">
              <label className="block text-xs sm:text-sm font-medium mb-2">Defect Note</label>
              <Input
                value={defectiveNote}
                onChange={(e) => setDefectiveNote(e.target.value)}
                placeholder="Describe the defect..."
                className="text-xs sm:text-sm mb-2"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => {
                    onMarkDefective(selectedOrderId, defectiveNote)
                    setSelectedOrderId(null)
                    setDefectiveNote("")
                  }}
                  className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm flex-1"
                  size="sm"
                >
                  Mark as Defective
                </Button>
                <Button
                  onClick={() => setSelectedOrderId(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {showAddMoreForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Add More Order</h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Color *</label>
                <select
                  value={newOrderData.color}
                  onChange={(e) => setNewOrderData({ ...newOrderData, color: e.target.value })}
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
                  value={newOrderData.size}
                  onChange={(e) => setNewOrderData({ ...newOrderData, size: e.target.value })}
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
                  value={newOrderData.design}
                  onChange={(e) => setNewOrderData({ ...newOrderData, design: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                >
                  {designs.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleAddMoreOrder}
                  className="bg-green-600 hover:bg-green-700 flex-1 text-xs sm:text-sm"
                >
                  Add Order
                </Button>
                <Button
                  onClick={() => setShowAddMoreForm(false)}
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowAddMoreForm(!showAddMoreForm)}
            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1"
          >
            {showAddMoreForm ? "Hide Form" : "Add More Order"}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1 text-xs sm:text-sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
