"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

// ✅ Create Supabase client using your env vars
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddOrderPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    facebook: "",
    chapter: "",
    address: "",
    color: "",
    size: "",
    design: "",
    note: "",
    status: "pending",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from("orders").insert([formData])

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Order added!", description: "Successfully saved to database." })
      setFormData({
        name: "",
        phone: "",
        facebook: "",
        chapter: "",
        address: "",
        color: "",
        size: "",
        design: "",
        note: "",
        status: "pending",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="flex items-center mb-8 space-x-2">
        <img src="/logo.png" alt="The Undergrads Logo" className="h-10 w-10" />
        <h1 className="text-2xl font-bold text-gray-800">The Undergrads</h1>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg space-y-4 border border-gray-200"
      >
        <h2 className="text-lg font-semibold text-gray-700">Add New Order</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
          <Input name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Facebook" />
          <Input name="chapter" value={formData.chapter} onChange={handleChange} placeholder="Chapter" />
          <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
          <Input name="color" value={formData.color} onChange={handleChange} placeholder="Color" required />
          <Input name="size" value={formData.size} onChange={handleChange} placeholder="Size" required />
          <Input name="design" value={formData.design} onChange={handleChange} placeholder="Design" required />
        </div>

        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Additional notes"
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          rows={3}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="partially paid">Partially Paid</option>
            <option value="fully paid">Fully Paid</option>
          </select>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Order"}
        </Button>
      </form>
    </div>
  )
}
