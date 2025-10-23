"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    facebook: "",
    phone: "",
    chapter: "",
    address: "",
    color: colors[0] || "",
    size: "M",
    design: designs[0] || "",
  })
  const [orders, setOrders] = useState([{ ...formData }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    orders.forEach((order) => {
      onAddOrder({
        ...order,
        orderDate: new Date().toISOString().split("T")[0],
      })
    })
    setFormData({
      name: "",
      facebook: "",
      phone: "",
      chapter: "",
      address: "",
      color: colors[0] || "",
      size: "M",
      design: designs[0] || "",
    })
    setOrders([{ ...formData }])
  }

  const handleAddMoreOrder = () => {
    setOrders([
      ...orders,
      {
        name: formData.name,
        facebook: formData.facebook,
        phone: formData.phone,
        chapter: formData.chapter,
        address: formData.address,
        color: colors[0] || "",
        size: "M",
        design: designs[0] || "",
      },
    ])
  }

  const handleRemoveOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index))
  }

  const handleUpdateOrder = (index: number, field: string, value: string) => {
    const updatedOrders = [...orders]
    updatedOrders[index] = { ...updatedOrders[index], [field]: value }
    setOrders(updatedOrders)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold">Customer Information</h3>
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setOrders(orders.map((o) => ({ ...o, name: e.target.value })))
                }}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Facebook</label>
              <Input
                value={formData.facebook}
                onChange={(e) => {
                  setFormData({ ...formData, facebook: e.target.value })
                  setOrders(orders.map((o) => ({ ...o, facebook: e.target.value })))
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  setOrders(orders.map((o) => ({ ...o, phone: e.target.value })))
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Chapter</label>
              <Input
                value={formData.chapter}
                onChange={(e) => {
                  setFormData({ ...formData, chapter: e.target.value })
                  setOrders(orders.map((o) => ({ ...o, chapter: e.target.value })))
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value })
                  setOrders(orders.map((o) => ({ ...o, address: e.target.value })))
                }}
              />
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-4">
            <h3 className="font-semibold">Orders</h3>
            {orders.map((order, index) => (
              <div key={index} className="space-y-3 border rounded p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order {index + 1}</span>
                  {orders.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOrder(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Color</label>
                    <Select value={order.color} onValueChange={(value) => handleUpdateOrder(index, "color", value)}>
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
                    <Select value={order.size} onValueChange={(value) => handleUpdateOrder(index, "size", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">2XL</SelectItem>
                        <SelectItem value="XXL">3XL</SelectItem>
                        <SelectItem value="XXL">4XL</SelectItem>
                        <SelectItem value="XXL">5XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Design</label>
                    <Select value={order.design} onValueChange={(value) => handleUpdateOrder(index, "design", value)}>
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
              </div>
            ))}

            <Button type="button" variant="outline" onClick={handleAddMoreOrder} className="w-full bg-transparent">
              + Add More Order
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
