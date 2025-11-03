"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
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
import DefectiveItemsDialog from "@/components/defective-items-dialog"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ColorByDesignChart from "@/components/ColorByDesignChart"
import { toast } from "@/components/ui/use-toast"



export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  

  // --- Data ---
  const [orders, setOrders] = useState<Order[]>([])
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [trashOrders, setTrashOrders] = useState<Order[]>([])
  const [defectiveOrders, setDefectiveOrders] = useState<Order[]>([])

 const [designs, setDesigns] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
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
  const [showDefectiveDialog, setShowDefectiveDialog] = useState(false)
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
  

// ✅ Defective items
const fetchDefectiveOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("is_defective", true)
    .order("id", { ascending: false })

  if (error) console.error("❌ Error fetching defective items:", error)
  else setDefectiveOrders(data || [])
}

const handleEditDefectiveNote = async (id: number, newNote: string) => {
  try {
    const { error } = await supabase
      .from("orders") // or "defective_orders" depending on your table name
      .update({ defective_note: newNote })
      .eq("id", id)

    if (error) throw error

    // 🧠 Update UI instantly
    setDefectiveOrders((prev: any[]) =>
      prev.map((order) =>
        order.id === id ? { ...order, defective_note: newNote } : order
      )
    )

    toast({
      title: "✅ Note updated successfully!",
      description: "The defective note has been saved.",
    })
  } catch (err: any) {
    console.error("❌ Error updating defective note:", err.message)
    toast({
      title: "Error updating note",
      description: err.message,
      variant: "destructive",
    })
  }
}

  

// ✅ Export Orders to PDF
// ✅ 1. Export: Total T-Shirts Summary (with aligned Size + Color)
const handleExportTotalPDF = () => {
  if (!orders.length) {
    alert("No orders to export.")
    return
  }

  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text("Total Ordered Tshirts", 14, 15)

  // ✅ Group by color + size
  const grouped: Record<string, Record<string, number>> = {}

  orders.forEach((o) => {
    const color = o.color || "Unknown"
    const size = o.size || "Unknown"
    if (!grouped[color]) grouped[color] = {}
    grouped[color][size] = (grouped[color][size] || 0) + 1
  })

  const tableData: any[] = []
  let overallTotal = 0

  Object.entries(grouped).forEach(([color, sizes], index, arr) => {
    Object.entries(sizes).forEach(([size, qty]) => {
      tableData.push([color, size, qty])
      overallTotal += qty
    })

    // ✅ Add a light green divider after each color group (except last)
    if (index < arr.length - 1) {
      tableData.push([
        {
          content: "",
          colSpan: 3,
          styles: { fillColor: [144, 238, 144] }, // light green divider
        },
      ])
    }
  })

  // ✅ Add overall total row
  tableData.push([
    {
      content: "Overall Total",
      colSpan: 2,
      styles: { halign: "right", fontStyle: "bold" },
    },
    { content: overallTotal.toString(), styles: { fontStyle: "bold" } },
  ])

  autoTable(doc, {
    head: [["Color", "Size", "Quantity"]],
    body: tableData,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: [20, 40, 80], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [235, 242, 245] },
  })

  doc.save("Total_Ordered_Tshirts.pdf")
}



// ✅ 2. Export: Orders by Design (aligned columns)
const handleExportByDesignPDF = () => {
  if (!orders.length) {
    alert("No orders to export.")
    return
  }

  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text("Orders by Design", 14, 15)

  // ✅ Group by design → color → size
  const grouped: Record<string, Record<string, Record<string, number>>> = {}

  orders.forEach((o) => {
    const design = o.design || "Unknown"
    const color = o.color || "Unknown"
    const size = o.size || "Unknown"

    if (!grouped[design]) grouped[design] = {}
    if (!grouped[design][color]) grouped[design][color] = {}
    grouped[design][color][size] = (grouped[design][color][size] || 0) + 1
  })

  const tableData: any[] = []
  let overallTotal = 0

  Object.entries(grouped).forEach(([design, colors], index, arr) => {
    Object.entries(colors).forEach(([color, sizes]) => {
      Object.entries(sizes).forEach(([size, qty]) => {
        tableData.push([design, color, size, qty])
        overallTotal += qty
      })
    })

    // ✅ Add light green divider after each design (except last)
    if (index < arr.length - 1) {
      tableData.push([
        {
          content: "",
          colSpan: 4,
          styles: { fillColor: [144, 238, 144] }, // light green
        },
      ])
    }
  })

  // ✅ Add Overall Total at bottom
  tableData.push([
    {
      content: "Overall Total",
      colSpan: 3,
      styles: { halign: "right", fontStyle: "bold" },
    },
    { content: overallTotal.toString(), styles: { fontStyle: "bold" } },
  ])

  autoTable(doc, {
    head: [["Design", "Color", "Size", "Quantity"]],
    body: tableData,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: [20, 40, 80], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [235, 242, 245] },
  })

  doc.save("Orders_By_Design.pdf")
}


