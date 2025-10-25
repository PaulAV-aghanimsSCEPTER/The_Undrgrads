"use client"

import { useState, useEffect } from "react"
import { isTokenValid } from "@/lib/jwt"
import LoginDialog from "@/components/login-dialog"
import Header from "@/components/header"
import SummaryCards from "@/components/summary-cards"
import FilterSection from "@/components/filter-section"
import CustomersTable from "@/components/customers-table"
import AddOrderDialog from "@/components/add-order-dialog"
import AddDesignDialog from "@/components/add-design-dialog"
import AddColorDialog from "@/components/add-color-dialog"
import ViewOrderDialog from "@/components/view-order-dialog"
import TrashDialog, { type Order } from "@/components/trash-dialog"
import TShirtsBreakdownDialog from "@/components/tshirts-breakdown-dialog"
import DesignsBreakdownDialog from "@/components/designs-breakdown-dialog"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [trashOrders, setTrashOrders] = useState<Order[]>([])
  const [defectiveOrders, setDefectiveOrders] = useState<Order[]>([])

  const [designs, setDesigns] = useState(["Classic", "Modern", "Vintage"])
  const [colors, setColors] = useState(["Blue", "Red", "Black", "White", "Green"])
  const [sizes] = useState(["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"])

  const [filterName, setFilterName] = useState("")
  const [filterColor, setFilterColor] = useState("All")
  const [filterSize, setFilterSize] = useState("All")
  const [filterDesign, setFilterDesign] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddOrderDialog, setShowAddOrderDialog] = useState(false)
  const [showAddDesignDialog, setShowAddDesignDialog] = useState(false)
  const [showAddColorDialog, setShowAddColorDialog] = useState(false)
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false)
  const [showTrashDialog, setShowTrashDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [showTShirtsBreakdown, setShowTShirtsBreakdown] = useState(false)
  const [showDesignsBreakdown, setShowDesignsBreakdown] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token && isTokenValid(token)) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders")
    const savedTrash = localStorage.getItem("trashOrders")
    const savedDefective = localStorage.getItem("defectiveOrders")
    const savedColors = localStorage.getItem("colors")
    const savedDesigns = localStorage.getItem("designs")

    if (savedOrders) setOrders(JSON.parse(savedOrders))
    if (savedTrash) setTrashOrders(JSON.parse(savedTrash))
    if (savedDefective) setDefectiveOrders(JSON.parse(savedDefective))
    if (savedColors) setColors(JSON.parse(savedColors))
    if (savedDesigns) setDesigns(JSON.parse(savedDesigns))
  }, [])

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem("trashOrders", JSON.stringify(trashOrders))
  }, [trashOrders])

  useEffect(() => {
    localStorage.setItem("defectiveOrders", JSON.stringify(defectiveOrders))
  }, [defectiveOrders])

  useEffect(() => {
    localStorage.setItem("colors", JSON.stringify(colors))
  }, [colors])

  useEffect(() => {
    localStorage.setItem("designs", JSON.stringify(designs))
  }, [designs])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
  }

  const handleLogin = (token: string) => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginDialog onLogin={handleLogin} />
  }

  const uniqueCustomers = Array.from(new Set(orders.map((o) => o.name))).map((name) => {
    const customer = orders.find((o) => o.name === name)
    return {
      name,
      facebook: customer?.facebook || "",
      phone: customer?.phone || "",
      chapter: customer?.chapter || "",
      address: customer?.address || "",
      orders: orders.filter((o) => o.name === name),
    }
  })

  const filteredCustomers = uniqueCustomers.filter((customer) => {
    const matchesName = customer.name.toLowerCase().includes(filterName.toLowerCase())
    const hasMatchingOrder = customer.orders.some((order) => {
      const matchesColor = filterColor === "All" || order.color === filterColor
      const matchesSize = filterSize === "All" || order.size === filterSize
      const matchesDesign = filterDesign === "All" || order.design === filterDesign
      return matchesColor && matchesSize && matchesDesign
    })
    return matchesName && hasMatchingOrder
  })

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const nextId = () =>
    orders.length + trashOrders.length + defectiveOrders.length === 0
      ? 1
      : Math.max(
          0,
          ...orders.map((o) => o.id || 0),
          ...trashOrders.map((t) => t.id || 0),
          ...defectiveOrders.map((d) => d.id || 0),
        ) + 1

  const handleAddOrder = (newOrders: any[] | any) => {
    const incoming = Array.isArray(newOrders) ? newOrders : [newOrders]

    setOrders((prev) => {
      const start = nextId()
      const withIds = incoming.map((order, i) => ({ ...order, id: start + i, isDefective: false }))
      return [...prev, ...withIds]
    })
    setShowAddOrderDialog(false)
  }

  const handleAddMoreOrder = (order: any) => {
    setOrders((prev) => {
      const id = nextId()
      return [...prev, { ...order, id, isDefective: false }]
    })
  }

  const handleDeleteOrder = (orderId: number) => {
    if (confirm("Are you sure you want to delete this order?")) {
      const deleted = orders.find((o) => o.id === orderId)
      if (deleted) setTrashOrders((prev) => [...prev, deleted])
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
    }
  }

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all orders?")) {
      setTrashOrders((prev) => [...prev, ...orders])
      setOrders([])
      setCurrentPage(1)
    }
  }

  const handleResetFilters = () => {
    setFilterName("")
    setFilterColor("All")
    setFilterSize("All")
    setFilterDesign("All")
    setCurrentPage(1)
  }

  const handleViewOrder = (customerName: string) => {
    setSelectedCustomer(customerName)
    setShowViewOrderDialog(true)
  }

  const handleMarkDefective = (orderId: number, note?: string) => {
    const found = orders.find((o) => o.id === orderId)
    if (!found) return
    const defective = {
      ...found,
      isDefective: true,
      defectiveNote: note || "",
      defectiveDate: new Date().toISOString().split("T")[0],
    }
    setDefectiveOrders((prev) => [...prev, defective])
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }

  const handleEditCustomer = (updatedCustomer: any) => {
    if (!selectedCustomer) return
    setOrders((prev) =>
      prev.map((o) =>
        o.name === selectedCustomer ? { ...o, ...updatedCustomer, name: updatedCustomer.name || o.name } : o,
      ),
    )
    setSelectedCustomer(updatedCustomer.name || selectedCustomer)
  }

  

