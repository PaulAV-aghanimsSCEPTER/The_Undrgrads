"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string | null
  customerOrders: any[]
  colors: string[]
  designs: string[]
  onAddMoreOrder: (order: any) => void
  onDeleteOrder: (id: number) => void
  onEditOrder: (order: any) => void
  onMarkDefective: (id: number) => void
  onEditCustomer: (updatedCustomer: any) => void
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
  const [customer, setCustomer] = useState({
    name: "",
    facebook: "",
    phone: "",
    chapter: "",
    address: "",
  })

  const [newOrder, setNewOrder] = useState({
    color: colors[0],
    size: "M",
    design: designs[0],
  })

  useEffect(() => {
    if (open && customerOrders.length > 0) {
      const first = customerOrders[0]
      setCustomer({
        name: first.name || "",
        facebook: first.facebook || "",
        phone: first.phone || "",
        chapter: first.chapter || "",
        address: first.address || "",
      })
    }
  }, [open, customerOrders])

  if (!customerName) return null

  const handleAddOrder = () => {
    if (!newOrder.color || !newOrder.design || !newOrder.size) return
    onAddMoreOrder({
      ...newOrder,
      name: customer.name,
      facebook: customer.facebook,
      phone: customer.phone,
      chapter: customer.chapter,
      address: customer.address,
      orderDate: new Date().toISOString().split("T")[0],
    })
    setNewOrder({ color: colors[0], size: "M", design: designs[0] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details & Orders</DialogTitle>
        </DialogHeader>

        {/* CUSTOMER INFO */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Facebook</Label>
              <Input
                value={customer.facebook}
                onChange={(e) => setCustomer({ ...customer, facebook: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Chapter</Label>
              <Input
                value={customer.chapter}
                onChange={(e) => setCustomer({ ...customer, chapter: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onEditCustomer(customer)}>Save Customer Info</Button>
          </div>
        </div>

        {/* ORDERS SECTION */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Orders</h3>
          <div className="space-y-3">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {order.color} - {order.size} - {order.design}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order Date: {order.orderDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkDefective(order.id)}
                  >
                    Mark Defective
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteOrder(order.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD MORE ORDER */}
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-3">Add More Order</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Color</Label>
              <select
                className="border rounded p-2 w-full"
                value={newOrder.color}
                onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Size</Label>
              <select
                className="border rounded p-2 w-full"
                value={newOrder.size}
                onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
              >
                {["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Design</Label>
              <select
                className="border rounded p-2 w-full"
                value={newOrder.design}
                onChange={(e) => setNewOrder({ ...newOrder, design: e.target.value })}
              >
                {designs.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={handleAddOrder}>
              <Plus className="w-4 h-4 mr-2" /> Add Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
