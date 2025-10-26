"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Order {
  id?: number
  name: string
  color: string
  size: string
  design: string
}

export default function DesignsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) setOrders(JSON.parse(savedOrders))
  }, [])

  const groupedByDesign = orders.reduce((acc, o) => {
    if (!acc[o.design]) acc[o.design] = []
    acc[o.design].push(o)
    return acc
  }, {} as Record<string, Order[]>)

  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Designs by Color and Size
          </h1>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {Object.keys(groupedByDesign).length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            No orders found.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDesign).map(([design, designOrders]) => {
              // Group by color -> sizes
              const groupedColorSize = designOrders.reduce((acc, o) => {
                if (!acc[o.color]) acc[o.color] = {}
                if (!acc[o.color][o.size]) acc[o.color][o.size] = 0
                acc[o.color][o.size]++
                return acc
              }, {} as Record<string, Record<string, number>>)

              const total = Object.values(groupedColorSize)
                .flatMap((sizes) => Object.values(sizes))
                .reduce((a, b) => a + b, 0)

              return (
                <div
                  key={design}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="bg-blue-600 text-white px-5 py-3 font-semibold text-lg">
                    {design.toUpperCase()}
                  </div>

                  {/* Each Color Table */}
                  <div className="divide-y divide-black-200">
                    {Object.entries(groupedColorSize).map(([color, sizes]) => (
                      <div key={color}>
                        <div className="bg-red-100 px-4 py-2 font-semibold text-red-700">
                          {color}
                        </div>
                        <table className="w-full text-sm sm:text-base">
                          <thead className="bg-black-50 text-black-700 border-b">
                            <tr>
                              <th className="text-left px-4 py-2">Size</th>
                              <th className="text-left px-4 py-2">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(sizes)
                              .sort(
                                (a, b) =>
                                  sizeOrder.indexOf(a[0]) - sizeOrder.indexOf(b[0])
                              )
                              .map(([size, qty]) => (
                                <tr
                                  key={size}
                                  className="border-t hover:bg-gray-50 transition"
                                >
                                  <td className="px-4 py-2">{size}</td>
                                  <td className="px-4 py-2 font-medium">{qty}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ))}

                    {/* Total per Design */}
                    <div className="bg-gray-50 text-left font-semibold text-gray-700 px-4 py-3">
                      Total: {total}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
