"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"

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
  created_at?: string
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
  onEditCustomer,
  onMarkDefective,
}: ViewOrderDialogProps) {
  const { toast } = useToast()

  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]

  const [editingCustomer, setEditingCustomer] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: customerName || "",
    phone: customerOrders[0]?.phone || "",
    facebook: customerOrders[0]?.facebook || "",
    chapter: customerOrders[0]?.chapter || "",
    address: customerOrders[0]?.address || "",
  })

  const [newOrder, setNewOrder] = useState({
    color: colors[0] || "White",
    size: "M",
    design: designs[0] || "Prologue",
    paymentStatus: "Pending",
    price: "",
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

// ✅ Add More Order (Fixed)
const handleAddOrder = async () => {
  const normalizedStatus =
    newOrder.paymentStatus.toLowerCase() as "pending" | "partially paid" | "fully paid"

  const orderToAdd: Order = {
    id: Date.now(),
    ...customerData,
    color: newOrder.color,
    size: newOrder.size,
    design: newOrder.design,
    payment_status: normalizedStatus,
    price: Number(newOrder.price) || 0,
    is_defective: false,
    defective_note: "",
  }

  // ✅ Insert to Supabase correctly
  const { error } = await supabase.from("orders").insert([
    {
      name: customerData.name,
      phone: customerData.phone,
      facebook: customerData.facebook,
      chapter: customerData.chapter,
      address: customerData.address,
      color: newOrder.color,
      size: newOrder.size,
      design: newOrder.design,
      payment_status: normalizedStatus, // fixed here
      price: Number(newOrder.price) || 0,
      created_at: new Date().toISOString(),
    },
  ])

  if (error) {
    toast({
      title: "Error adding order",
      description: error.message,
      variant: "destructive",
    })
    return
  }

  onAddMoreOrder(orderToAdd)
  setShowAddMoreForm(false)
  toast({ title: "✅ Order added successfully!" })
}



  // ✅ Move to Trash
  const handleDeleteOrder = async (order: Order) => {
    if (!order?.id) return
    const orderId = Number(order.id)

    try {
      // 1️⃣ Move to trash_orders
      const { error: insertError } = await supabase.from("trash_orders").insert([
        {
          name: order.name,
          phone: order.phone,
          facebook: order.facebook,
          chapter: order.chapter,
          address: order.address,
          color: order.color,
          size: order.size,
          design: order.design,
          price: order.price,
          is_defective: order.is_defective ?? false,
          defective_note: order.defective_note ?? null,
          created_at: order.created_at ?? new Date().toISOString(),
          deleted_at: new Date().toISOString(),
          payment_status: order.payment_status ?? null,
        },
      ])
      if (insertError) throw insertError

      // 2️⃣ Delete from main table
      const { error: deleteError } = await supabase.from("orders").delete().eq("id", orderId)
      if (deleteError) throw deleteError

      toast({ title: "Order moved to Trash successfully!" })
      setDeleteConfirmId(null)
    } catch (err: any) {
      console.error("❌ Error moving order to trash_orders:", err)
      toast({
        title: "Error",
        description: err.message || String(err),
        variant: "destructive",
      })
    }
  }

  // ✅ Mark Defective
const handleMarkDefective = async (orderId: number) => {
  const { error } = await supabase
    .from("orders")
    .update({ is_defective: true, defective_note: defectiveNote })
    .eq("id", orderId)

  if (error) {
    toast({
      title: "Error marking defective",
      description: error.message,
      variant: "destructive",
    })
    return
  }

  // Call parent handler so main dashboard updates
  onMarkDefective(orderId, defectiveNote)

  // Close note UI instantly
  setShowDefectiveNote(false)
  setSelectedOrderId(null)
  setDefectiveNote("")

  toast({
    title: "✅ Order marked as defective!",
    description: "It has been moved to the Defective Items list.",
  })
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

        {/* 🧩 Orders */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Orders ({customerOrders.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {customerOrders.map(order => (
              <div key={order.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm">
                <div className="flex-1 text-sm text-gray-800">
                  <div><strong>{order.color}</strong> – {order.size} – {order.design}</div>
                  <div className="flex items-center gap-1">
  <strong>Status:</strong>
  <span
    className={
      order.payment_status === "fully paid"
        ? "text-green-600 font-semibold"
        : order.payment_status === "partially paid"
        ? "text-yellow-600 font-semibold"
        : "text-gray-600 font-semibold"
    }
  >
    {order.payment_status
      ? order.payment_status
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Pending"}
  </span>
</div>

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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(order.id)}
                  >
                    Delete
                  </Button>
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

        {/* ➕ Add Order */}
        {showAddMoreForm && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-blue-300 pb-1">🛍️ Add More Order</h3>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Color *</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={newOrder.color}
              onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
            >
              {colors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Size *</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={newOrder.size}
              onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
            >
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Design *</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={newOrder.design}
              onChange={(e) => setNewOrder({ ...newOrder, design: e.target.value })}
            >
              {designs.map((design) => (
                <option key={design} value={design}>{design}</option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Status *</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={newOrder.paymentStatus}
              onChange={(e) => setNewOrder({ ...newOrder, paymentStatus: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
            <input
              type="number"
              placeholder="Enter price"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={newOrder.price}
              onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
            />

            <div className="flex justify-between">
              <button
                onClick={handleAddOrder}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Order
              </button>
              <button
                onClick={() => setShowAddMoreForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded border hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddMoreForm(!showAddMoreForm)}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            {showAddMoreForm ? "Hide Form" : "Add More Order"}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
            Close
          </Button>
        </div>

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="font-semibold mb-2">Confirm Deletion</h3>
              <p>Are you sure you want to move this order to Trash?</p>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    const order = customerOrders.find(o => o.id === deleteConfirmId)
                    if (order) handleDeleteOrder(order)
                  }}
                  className="bg-red-600 hover:bg-red-700 flex-1"
                >
                  Yes
                </Button>
                <Button onClick={() => setDeleteConfirmId(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
