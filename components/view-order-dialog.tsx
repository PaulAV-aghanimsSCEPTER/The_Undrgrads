"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

  // --- Save Customer Info ---
  const handleSaveCustomer = async () => {
    try {
      await supabase.from("customers").update(customerData).eq("name", customerName)
      onEditCustomer(customerData)
      setEditingCustomer(false)
      toast({ title: "Customer Updated" })
    } catch (err: any) {
      console.error("Failed to update customer:", err)
      toast({ title: "Error", description: err?.message || "Failed to update customer.", variant: "destructive" })
    }
  }

  // --- Add More Order ---
  const handleAddMoreOrder = async () => {
    const orderToAdd: Order = {
      id: Date.now(), // temp unique ID
      ...customerData,
      ...newOrderData,
      payment_status: newOrderData.payment_status,
      price: typeof newOrderData.price === "string" ? parseFloat(newOrderData.price) || 0 : newOrderData.price,
      is_defective: false,
      defective_note: ""
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([{
          id: orderToAdd.id,
          name: orderToAdd.name,
          phone: orderToAdd.phone || "",
          facebook: orderToAdd.facebook || "",
          chapter: orderToAdd.chapter || "",
          address: orderToAdd.address || "",
          color: orderToAdd.color,
          size: orderToAdd.size,
          design: orderToAdd.design,
          payment_status: orderToAdd.payment_status,
          price: orderToAdd.price,
          defective_note: orderToAdd.defective_note,
          is_defective: orderToAdd.is_defective,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        console.error("Supabase insert error:", error)
        toast({ title: "Error", description: error.message, variant: "destructive" })
        return
      }

      onAddMoreOrder(orderToAdd)
      toast({ title: "Order Added", description: `Order for ${customerData.name} added.` })
      setShowAddMoreForm(false)
      setNewOrderData({
        color: colors[0] || "",
        size: "M",
        design: designs[0] || "",
        payment_status: "pending",
        price: 0
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to add order.", variant: "destructive" })
    }
  }

  // --- Delete Order ---
  const handleDeleteOrder = async (orderId: number) => {
    try {
      await supabase.from("orders").delete().eq("id", orderId)
      onDeleteOrder(orderId)
      toast({ title: "Order Deleted" })
      setDeleteConfirmId(null)
    } catch (err: any) {
      console.error("Failed to delete order:", err)
      toast({ title: "Error", description: err?.message || "Failed to delete order.", variant: "destructive" })
    }
  }

  // --- Mark Defective ---
  const handleMarkDefective = async (orderId?: number) => {
    if (!orderId) {
      toast({ title: "Error", description: "Invalid order ID.", variant: "destructive" })
      return
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ is_defective: true, defective_note: defectiveNote })
        .eq("id", orderId)

      if (error) {
        console.error("Supabase update error:", error)
        toast({ title: "Error", description: error.message, variant: "destructive" })
        return
      }

      onMarkDefective(orderId, defectiveNote)
      toast({ title: "Order Marked Defective", description: "The order has been marked as defective." })

      setDefectiveNote("")
      setSelectedOrderId(null)
      setShowDefectiveNote(false)
    } catch (err: any) {
      console.error("Failed to mark defective:", err)
      toast({ title: "Error", description: err?.message || "Failed to mark defective.", variant: "destructive" })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full my-4 sm:my-8 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Customer: {customerName}</h2>

        {/* Customer Info */}
        {editingCustomer ? (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-sm sm:text-base">Edit Customer Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
          </div>
        ) : (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
              <div>Phone: {customerData.phone}</div>
              <div>Facebook: {customerData.facebook}</div>
              <div>Chapter: {customerData.chapter}</div>
              <div>Address: {customerData.address}</div>
            </div>
            <Button onClick={() => setEditingCustomer(true)} variant="outline" size="sm">Edit Info</Button>
          </div>
        )}

        {/* Orders */}
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Orders ({customerOrders.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customerOrders.map((order) => (
              <div key={order.id} className="p-2 sm:p-3 border border-gray-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-xs sm:text-sm flex-1">
                  <div>{order.color} - {order.size} - {order.design}</div>
                  <div>Status: {order.payment_status}</div>
                  <div>Price: {order.price}</div>
                  {order.is_defective && <div className="text-red-600">Defective: {order.defective_note}</div>}
                </div>

                <div className="flex gap-1 w-full sm:w-auto">
                  <Button
                    onClick={() => {
                      if (selectedOrderId === order.id) {
                        setSelectedOrderId(null)
                        setShowDefectiveNote(false)
                      } else {
                        setSelectedOrderId(order.id)
                        setShowDefectiveNote(true)
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    {selectedOrderId === order.id ? "Cancel" : "Mark Defective"}
                  </Button>

                  <Button
                    onClick={() => setDeleteConfirmId(order.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>

                {selectedOrderId === order.id && showDefectiveNote && (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Defective note (optional)"
                      value={defectiveNote}
                      onChange={e => setDefectiveNote(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleMarkDefective(order.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delete Confirmation */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 max-w-sm w-full shadow-lg">
              <h3 className="font-semibold mb-2">Confirm Deletion</h3>
              <p>Are you sure you want to delete this order?</p>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => deleteConfirmId && handleDeleteOrder(deleteConfirmId)} className="bg-red-600 hover:bg-red-700 flex-1">Yes</Button>
                <Button onClick={() => setDeleteConfirmId(null)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Add More Order */}
        {showAddMoreForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Add More Order</h3>
            <div className="space-y-2 sm:space-y-3">
              <select value={newOrderData.color} onChange={e => setNewOrderData({...newOrderData, color: e.target.value})}>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newOrderData.size} onChange={e => setNewOrderData({...newOrderData, size: e.target.value})}>
                {["XS","S","M","L","XL","2XL","3XL","4XL","5XL"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newOrderData.design} onChange={e => setNewOrderData({...newOrderData, design: e.target.value})}>
                {designs.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newOrderData.payment_status} onChange={e => setNewOrderData({...newOrderData, payment_status: e.target.value as "pending" | "partially paid" | "fully paid"})}>
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

        <div className="flex gap-2">
          <Button onClick={() => setShowAddMoreForm(!showAddMoreForm)} className="bg-green-600 hover:bg-green-700 flex-1">
            {showAddMoreForm ? "Hide Form" : "Add More Order"}
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">Close</Button>
        </div>
      </div>
    </div>
  )
}