// Extend Order type for reports
type ExtendedOrder = Order & {
  total?: number | string
  status?: string
  price?: number | string
}

const handleDownload = (type: "total" | "byDesign" | "orders") => {
  const typedOrders = orders as ExtendedOrder[]
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const center = (text: string, y: number) =>
    doc.text(text, pageWidth / 2, y, { align: "center" })
  const date = new Date().toLocaleDateString()
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)


  // 🧾 ORDERS REPORT (grouped per customer, with single total)
if (type === "orders") {
  center("ORDERS REPORT", 15)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  // ✅ Group orders by customer name
  const grouped = typedOrders.reduce((acc, order) => {
    if (!acc[order.name]) acc[order.name] = []
    acc[order.name].push(order)
    return acc
  }, {} as Record<string, ExtendedOrder[]>)

  const customers = Object.keys(grouped)
  let y = 28

  customers.forEach((name, index) => {
    const customerOrders = grouped[name]
    const customer = customerOrders[0]

    // 🧍 Customer Info
    doc.setFont("helvetica", "bold")
    doc.text(`Customer: ${name}`, 14, y)
    y += 6
    doc.setFont("helvetica", "normal")
    if (customer.phone) doc.text(`Phone: ${customer.phone}`, 20, y), (y += 5)
    if (customer.address) doc.text(`Address: ${customer.address}`, 20, y), (y += 5)
    if (customer.chapter) doc.text(`Chapter: ${customer.chapter}`, 20, y), (y += 5)

    // 🧾 Orders List
    y += 3
    doc.setFont("helvetica", "bold")
    doc.text("ORDERS:", 20, y)
    doc.setFont("helvetica", "normal")
    y += 5

    let customerTotal = 0

    customerOrders.forEach((order) => {
      const price = Number(order.total) || 0
      customerTotal += price

      doc.text(`• ${order.design} | ${order.color} | ${order.size}`, 25, y)
      y += 5
      doc.text(
        `  Price: ₱${price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}   Status: ${order.status || "N/A"}`,
        30,
        y
      )
      y += 6
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    // 💰 Customer total (once only)
    y += 3
    doc.setFont("helvetica", "bold")
    doc.text(
      `Total: ₱${customerTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
      20,
      y
    )
    doc.setFont("helvetica", "normal")
    y += 8

    // Divider line
    doc.text("________________________________________", 14, y)
    y += 10

    if (y > 270 && index < customers.length - 1) {
      doc.addPage()
      y = 20
    }
  })

  // 🧮 Total customers
  doc.setFont("helvetica", "bold")
  doc.text(`TOTAL CUSTOMERS: ${customers.length}`, 14, 280)
  doc.setFont("helvetica", "italic")
  center(`Generated on: ${date}`, 288)
  doc.save("orders-report.pdf")
  return
}

  // 🟦 TOTAL REPORT
  if (type === "total") {
    center("THE UNDERGRADS", 15)
    center("Total Ordered T-Shirts", 22)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const breakdown = typedOrders.reduce((acc, o) => {
      const key = `${o.color}-${o.size}`
      if (!acc[key]) acc[key] = { color: o.color, size: o.size, quantity: 0 }
      acc[key].quantity++
      return acc
    }, {} as Record<string, { color: string; size: string; quantity: number }>)

    const sorted = Object.values(breakdown).sort((a, b) => {
      if (a.color !== b.color) return a.color.localeCompare(b.color)
      return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
    })

    let y = 35
    let total = 0
    let currentColor = ""

    sorted.forEach((item) => {
      if (item.color !== currentColor) {
        if (currentColor !== "") {
          doc.text("_____________________________________________________", 14, y)
          y += 6
        }
        currentColor = item.color
        doc.setFont("helvetica", "bold")
        doc.text(`COLOR: ${currentColor}`, 14, y)
        y += 6
        doc.setFont("helvetica", "normal")
      }

      doc.text(`Size: ${item.size}   Qty: ${item.quantity}`, 20, y)
      total += item.quantity
      y += 6
      if (y > 270) { doc.addPage(); y = 20 }
    })

    y += 8
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL = ${total}`, 14, y)
    doc.setFont("helvetica", "italic")
    center(`Generated on: ${date}`, 288)
    doc.save("tshirts-total.pdf")
    return
  }

  // 🎨 BY DESIGN REPORT
  if (type === "byDesign") {
    center("THE UNDERGRADS", 15)
    center("Ordered T-Shirts With Design", 22)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const breakdown = typedOrders.reduce((acc, o) => {
      const key = `${o.design}-${o.color}-${o.size}`
      if (!acc[key]) acc[key] = { design: o.design, color: o.color, size: o.size, quantity: 0 }
      acc[key].quantity++
      return acc
    }, {} as Record<string, { design: string; color: string; size: string; quantity: number }>)

    const sorted = Object.values(breakdown).sort((a, b) => {
      if (a.design !== b.design) return a.design.localeCompare(b.design)
      if (a.color !== b.color) return a.color.localeCompare(b.color)
      return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
    })

    let y = 35
    let total = 0
    let currentDesign = ""
    let currentColor = ""

    sorted.forEach((item) => {
      if (item.design !== currentDesign) {
        if (currentDesign !== "") {
          doc.text("_____________________________________________________", 14, y)
          y += 6
        }
        currentDesign = item.design
        y += 6
        doc.setFont("helvetica", "bold")
        doc.text(`DESIGN: ${currentDesign}`, 14, y)
        y += 5
        currentColor = ""
      }

      if (item.color !== currentColor) {
        currentColor = item.color
        y += 6
        doc.text(`Color: ${currentColor}`, 18, y)
        y += 4
      }

      doc.setFont("helvetica", "normal")
      doc.text(`Size: ${item.size}   Qty: ${item.quantity}`, 25, y)
      y += 6
      total += item.quantity

      if (y > 270) { doc.addPage(); y = 20 }
    })

    y += 8
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL = ${total}`, 14, y)
    doc.setFont("helvetica", "italic")
    center(`Generated on: ${date}`, 288)
    doc.save("tshirts-by-design.pdf")
    return
  }
}






  const handleSummaryCardClick = (type: "total" | "designs") => {
    if (type === "total") {
      setShowTShirtsBreakdown(true)
    } else if (type === "designs") {
      setShowDesignsBreakdown(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <Header
        onAddOrder={() => setShowAddOrderDialog(true)}
        onAddDesign={() => setShowAddDesignDialog(true)}
        onAddColor={() => setShowAddColorDialog(true)}
        onDeleteAll={handleDeleteAll}
        onViewTrash={() => setShowTrashDialog(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        <SummaryCards
          totalTShirts={orders.length}
          orders={orders}
          onCardClick={handleSummaryCardClick}
          onDownload={handleDownload}
        />

        <FilterSection
          filterName={filterName}
          setFilterName={setFilterName}
          filterColor={filterColor}
          setFilterColor={setFilterColor}
          filterSize={filterSize}
          setFilterSize={setFilterSize}
          filterDesign={filterDesign}
          setFilterDesign={setFilterDesign}
          colors={colors}
          designs={designs}
          sizes={sizes}
          onReset={handleResetFilters}
          onFilter={() => setCurrentPage(1)}
        />

        <CustomersTable
          customers={paginatedCustomers}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          onPageChange={setCurrentPage}
          onViewOrder={handleViewOrder}
          defectiveItems={defectiveOrders}
        />

        {defectiveOrders.length > 0 && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-700">Defective Items ({defectiveOrders.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm("Retrieve all defective items?")) {
                      setOrders((prev) => [...prev, ...defectiveOrders])
                      setDefectiveOrders([])
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Retrieve All
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete all defective items permanently?")) {
                      setDefectiveOrders([])
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-red-300">
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Color</th>
                    <th className="text-left p-2">Size</th>
                    <th className="text-left p-2">Design</th>
                    <th className="text-left p-2">Defect Note</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {defectiveOrders.map((order) => (
                    <tr key={order.id} className="border-b border-red-200 hover:bg-red-100">
                      <td className="p-2">{order.name}</td>
                      <td className="p-2">{order.color}</td>
                      <td className="p-2">{order.size}</td>
                      <td className="p-2">{order.design}</td>
                      <td className="p-2 text-xs">{order.defectiveNote}</td>
                      <td className="p-2 text-xs">{order.defectiveDate}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setOrders((prev) => [...prev, order])
                              setDefectiveOrders((prev) => prev.filter((o) => o.id !== order.id))
                            }}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          >
                            Retrieve
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this defective item permanently?")) {
                                setDefectiveOrders((prev) => prev.filter((o) => o.id !== order.id))
                              }
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* DIALOGS */}
      <AddOrderDialog
        open={showAddOrderDialog}
        onOpenChange={setShowAddOrderDialog}
        onAddOrder={handleAddOrder}
        colors={colors}
        designs={designs}
      />
      <AddDesignDialog
        open={showAddDesignDialog}
        onOpenChange={setShowAddDesignDialog}
        onAddDesign={(d) => setDesigns((p) => [...p, d])}
        onDeleteDesign={(d) => setDesigns((p) => p.filter((x) => x !== d))}
        existingDesigns={designs}
      />
      <AddColorDialog
        open={showAddColorDialog}
        onOpenChange={setShowAddColorDialog}
        onAddColor={(c) => setColors((p) => [...p, c])}
        onDeleteColor={(c) => setColors((p) => p.filter((x) => x !== c))}
        existingColors={colors}
      />
      <ViewOrderDialog
        open={showViewOrderDialog}
        onOpenChange={setShowViewOrderDialog}
        customerName={selectedCustomer}
        customerOrders={selectedCustomer ? orders.filter((o) => o.name === selectedCustomer) : []}
        colors={colors}
        designs={designs}
        onAddMoreOrder={handleAddMoreOrder}
        onDeleteOrder={handleDeleteOrder}
        onEditOrder={(order) => {
          setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...order } : o)))
        }}
        onMarkDefective={handleMarkDefective}
        onEditCustomer={handleEditCustomer}
      />

      {/* TRASH DIALOG */}
      <TrashDialog
        open={showTrashDialog}
        onOpenChange={setShowTrashDialog}
        trashOrders={trashOrders}
        onRetrieveOrder={(id) => {
          const retrieved = trashOrders.find((o) => o.id === id)
          if (retrieved) {
            setOrders((prev) => [...prev, retrieved])
            setTrashOrders((prev) => prev.filter((o) => o.id === id))
          }
        }}
        onDeleteOrderPermanently={(id) => {
          setTrashOrders((prev) => prev.filter((o) => o.id !== id))
        }}
        onRetrieveAll={() => {
          setOrders((prev) => [...prev, ...trashOrders])
          setTrashOrders([])
        }}
        onDeleteAllPermanently={() => {
          setTrashOrders([])
        }}
      />

      <TShirtsBreakdownDialog
        open={showTShirtsBreakdown}
        onOpenChange={setShowTShirtsBreakdown}
        orders={orders}
        type="total"
      />
      <DesignsBreakdownDialog open={showDesignsBreakdown} onOpenChange={setShowDesignsBreakdown} orders={orders} />
    </div>
  )
}
