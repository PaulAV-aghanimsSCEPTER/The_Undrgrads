"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import SummaryCards from "@/components/summary-cards"
import FilterSection from "@/components/filter-section"
import CustomersTable from "@/components/customers-table"
import AddOrderDialog from "@/components/add-order-dialog"
import AddDesignDialog from "@/components/add-design-dialog"
import AddColorDialog from "@/components/add-color-dialog"
import ViewOrderDialog from "@/components/view-order-dialog"
import TrashDialog, { Order } from "@/components/trash-dialog"

export default function Home() {
  // ---------------- STATE ----------------
  const [orders, setOrders] = useState<Order[]>([])
  const [trashOrders, setTrashOrders] = useState<Order[]>([])

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

  const itemsPerPage = 10

  // ---------------- LOCALSTORAGE ----------------
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders")
    const savedTrash = localStorage.getItem("trashOrders")
    if (savedOrders) setOrders(JSON.parse(savedOrders))
    if (savedTrash) setTrashOrders(JSON.parse(savedTrash))
  }, [])

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem("trashOrders", JSON.stringify(trashOrders))
  }, [trashOrders])

  // ---------------- UNIQUE CUSTOMERS ----------------
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

  // ---------------- FILTERED CUSTOMERS ----------------
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

  const defectiveItems = orders.filter((o) => o.isDefective)

  // ---------------- HANDLERS ----------------
  const handleAddOrder = (newOrder: any) => {
    setOrders([
      ...orders,
      {
        ...newOrder,
        id: Math.max(...orders.map((o) => o.id), 0) + 1,
      },
    ])
    setShowAddOrderDialog(false)
  }

  const handleDeleteOrder = (orderId: number) => {
    if (confirm("Are you sure you want to delete this order?")) {
      const deleted = orders.find((o) => o.id === orderId)
      if (deleted) setTrashOrders([...trashOrders, deleted])
      setOrders(orders.filter((o) => o.id !== orderId))
    }
  }

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all orders?")) {
      setTrashOrders([...trashOrders, ...orders])
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

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <Header
        onAddOrder={() => setShowAddOrderDialog(true)}
        onAddDesign={() => setShowAddDesignDialog(true)}
        onAddColor={() => setShowAddColorDialog(true)}
        onDeleteAll={handleDeleteAll}
        onViewTrash={() => setShowTrashDialog(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <SummaryCards totalTShirts={orders.length} onDownloadBreakdown={() => {}} orders={orders} />

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
          defectiveItems={defectiveItems}
        />
      </main>

      {/* ADD / EDIT DIALOGS */}
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
        onAddDesign={(d) => {}}
        onDeleteDesign={(d) => {}}
        existingDesigns={designs}
      />
      <AddColorDialog
        open={showAddColorDialog}
        onOpenChange={setShowAddColorDialog}
        onAddColor={(c) => {}}
        onDeleteColor={(c) => {}}
        existingColors={colors}
      />
      <ViewOrderDialog
        open={showViewOrderDialog}
        onOpenChange={setShowViewOrderDialog}
        customerName={selectedCustomer}
        customerOrders={selectedCustomer ? orders.filter((o) => o.name === selectedCustomer) : []}
        colors={colors}
        designs={designs}
        onAddMoreOrder={() => {}}
        onDeleteOrder={handleDeleteOrder}
        onEditOrder={() => {}}
        onMarkDefective={() => {}}
        onEditCustomer={() => {}}
      />

      {/* TRASH DIALOG */}
      <TrashDialog
        open={showTrashDialog}
        onOpenChange={setShowTrashDialog}
        trashOrders={trashOrders}
        onRetrieveOrder={(id) => {
          const retrieved = trashOrders.find((o) => o.id === id)
          if (retrieved) {
            setOrders([...orders, retrieved])
            setTrashOrders(trashOrders.filter((o) => o.id !== id))
          }
        }}
        onDeleteOrderPermanently={(id) => {
          setTrashOrders(trashOrders.filter((o) => o.id !== id))
        }}
        onRetrieveAll={() => {
          setOrders([...orders, ...trashOrders])
          setTrashOrders([])
        }}
        onDeleteAllPermanently={() => {
          setTrashOrders([])
        }}
      />
    </div>
  )
}
