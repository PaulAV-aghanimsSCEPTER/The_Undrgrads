"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Order {
  id: number
  name: string
  phone?: string
  facebook?: string
  chapter?: string
  address?: string
  color: string
  size: string
  design: string
  payment_status: "pending" | "partially paid" | "fully paid"
  price: number
  is_defective?: boolean
  defective_note?: string
}

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string | null
  customerOrders: Order[]
  colors: string[]
  designs: string[]
  onAddMoreOrder: (order: Order) => void
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
  const { toast } = useToast()

  const [editingCustomer, setEditingCustomer] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: customerName || "",
    phone: customerOrders[0]?.phone || "",
    facebook: customerOrders[0]?.facebook || "",
    chapter: customerOrders[0]?.chapter || "",
    address: customerOrders[0]?.address || "",
  })

  const [newOrderData, setNewOrderData] = useState({
    color: colors[0] || "",
    size: "M",
    design: designs[0] || "",
    payment_status: "pending" as "pending" | "partially paid" | "fully paid",
    price: 0,
  })

  const [showAddMoreForm, setShowAddMoreForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [defectiveNote, setDefectiveNote] = useState("")
  const [showDefectiveNote, setShowDefectiveNote] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    setCustomerData({
      name: customerName || "",
      phone: customerOrders[0]?.phone || "",
      facebook: customerOrders[0]?.facebook || "",
      chapter: customerOrders[0]?.chapter || "",
      address: customerOrders[0]?.address || "",
    })
  }, [customerName, customerOrders])

  // ✅ Save Customer Info
  const handleSaveCustomer = async () => {
    try {
      await supabase.from("customers").update(customerData).eq("name", customerName)
      onEditCustomer(customerData)
      setEditingCustomer(false)
      toast({ title: "Customer updated successfully!" })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error updating customer", variant: "destructive" })
    }
  }

  // ✅ Add More Order
  const handleAddMoreOrder = async () => {
    const orderToAdd: Order = {
      id: Date.now(),
      ...customerData,
      ...newOrderData,
      price: Number(newOrderData.price) || 0,
      is_defective: false,
      defective_note: ""
    }

    const { error } = await supabase.from("orders").insert([{
      ...orderToAdd,
      created_at: new Date().toISOString()
    }])

    if (error) {
      toast({ title: "Error adding order", description: error.message, variant: "destructive" })
      return
    }

    onAddMoreOrder(orderToAdd)
    setShowAddMoreForm(false)
    toast({ title: "Order added successfully!" })
  }

  // ✅ Delete Order
  const handleDeleteOrder = async (orderId: number) => {
    const { error } = await supabase.from("orders").delete().eq("id", orderId)
    if (error) {
      toast({ title: "Error deleting order", description: error.message, variant: "destructive" })
      return
    }
    onDeleteOrder(orderId)
    toast({ title: "Order deleted successfully!" })
    setDeleteConfirmId(null)
  }

  // ✅ Mark Defective
  const handleMarkDefective = async (orderId: number) => {
    const { error } = await supabase
      .from("orders")
      .update({ is_defective: true, defective_note: defectiveNote })
      .eq("id", orderId)

    if (error) {
      toast({ title: "Error marking defective", description: error.message, variant: "destructive" })
      return
    }

    onMarkDefective(orderId, defectiveNote)
    toast({ title: "Order marked as defective!" })
    setShowDefectiveNote(false)
    setSelectedOrderId(null)
    setDefectiveNote("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 w-full max-w-3xl">
        {/* 🧾 Customer Info */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border">
          <h2 className="text-lg font-semibold mb-3">Customer Details</h2>
          {editingCustomer ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} placeholder="Name" />
                <Input value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} placeholder="Phone" />
                <Input value={customerData.facebook} onChange={e => setCustomerData({...customerData, facebook: e.target.value})} placeholder="Facebook" />
                <Input value={customerData.chapter} onChange={e => setCustomerData({...customerData, chapter: e.target.value})} placeholder="Chapter" />
                <Input value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} placeholder="Address" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCustomer} className="bg-blue-600 hover:bg-blue-700 flex-1">Save</Button>
                <Button onClick={() => setEditingCustomer(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="text-sm text-gray-700">
                <p><strong>Phone:</strong> {customerData.phone || "—"}</p>
                <p><strong>Facebook:</strong> {customerData.facebook || "—"}</p>
                <p><strong>Chapter:</strong> {customerData.chapter || "—"}</p>
                <p><strong>Address:</strong> {customerData.address || "—"}</p>
              </div>
              <Button onClick={() => setEditingCustomer(true)} variant="outline" className="mt-3 sm:mt-0">Edit Info</Button>
            </div>
          )}
        </div>

        {/* 🧩 Orders List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Orders ({customerOrders.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {customerOrders.map(order => (
              <div key={order.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm">
                <div className="flex-1 text-sm text-gray-800">
                  <div><strong>{order.color}</strong> – {order.size} – {order.design}</div>
                  <div>Status: {order.payment_status}</div>
                  <div>₱{order.price}</div>
                  {order.is_defective && <div className="text-red-600">⚠ Defective: {order.defective_note}</div>}
                </div>

                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button size="sm" variant="outline"
                    onClick={() => {
                      setSelectedOrderId(order.id)
                      setShowDefectiveNote(!showDefectiveNote)
                    }}
                  >
                    Mark Defective
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmId(order.id)}>Delete</Button>
                </div>

                {selectedOrderId === order.id && showDefectiveNote && (
                  <div className="mt-2 w-full flex gap-2">
                    <Input
                      placeholder="Defective note (optional)"
                      value={defectiveNote}
                      onChange={e => setDefectiveNote(e.target.value)}
                    />
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleMarkDefective(order.id)}>Save</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ➕ Add More Order */}
        {showAddMoreForm && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Add More Order</h3>
            <div className="grid gap-3">
              <select value={newOrderData.color} onChange={e => setNewOrderData({...newOrderData, color: e.target.value})}>
                {colors.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={newOrderData.size} onChange={e => setNewOrderData({...newOrderData, size: e.target.value})}>
                {["XS","S","M","L","XL","2XL","3XL","4XL","5XL"].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={newOrderData.design} onChange={e => setNewOrderData({...newOrderData, design: e.target.value})}>
                {designs.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={newOrderData.payment_status} onChange={e => setNewOrderData({...newOrderData, payment_status: e.target.value as any})}>
                <option value="pending">Pending</option>
                <option value="partially paid">Partially Paid</option>
                <option value="fully paid">Fully Paid</option>
              </select>
              <Input type="number" placeholder="Price" value={newOrderData.price} onChange={e => setNewOrderData({...newOrderData, price: Number(e.target.value)})} />
              <div className="flex gap-2">
                <Button onClick={handleAddMoreOrder} className="bg-green-600 hover:bg-green-700 flex-1">Add Order</Button>
                <Button onClick={() => setShowAddMoreForm(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* 🔘 Bottom Actions */}
        <div className="flex gap-2">
          <Button onClick={() => setShowAddMoreForm(!showAddMoreForm)} className="bg-green-600 hover:bg-green-700 flex-1">
            {showAddMoreForm ? "Hide Form" : "Add More Order"}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">Close</Button>
        </div>

        {/* ⚠ Delete Confirmation */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="font-semibold mb-2">Confirm Deletion</h3>
              <p>Are you sure you want to delete this order?</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleDeleteOrder(deleteConfirmId!)} className="bg-red-600 hover:bg-red-700 flex-1">Yes</Button>
                <Button onClick={() => setDeleteConfirmId(null)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
