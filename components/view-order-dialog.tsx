"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, AlertCircle } from "lucide-react"

interface Order {
  id: number
  name: string
  facebook: string
  phone: string
  chapter: string
  address?: string
  orderDate: string
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
  onAddMoreOrder: (customerName: string, order: any) => void
  onDeleteOrder: (orderId: number) => void
  onEditOrder: (orderId: number, order: any) => void
  onMarkDefective: (orderId: number, note?: string) => void
  onEditCustomer: (customerName: string, data: any) => void
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [customerData, setCustomerData] = useState<any>({})
  const [defectiveOrderId, setDefectiveOrderId] = useState<number | null>(null)
  const [defectiveNote, setDefectiveNote] = useState("")
  const [newOrder, setNewOrder] = useState({
    color: colors[0] || "",
    size: "M",
    design: designs[0] || "",
  })

  const customer = customerOrders[0]

  const handleEditClick = (order: Order) => {
    setEditingId(order.id)
    setEditData({ ...order })
  }

  const handleSaveEdit = () => {
    if (editingId) {
      onEditOrder(editingId, editData)
      setEditingId(null)
    }
  }

  const handleEditCustomerClick = () => {
    if (customer) {
      setCustomerData({
        name: customer.name,
        facebook: customer.facebook,
        phone: customer.phone,
        chapter: customer.chapter,
        address: customer.address || "",
      })
      setEditingCustomer(true)
    }
  }

  const handleSaveCustomer = () => {
    if (customerName) {
      onEditCustomer(customerName, customerData)
      setEditingCustomer(false)
    }
  }

  const handleAddMoreOrder = () => {
    if (customerName) {
      onAddMoreOrder(customerName, {
        ...newOrder,
        orderDate: new Date().toISOString().split("T")[0],
      })
      setNewOrder({
        color: colors[0] || "",
        size: "M",
        design: designs[0] || "",
      })
      setShowAddOrder(false)
    }
  }

  const handleMarkDefectiveClick = (orderId: number) => {
    setDefectiveOrderId(orderId)
    setDefectiveNote("")
  }

  const handleConfirmDefective = () => {
    if (defectiveOrderId) {
      onMarkDefective(defectiveOrderId, defectiveNote)
      setDefectiveOrderId(null)
      setDefectiveNote("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer Orders - {customerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {customer && (
            <div className="rounded border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Customer Information</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEditCustomerClick}
                  className="text-blue-600 hover:text-blue-700 bg-transparent"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              {editingCustomer ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Name</label>
                    <Input
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone</label>
                    <Input
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Facebook</label>
                    <Input
                      value={customerData.facebook}
                      onChange={(e) => setCustomerData({ ...customerData, facebook: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Chapter</label>
                    <Input
                      value={customerData.chapter}
                      onChange={(e) => setCustomerData({ ...customerData, chapter: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Address</label>
                    <Input
                      value={customerData.address}
                      onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveCustomer} className="bg-blue-600 hover:bg-blue-700">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCustomer(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {customer.name}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {customer.phone}
                  </div>
                  <div>
                    <span className="font-medium">Facebook:</span>
                    <a
                      href={`https://${customer.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline"
                    >
                      {customer.facebook}
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Chapter:</span> {customer.chapter}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span> {customer.address || "N/A"}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="mb-3 font-semibold">Orders ({customerOrders.length})</h3>
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded border p-3 ${order.isDefective ? "bg-red-50 border-red-200" : "bg-muted/30"}`}
                >
                  {editingId === order.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium">Color</label>
                          <Select
                            value={editData.color}
                            onValueChange={(value) => setEditData({ ...editData, color: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Size</label>
                          <Select
                            value={editData.size}
                            onValueChange={(value) => setEditData({ ...editData, size: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="XS">XS</SelectItem>
                              <SelectItem value="S">S</SelectItem>
                              <SelectItem value="M">M</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="XL">XL</SelectItem>
                              <SelectItem value="XXL">XXL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Design</label>
                          <Select
                            value={editData.design}
                            onValueChange={(value) => setEditData({ ...editData, design: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {designs.map((design) => (
                                <SelectItem key={design} value={design}>
                                  {design}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {order.color} - {order.size} - {order.design}
                          </span>
                          {order.isDefective && <AlertCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Order Date: {order.orderDate}</p>
                        {order.defectiveNote && (
                          <p className="text-xs text-red-600 mt-1">Note: {order.defectiveNote}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(order)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkDefectiveClick(order.id)}
                          className={order.isDefective ? "text-red-600" : "text-gray-600"}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {defectiveOrderId !== null && (
            <div className="rounded border bg-yellow-50 border-yellow-200 p-4 space-y-3">
              <h3 className="font-semibold text-yellow-900">Mark as Defective</h3>
              <div>
                <label className="mb-2 block text-sm font-medium">Note (optional)</label>
                <Input
                  value={defectiveNote}
                  onChange={(e) => setDefectiveNote(e.target.value)}
                  placeholder="Why is this item defective?"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConfirmDefective} className="bg-red-600 hover:bg-red-700">
                  Confirm Defective
                </Button>
                <Button variant="outline" onClick={() => setDefectiveOrderId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showAddOrder ? (
            <div className="rounded border bg-muted/30 p-4 space-y-3">
              <h3 className="font-semibold">Add More Order</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <Select value={newOrder.color} onValueChange={(value) => setNewOrder({ ...newOrder, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Size</label>
                  <Select value={newOrder.size} onValueChange={(value) => setNewOrder({ ...newOrder, size: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                      <SelectItem value="XXL">3XL</SelectItem>
                      <SelectItem value="XXL">4XL</SelectItem>
                      <SelectItem value="XXL">5XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Design</label>
                  <Select
                    value={newOrder.design}
                    onValueChange={(value) => setNewOrder({ ...newOrder, design: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {designs.map((design) => (
                        <SelectItem key={design} value={design}>
                          {design}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddMoreOrder} className="bg-blue-600 hover:bg-blue-700">
                  Add Order
                </Button>
                <Button variant="outline" onClick={() => setShowAddOrder(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddOrder(true)} variant="outline" className="w-full">
              + Add More Order
            </Button>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
