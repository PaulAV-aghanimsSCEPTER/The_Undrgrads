"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Order {
  color: string
  size: string
  design: string
  note?: string
}

export default function CustomerOrderPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    facebook: "",
    chapter: "",
    address: "",
  })
  const [orders, setOrders] = useState<Order[]>([
    { color: "", size: "", design: "", note: "" }
  ])
  const [status, setStatus] = useState("pending")

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value })
  }

  const handleOrderChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedOrders = [...orders]
    updatedOrders[index][e.target.name as keyof Order] = e.target.value
    setOrders(updatedOrders)
  }

  const addOrderField = () => {
    setOrders([...orders, { color: "", size: "", design: "", note: "" }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      for (const order of orders) {
        const { error } = await supabase.from("orders").insert([{
          ...customer,
          ...order,
          status
        }])
        if (error) throw error
      }
      toast({ title: "Orders Submitted!", description: "Thank you for your order." })
      setCustomer({ name: "", phone: "", facebook: "", chapter: "", address: "" })
      setOrders([{ color: "", size: "", design: "", note: "" }])
      setStatus("pending")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 space-y-3 text-center">
        <img src="/logo.png" alt="The Undergrads Logo" className="h-100 w-100" />
        <h1 className="text-4xl font-bold text-gray-800">Welcome to The Undergrads!</h1>
        <p className="text-gray-600 max-w-md">
          We're excited to take your orders. Fill out your details below and add as many orders as you like.
        </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl space-y-8 border border-gray-200"
      >
        {/* Customer Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="name" value={customer.name} onChange={handleCustomerChange} placeholder="Name" required />
            <Input name="phone" value={customer.phone} onChange={handleCustomerChange} placeholder="Phone" />
            <Input name="facebook" value={customer.facebook} onChange={handleCustomerChange} placeholder="Facebook" />
            <Input name="chapter" value={customer.chapter} onChange={handleCustomerChange} placeholder="Chapter" />
            <Input name="address" value={customer.address} onChange={handleCustomerChange} placeholder="Address" />
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Your Orders</h2>
          {orders.map((order, idx) => (
            <div key={idx} className="border p-5 rounded-xl mb-4 bg-gray-50 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input name="color" value={order.color} onChange={(e) => handleOrderChange(idx, e)} placeholder="Color" required />
                <Input name="size" value={order.size} onChange={(e) => handleOrderChange(idx, e)} placeholder="Size" required />
                <Input name="design" value={order.design} onChange={(e) => handleOrderChange(idx, e)} placeholder="Design" required />
              </div>
              <textarea
                name="note"
                value={order.note}
                onChange={(e) => handleOrderChange(idx, e)}
                placeholder="Additional notes"
                className="w-full border border-gray-300 rounded-md p-3 text-sm mt-4 resize-none"
                rows={2}
              />
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addOrderField} className="w-full mb-4">
            + Add Another Order
          </Button>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Order Status</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="partially paid">Partially Paid</option>
            <option value="fully paid">Fully Paid</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg" disabled={loading}>
          {loading ? "Submitting..." : "Submit Orders"}
        </Button>
      </form>
    </div>
  )
}
