"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"

interface Order {
  id?: number
  name: string
  phone?: string
  facebook?: string
  address?: string
  color: string
  size: string
  design: string
  price?: number
  total?: number
  quantity?: number
}

interface SummaryCardsProps {
  totalTShirts: number
  orders: Order[]
  onCardClick: (type: "total" | "designs") => void
  onDownload: (type: "total" | "byDesign" | "orders") => void
}

export default function SummaryCards({ totalTShirts, orders, onCardClick }: SummaryCardsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({})

  // ✅ Fix grouping to use full customer info (not just name)
  const ordersPerCustomer = orders.reduce((acc, o) => {
    const key = `${o.name}|${o.phone || ""}|${o.facebook || ""}|${o.address || ""}`
    if (!acc[key]) acc[key] = []
    acc[key].push(o)
    return acc
  }, {} as Record<string, Order[]>)

  const uniqueCustomersCount = Object.keys(ordersPerCustomer).length
  const designsPerSizeColor = new Set(orders.map((o) => `${o.color}-${o.size}`)).size

  const cardClass =
    "p-6 sm:p-8 cursor-pointer transition-all hover:shadow-lg hover:scale-105 flex flex-col justify-center items-center text-center"

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total T-Shirts */}
        <Card
          className={`${cardClass} bg-blue-50 border-blue-200 hover:bg-blue-100`}
          onClick={() => onCardClick?.("total")}
        >
          <div className="text-sm text-gray-600 mb-2">Total T-Shirts</div>
          <div className="text-3xl font-bold text-blue-600">{totalTShirts}</div>
        </Card>

        {/* Designs per Size and Color */}
        <Card
          className={`${cardClass} bg-green-50 border-green-200 hover:bg-green-100`}
          onClick={() => onCardClick?.("designs")}
        >
          <div className="text-sm text-gray-600 mb-2">Designs Per Size/Color</div>
          <div className="text-3xl font-bold text-green-600">{designsPerSizeColor}</div>
        </Card>

        {/* Total Customers */}
        <Card
          className={`${cardClass} bg-yellow-50 border-yellow-200 hover:bg-yellow-100`}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="text-sm text-gray-600 mb-2">Total Customers</div>
          <div className="text-3xl font-bold text-yellow-600">{uniqueCustomersCount}</div>
          <div className="text-xs text-gray-500 mt-2">
            Orders per Customer (avg): {(orders.length / uniqueCustomersCount || 0).toFixed(1)}
          </div>
        </Card>
      </div>

      {/* ✅ Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Orders</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2 max-h-[400px] overflow-y-auto">
            {Object.entries(ordersPerCustomer).map(([key, customerOrders]) => {
              const [name, phone, facebook, address] = key.split("|")
              const isExpanded = expandedCustomers[key]

              return (
                <div
                  key={key}
                  className="border rounded bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* Header */}
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() =>
                      setExpandedCustomers((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">{name}</span>
                      <span>{isExpanded ? "−" : "+"}</span>
                    </div>
                    <div className="text-xs text-gray-700 mt-1 bg-pink-100 rounded-md p-2">
                      <p><strong>📞</strong> {phone || "No phone"}</p>
                      <p><strong>📘</strong> {facebook || "No Facebook"}</p>
                      <p><strong>📍</strong> {address || "No address"}</p>
                    </div>
                  </div>

                  {/* Expanded Orders */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1">
                      {customerOrders.map((order, idx) => (
                        <div key={idx} className="flex justify-between border-b py-1">
                          <span>
                            {order.design} ({order.color}-{order.size})
                          </span>
                          <span>{order.quantity || 1} pcs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