// ✅ 3. Export: Detailed Orders Report (with colored customer headers)
const handleExportOrdersPDF = () => {
  if (!orders.length) {
    alert("No orders to export.")
    return
  }

  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text("Customers Orders", 14, 15)

  // Group by unique customer identity (name + phone + address)
  const grouped: Record<string, any[]> = {}
  orders.forEach((o) => {
    const key = `${o.name || "Unknown"}|${o.phone || "NoPhone"}|${o.address || "NoAddress"}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(o)
  })

  let startY = 25

  Object.entries(grouped).forEach(([key, items]) => {
    const [name, phone, address] = key.split("|")

    // Green header bar
    doc.setFillColor(90, 180, 50)
    doc.rect(10, startY - 4, 190, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.text(`Customer: ${name}`, 14, startY + 2)
    doc.setTextColor(0, 0, 0)
    startY += 8

    // Customer orders
    const tableData = items.map((o) => [
      o.design || "",
      o.color || "",
      o.size || "",
      o.quantity || 1,
      o.price ? `php = ${o.price}` : "php = 0",
      o.created_at ? new Date(o.created_at).toLocaleDateString() : "",
    ])

    autoTable(doc, {
      head: [["Design", "Color", "Size", "Quantity", "Price", "Date"]],
      body: tableData,
      startY,
      theme: "grid",
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [20, 40, 80], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [235, 242, 245] },
      margin: { left: 14 },
    })

    startY = (doc as any).lastAutoTable.finalY + 10
  })

  doc.save("Customers_Orders.pdf")
}


const handleExportShippingInfo = () => {
  if (!orders.length) {
    alert("No shipping information to export.")
    return
  }

  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text("Shipping Information", 14, 15)

  const groupedCustomers: Record<
    string,
    { address?: string; phone?: string; totalOrder: number }
  > = {}

  orders.forEach((o) => {
    const key = `${o.name || "Unknown"}|${o.phone || "NoPhone"}|${o.address || "NoAddress"}`
    if (!groupedCustomers[key]) {
      groupedCustomers[key] = {
        address: o.address || "N/A",
        phone: o.phone || "N/A",
        totalOrder: 0,
      }
    }
    groupedCustomers[key].totalOrder++
  })

  const tableData = Object.entries(groupedCustomers).map(([key, info]) => {
    const [name] = key.split("|")
    return [name, info.address, info.totalOrder, info.phone]
  })

  autoTable(doc, {
    head: [["Name", "Address", "Total Order", "Phone"]],
    body: tableData,
    startY: 25,
    styles: { halign: "left" },
    headStyles: { fillColor: [144, 238, 144] },
  })

  const totalCustomers = Object.keys(groupedCustomers).length
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.text(`Total Customers: ${totalCustomers}`, 14, finalY)

  doc.save("shipping_info.pdf")
}


const fetchOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("is_deleted", false)
    .eq("is_defective", false)
    .order("id", { ascending: false })

  if (error) console.error("❌ Error fetching orders:", error)
  else setOrders(data || [])
}


  // ✅ Fetch Trash
const fetchTrashOrders = async () => {
  const { data, error } = await supabase
    .from("trash_orders")
    .select("*")
    .order("deleted_at", { ascending: false })

  if (error) {
    console.error("❌ Error fetching trash_orders:", error)
  } else {
    setTrashOrders(data || [])
  }
}


  // ✅ Fetch Designs and Colors from Supabase
  const fetchDesignsAndColors = async () => {
    const { data: designData } = await supabase.from("designs").select("*").order("created_at", { ascending: false })
    const { data: colorData } = await supabase.from("colors").select("*").order("created_at", { ascending: false })
    setDesigns(designData?.map((d) => d.name) || [])
    setColors(colorData?.map((c) => c.name) || [])
  }

  // ✅ Initial Fetch
useEffect(() => {
  fetchOrders()
  fetchDefectiveOrders()
  fetchTrashOrders()
  fetchDesignsAndColors()

  const channel = supabase
    .channel("orders-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
      fetchOrders()
      fetchDefectiveOrders()
    })
    .subscribe()

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

  // ✅ Filter Logic
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
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const selectedCustomerObj = selectedCustomer
    ? uniqueCustomers.find((c) => c.id === selectedCustomer) || null
    : null

  // ✅ Delete a single order → Move to Trash
 const handleDeleteOrder = (orderId: number) => {
    const orderToTrash = orders.find(o => o.id === orderId)
    if (orderToTrash) {
      setOrders(prev => prev.filter(o => o.id !== orderId))
      setTrashOrders(prev => [...prev, orderToTrash])
    }
  }

// Retrieve single order
const handleRetrieveOrder = (orderId: number) => {
  const orderToRestore = trashOrders.find((order) => order.id === orderId)
  if (orderToRestore) {
    setTrashOrders((prev) => prev.filter((order) => order.id !== orderId))
    setOrders((prev) => [...prev, orderToRestore])
  }
}

// Permanently delete single order
const handleDeleteOrderPermanently = (orderId: number) => {
  setTrashOrders((prev) => prev.filter((order) => order.id !== orderId))
}

// Retrieve all
const handleRetrieveAll = () => {
  setOrders((prev) => [...prev, ...trashOrders])
  setTrashOrders([])
}

// Delete all permanently
const handleDeleteAllPermanently = () => {
  setTrashOrders([])
}


const handleMarkDefective = async (orderId: number, note: string = "") => {
  const { error } = await supabase
    .from("orders")
    .update({ is_defective: true, defective_note: note })
    .eq("id", orderId)

  if (error) {
    console.error("❌ Failed to mark defective:", error)
    return
  }

  await fetchOrders()
  await fetchDefectiveOrders()
  alert("✅ Order marked as defective!")
}





  const handleAddOrder = async () => {
    await fetchOrders()
    setShowAddOrderDialog(false)
  }

  const handleViewOrder = (customerId: string) => {
    setSelectedCustomer(customerId)
    setShowViewOrderDialog(true)
  }

  // ✅ Delete All → Move to Trash
 // ✅ Delete All → Move to Trash (fixed)
const handleDeleteAll = async () => {
  if (!confirm("Are you sure you want to delete all orders?")) return

  try {
    // 1️⃣ Get all current orders
    const { data: allOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")

    if (fetchError) throw fetchError
    if (!allOrders || allOrders.length === 0) {
      alert("No orders to delete.")
      return
    }

    // 2️⃣ Move them to trash_orders (excluding id)
    const { error: moveError } = await supabase.from("trash_orders").insert(
      allOrders.map((o) => ({
        name: o.name,
        phone: o.phone,
        facebook: o.facebook,
        chapter: o.chapter,
        address: o.address,
        color: o.color,
        size: o.size,
        design: o.design,
        price: o.price,
        note: o.note,
        status: o.status,
        payment_status: o.payment_status,
        defective_note: o.defective_note,
        is_defective: o.is_defective,
        is_deleted: true,
        is_trashed: true,
        deleted_at: new Date(),
        created_at: o.created_at,
      }))
    )

    if (moveError) throw moveError

    // 3️⃣ Delete all from orders
    const { error: deleteError } = await supabase.from("orders").delete().neq("id", 0)
    if (deleteError) throw deleteError

    // 4️⃣ Refresh data
    await fetchOrders()
    await fetchTrashOrders()

    alert("✅ All orders moved to Trash successfully!")
  } catch (err: any) {
    console.error("❌ Error moving to trash:", err.message)
    alert("Failed to delete all orders.")
  }
}


  // --- Render ---
  return (
    <div className="min-h-screen bg-background">
<Header
  onAddOrder={() => setShowAddOrderDialog(true)}
  onAddDesign={() => setShowAddDesignDialog(true)}
  onAddColor={() => setShowAddColorDialog(true)}
  onDeleteAll={handleDeleteAll}
  onViewTrash={() => setIsTrashOpen(true)} 
  onLogout={handleLogout}
  onExportTotalPDF={handleExportTotalPDF}     // ✅ now correct
  onExportByDesignPDF={handleExportByDesignPDF} // ✅ now correct
  onExportOrdersPDF={handleExportOrdersPDF} 
  onExportShippingInfo={handleExportShippingInfo}  // ✅ now correct
/>




      {/* ✅ Add Design Dialog */}
      
      <AddDesignDialog
  open={showAddDesignDialog}
  onOpenChange={setShowAddDesignDialog}
  onAddDesign={(newDesign) => {
    setDesigns((prev) => [...prev, newDesign]) // ← update parent state immediately
  }}
  onDeleteDesign={(designToDelete) => {
    setDesigns((prev) => prev.filter((d) => d !== designToDelete))
  }}
  existingDesigns={designs}
/>

      {/* ✅ Add Color Dialog — FIXED */}
      <AddColorDialog
  open={showAddColorDialog}
  onOpenChange={setShowAddColorDialog}
  onAddColor={async (color) => {
    // You can still do something when a color is added (optional)
    console.log("Added color:", color)
  }}
  onDeleteColor={async (color) => {
    // Supabase deletion is already handled inside AddColorDialog, 
    // but if you want to perform extra actions, you can do it here.
    console.log("Deleted color:", color)
  }}
/>


      <main className="container mx-auto px-4 py-8">
<SummaryCards
  totalTShirts={orders.length}
  orders={orders}
  onCardClick={(type: "total" | "designs" | "customers") => {
    if (type === "total") setShowTShirtsBreakdown(true)
    if (type === "designs") setShowDesignsBreakdown(true)
    if (type === "customers") {
      // Optional: handle customer card click
      console.log("Customers card clicked")
    }
  }}
  onDownload={(type: "total" | "byDesign" | "orders") => {
    if (type === "total") handleExportTotalPDF()
    if (type === "byDesign") handleExportByDesignPDF()
    if (type === "orders") handleExportOrdersPDF()
  }}
/>

{/* ✅ View Defective Items Button */}
<div className="flex justify-end mb-4">
  <button
    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2"
    onClick={() => setShowDefectiveDialog(true)}
  >
    🧩 Defective Items
    <span className="bg-white text-yellow-700 font-bold rounded-full px-2 py-0.5 text-sm">
      {defectiveOrders.length}
    </span>
  </button>
</div>


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

      {/* ✅ Add Order Dialog */}
      <AddOrderDialog
        open={showAddOrderDialog}
        onOpenChange={setShowAddOrderDialog}
        onAddOrder={handleAddOrder}
        colors={colors}
        designs={designs}
      />

 {/* ✅ View Orders Dialog */}
<ViewOrderDialog
  open={showViewOrderDialog}
  onOpenChange={setShowViewOrderDialog}
  customerName={selectedCustomerObj?.name || ""}
  customerOrders={selectedCustomerObj?.orders || []}
  colors={colors}
  designs={designs}
  onAddMoreOrder={() => setShowAddOrderDialog(true)}
onDeleteOrder={handleDeleteOrder}
  onEditOrder={() => {}}
  onMarkDefective={(orderId, note) => handleMarkDefective(orderId, note || "")}
  onEditCustomer={() => {}}
/>


      {/* ✅ Trash Dialogs */}
{/* ✅ Trash Dialogs */}
<TrashDialog
  open={isTrashOpen}
  onOpenChange={setIsTrashOpen}
  
  trashOrders={trashOrders}
  onRetrieveOrder={async (orderId) => {
    try {
      // Get the order from trash
      const { data: orderToRestore, error: fetchError } = await supabase
        .from("trash_orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (fetchError) throw fetchError
      if (!orderToRestore) {
        alert("Order not found in trash.")
        return
      }

      // Move back to orders table
      const { error: insertError } = await supabase.from("orders").insert([
        {
          name: orderToRestore.name,
          phone: orderToRestore.phone,
          facebook: orderToRestore.facebook,
          chapter: orderToRestore.chapter,
          address: orderToRestore.address,
          color: orderToRestore.color,
          size: orderToRestore.size,
          design: orderToRestore.design,
          price: orderToRestore.price,
          is_defective: orderToRestore.is_defective,
          defective_note: orderToRestore.defective_note,
          payment_status: orderToRestore.payment_status,
          created_at: new Date(), // set new timestamp
        },
      ])

      if (insertError) throw insertError

      // Remove it from trash_orders
      const { error: deleteError } = await supabase
        .from("trash_orders")
        .delete()
        .eq("id", orderId)
      if (deleteError) throw deleteError

      await fetchOrders()
      await fetchTrashOrders()
      alert("✅ Order successfully retrieved!")
    } catch (err: any) {
      console.error("❌ Error retrieving order:", err.message)
      alert("Failed to retrieve order.")
    }
  }}
  onRetrieveAll={async () => {
    try {
      // Get all trash orders
      const { data: trashData, error: fetchError } = await supabase
        .from("trash_orders")
        .select("*")

      if (fetchError) throw fetchError
      if (!trashData || trashData.length === 0) {
        alert("Trash is empty.")
        return
      }

      // Move all to orders
      const formatted = trashData.map((o) => ({
        name: o.name,
        phone: o.phone,
        facebook: o.facebook,
        chapter: o.chapter,
        address: o.address,
        color: o.color,
        size: o.size,
        design: o.design,
        price: o.price,
        is_defective: o.is_defective,
        defective_note: o.defective_note,
        payment_status: o.payment_status,
        created_at: new Date(),
      }))

      const { error: insertError } = await supabase.from("orders").insert(formatted)
      if (insertError) throw insertError

      // Delete all from trash_orders
      const { error: deleteError } = await supabase.from("trash_orders").delete().neq("id", 0)
      if (deleteError) throw deleteError

      await fetchOrders()
      await fetchTrashOrders()
      alert("✅ All orders retrieved successfully!")
    } catch (err: any) {
      console.error("❌ Error retrieving all orders:", err.message)
      alert("Failed to retrieve all orders.")
    }
  }}
  onDeleteOrderPermanently={async (orderId) => {
    try {
      const { error } = await supabase.from("trash_orders").delete().eq("id", orderId)
      if (error) throw error

      await fetchTrashOrders()
      alert("🗑️ Order permanently deleted.")
    } catch (err: any) {
      console.error("❌ Error deleting order permanently:", err.message)
      alert("Failed to delete order permanently.")
    }
  }}
  onDeleteAllPermanently={async () => {
    try {
      const { error } = await supabase.from("trash_orders").delete().neq("id", 0)
      if (error) throw error

      await fetchTrashOrders()
      alert("🗑️ All trash orders deleted permanently.")
    } catch (err: any) {
      console.error("❌ Error deleting all trash:", err.message)
      alert("Failed to delete all trash.")
    }
  }}
/>





   {/* ✅ Defective Items Dialog */}
      <DefectiveItemsDialog
  open={showDefectiveDialog}
  onOpenChange={setShowDefectiveDialog}
  onEditDefectiveNote={handleEditDefectiveNote}
  defectiveOrders={defectiveOrders}
onRetrieveDefective={async (id: number) => {
  await supabase
    .from("orders")
    .update({ is_defective: false, defective_note: "" })
    .eq("id", id)

  await fetchOrders()
  await fetchDefectiveOrders()
  alert("✅ Order restored to normal list!")
}}


onDeleteDefectivePermanently={async (id: number) => {
  await supabase.from("orders").delete().eq("id", id)
  await fetchDefectiveOrders()
  alert("🗑️ Order permanently deleted.")
}}

  onDeleteAllDefectivePermanently={async () => {
    await supabase.from("orders").delete().eq("is_defective", true)
    await fetchDefectiveOrders()
    alert("🗑️ All defective orders deleted.")
  }}
/>

<ColorByDesignChart />  

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
