"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#B983FF",
  "#FF9B85",
  "#FFCD56",
  "#36A2EB",
  "#FF6384",
  "#9966FF",
]

export default function DesignDistributionChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [designDetails, setDesignDetails] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])

  // 🧠 Fetch all orders grouped by design
  const fetchChartData = async () => {
    const { data, error } = await supabase.from("orders").select("*")
    if (error) {
      console.error("❌ Error fetching chart data:", error.message)
      return
    }

    // Group by design for pie chart
    const grouped: Record<string, any[]> = {}
    data?.forEach((order) => {
      const design = order.design || "Unknown"
      if (!grouped[design]) grouped[design] = []
      grouped[design].push(order)
    })

    const formatted = Object.entries(grouped).map(([design, orders]) => ({
      name: design,
      value: orders.length,
      orders,
    }))
    setChartData(formatted)

    // Compute Top Customers (unique per name + phone + address)
    const customerTotals: Record<string, number> = {}
    data?.forEach((order) => {
      const key = `${order.name}-${order.phone || ""}-${order.address || ""}`
      if (!customerTotals[key]) customerTotals[key] = 0
      customerTotals[key]++
    })

    const topList = Object.entries(customerTotals)
      .map(([key, count]) => {
        const [name, phone, address] = key.split("-")
        return { name, phone, address, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    setTopCustomers(topList)
  }

  // 🪄 Handle click on pie slice
  const handleDesignClick = (design: string | null) => {
    if (selectedDesign === design) {
      setSelectedDesign(null)
      setDesignDetails([])
      return
    }

    const selected = chartData.find((d) => d.name === design)
    if (selected) {
      const customerSummary: Record<string, any> = {}
      selected.orders.forEach((order: any) => {
        const key = `${order.name}-${order.color}-${order.size}`
        if (!customerSummary[key]) {
          customerSummary[key] = {
            name: order.name,
            color: order.color,
            size: order.size,
            count: 0,
          }
        }
        customerSummary[key].count += 1
      })
      setDesignDetails(Object.values(customerSummary))
      setSelectedDesign(design)
    }
  }

  useEffect(() => {
    fetchChartData()

    // Real-time updates
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchChartData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="mt-8 flex flex-col gap-12">
      {/* 🥧 PIE CHART + DETAILS CARD */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
        className="flex flex-col md:flex-row gap-6"
      >
        <Card className="flex-1 p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Design Distribution (by Orders)
          </h2>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handleDesignClick(data.name)}
                  isAnimationActive
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={selectedDesign === entry.name ? "#000" : "#fff"}
                      strokeWidth={selectedDesign === entry.name ? 3 : 1}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 📋 DETAILS CARD */}
        <AnimatePresence>
          {selectedDesign && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4 }}
              className="w-full md:w-[40%]"
            >
              <Card className="p-5 h-[400px] overflow-y-auto shadow-md border border-gray-200">
                <h3 className="text-lg font-bold mb-3 text-gray-700 flex justify-between items-center">
                  <span>{selectedDesign}</span>
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => setSelectedDesign(null)}
                  >
                    ✖
                  </button>
                </h3>

                {designDetails.length > 0 ? (
                  <div className="space-y-2">
                    {designDetails.map((cust, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        viewport={{ once: false }}
                        className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <p className="font-semibold text-gray-800">{cust.name}</p>
                        <p className="text-sm text-gray-600">
                          🎨 {cust.color} — 📏 {cust.size}
                        </p>
                        <p className="text-sm text-gray-500">
                          🧮 {cust.count} order(s)
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic mt-2">
                    No customer data for this design.
                  </p>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 👑 TOP CUSTOMERS SECTION */}
<motion.div
  initial={{ opacity: 0, y: 80 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // smoother curve
  viewport={{ once: false, amount: 0.3 }}
  className="mb-10"
>
  <h2 className="text-center text-lg md:text-xl font-bold text-gray-800 mb-6 tracking-wide">
    👑 Top 3 Customers
  </h2>

  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: false, amount: 0.2 }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.15, // nice smooth stagger
        },
      },
    }}
  >
    {topCustomers.slice(0, 3).map((cust, idx) => (
      <motion.div
        key={idx}
        variants={{
          hidden: { opacity: 0, y: 40, scale: 0.98 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
          },
        }}
        whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: "0 12px 25px rgba(255, 200, 0, 0.35)",
          transition: { type: "spring", stiffness: 200, damping: 12 },
        }}
        className="relative overflow-hidden p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-300 rounded-2xl shadow transition-all duration-300"
      >
        {/* 🥇🥈🥉 Medals */}
        <div className="absolute top-3 right-3 text-yellow-500 text-lg">
          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
        </div>

        <p className="text-lg font-semibold text-yellow-900 mb-1">{cust.name}</p>
        <p className="text-sm text-gray-700 mb-1">📞 {cust.phone || "N/A"}</p>
        <p className="text-sm text-gray-700 truncate mb-2">
          📍 {cust.address || "N/A"}
        </p>
        <p className="mt-2 text-sm font-medium text-yellow-700 bg-yellow-200/50 px-3 py-1 rounded-full inline-block">
          🧾 {cust.count} total orders
        </p>
      </motion.div>
    ))}
  </motion.div>
</motion.div>
    </div>
  )
}
