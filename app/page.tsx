"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
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
import autoTable from "jspdf-autotable"
import { useRouter } from "next/navigation"

// ✅ Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // --- Data ---
  const [orders, setOrders] = useState<Order[]>([])
  const [trashOrders, setTrashOrders] = useState<Order[]>([])
  const [defectiveOrders, setDefectiveOrders] = useState<Order[]>([])

  const [designs, setDesigns] = useState(["Classic", "Modern", "Vintage"])
  const [colors, setColors] = useState(["Blue", "Red", "Black", "White", "Green"])
  const [sizes] = useState(["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"])

  // --- UI States ---
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

  // ✅ Authentication
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token && isTokenValid(token)) setIsAuthenticated(true)
    setIsLoading(false)
  }, [])

  // ✅ Fetch Orders from Supabase
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching orders:", error.message)
    else setOrders(data || [])
  }

 useEffect(() => {
  fetchOrders()

  const channel = supabase
    .channel("orders-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
      fetchOrders()
    })
    .subscribe()

  // ✅ Proper cleanup (async-safe)
  return () => {
    supabase.removeChannel(channel)
  }
}, [])


  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
  }

  const handleLogin = () => setIsAuthenticated(true)

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <LoginDialog onLogin={handleLogin} />

  // --- Customer grouping ---
  const uniqueCustomers = Array.from(
    new Set(orders.map((o) => `${o.name}-${o.phone}-${o.facebook}-${o.address}`))
  ).map((key) => {
    const [name, phone, facebook, address] = key.split("-")
    const customerOrders = orders.filter(
      (o) =>
        o.name === name &&
        (o.phone || "") === phone &&
        (o.facebook || "") === facebook &&
        (o.address || "") === address
    )
    const customer = customerOrders[0]
    return {
      id: key,
      name,
      phone: customer?.phone || "",
      facebook: customer?.facebook || "",
      chapter: customer?.chapter || "",
      address: customer?.address || "",
      orders: customerOrders,
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
  const selectedCustomerObj = selectedCustomer
    ? uniqueCustomers.find((c) => c.id === selectedCustomer) || null
    : null

  // ✅ When a new order is added in AddOrderDialog, refetch
  const handleAddOrder = async () => {
    await fetchOrders()
    setShowAddOrderDialog(false)
  }

  const handleViewOrder = (customerId: string) => {
    setSelectedCustomer(customerId)
    setShowViewOrderDialog(true)
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddOrder={() => setShowAddOrderDialog(true)}
        onAddDesign={() => setShowAddDesignDialog(true)}
        onAddColor={() => setShowAddColorDialog(true)}
        onDeleteAll={() => {}}
        onViewTrash={() => setShowTrashDialog(true)}
        onLogout={handleLogout}
        onExportPDF={() => {}}
      />

      <main className="container mx-auto px-4 py-8">
        <SummaryCards
          totalTShirts={orders.length}
          orders={orders}
          onCardClick={(type) => {
            if (type === "total") setShowTShirtsBreakdown(true)
            if (type === "designs") setShowDesignsBreakdown(true)
          }}
          onDownload={() => {}}
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
          onReset={() => {
            setFilterName("")
            setFilterColor("All")
            setFilterSize("All")
            setFilterDesign("All")
          }}
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
      </main>

      {/* DIALOGS */}
      <AddOrderDialog
        open={showAddOrderDialog}
        onOpenChange={setShowAddOrderDialog}
        onAddOrder={handleAddOrder}
        colors={colors}
        designs={designs}
      />

      <ViewOrderDialog
        open={showViewOrderDialog}
        onOpenChange={setShowViewOrderDialog}
        customerName={selectedCustomerObj?.name || ""}
        customerOrders={selectedCustomerObj?.orders || []}
        colors={colors}
        designs={designs}
        onAddMoreOrder={() => {}}
        onDeleteOrder={() => {}}
        onEditOrder={() => {}}
        onMarkDefective={() => {}}
        onEditCustomer={() => {}}
      />

      <TrashDialog
        open={showTrashDialog}
        onOpenChange={setShowTrashDialog}
        trashOrders={trashOrders}
        onRetrieveOrder={() => {}}
        onDeleteOrderPermanently={() => {}}
        onRetrieveAll={() => {}}
        onDeleteAllPermanently={() => {}}
      />

      <TShirtsBreakdownDialog
        open={showTShirtsBreakdown}
        onOpenChange={setShowTShirtsBreakdown}
        orders={orders}
        type="total"
      />
      <DesignsBreakdownDialog
        open={showDesignsBreakdown}
        onOpenChange={setShowDesignsBreakdown}
        orders={orders}
      />
    </div>
  )
}
