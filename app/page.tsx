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
import BatchOrdersDialog from "@/components/batch-orders-dialog"
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
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  
  
  const [showAddOrderDialog, setShowAddOrderDialog] = useState(false)
  const [showAddDesignDialog, setShowAddDesignDialog] = useState(false)
  const [showAddColorDialog, setShowAddColorDialog] = useState(false)
  const [showViewOrderDialog, setShowViewOrderDialog] = useState(false)
  const [showTrashDialog, setShowTrashDialog] = useState(false)
  const [showDefectiveDialog, setShowDefectiveDialog] = useState(false)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  
  // ✅ Counter to force ViewOrderDialog remount
  const [viewDialogKey, setViewDialogKey] = useState(0)

  const [showTShirtsBreakdown, setShowTShirtsBreakdown] = useState(false)
  const [showDesignsBreakdown, setShowDesignsBreakdown] = useState(false)

  const itemsPerPage = 10

  // Payment status options for filter
  const paymentStatusOptions = ["All", "pending", "partially paid", "fully paid"]

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
        .from("orders")
        .update({ defective_note: newNote })
        .eq("id", id)

      if (error) throw error

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
            styles: { fillColor: [144, 238, 144] },
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
            styles: { fillColor: [144, 238, 144] },
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


  // ✅ 3. Export: Detailed Orders Report (Breakdown by Customer > Design, with Status and DTF/Tshirt checkboxes at end)
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

      // Check if we need a new page
      if (startY > 250) {
        doc.addPage()
        startY = 20
      }

      // Green header bar for customer
      doc.setFillColor(90, 180, 50)
      doc.rect(10, startY - 4, 190, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.text(`Customer: ${name}`, 14, startY + 2)
      doc.setTextColor(0, 0, 0)
      startY += 10

      // Group customer orders by design
      const ordersByDesign: Record<string, any[]> = {}
      items.forEach((o) => {
        const design = o.design || "Unknown"
        if (!ordersByDesign[design]) ordersByDesign[design] = []
        ordersByDesign[design].push(o)
      })

      // Sort designs alphabetically
      const sortedDesigns = Object.keys(ordersByDesign).sort((a, b) => a.localeCompare(b))

      sortedDesigns.forEach((design) => {
        const designOrders = ordersByDesign[design]

        // Design sub-header
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Design: ${design}`, 14, startY)
        doc.setFont("helvetica", "normal")
        startY += 4

        // Helper function to format status
        const formatStatus = (order: any) => {
          // Check if defective first
          if (order.is_defective) return "Defective"
          
          // Then check payment status
          switch (order.payment_status?.toLowerCase()) {
            case "fully paid":
              return "For Shipment"
            case "partially paid":
              return "Partial"
            case "pending":
            default:
              return "Pending"
          }
        }

        // Table data for this design (Color, Size, Qty, Status, Date, DTF, Tshirt)
        const tableData = designOrders.map((o) => [
          o.color || "",
          o.size || "",
          o.quantity || 1,
          formatStatus(o),
          o.created_at ? new Date(o.created_at).toLocaleDateString() : "",
          " ", // DTF checkbox
          " ", // Tshirt checkbox
        ])

        autoTable(doc, {
          head: [["Color", "Size", "Qty", "Status", "Date", "DTF", "Tshirt"]],
          body: tableData,
          startY,
          theme: "grid",
          styles: { fontSize: 9, halign: "center" },
          headStyles: { fillColor: [20, 40, 80], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [235, 242, 245] },
          margin: { left: 14 },
          columnStyles: {
            0: { cellWidth: 28 }, // Color
            1: { cellWidth: 18 }, // Size
            2: { cellWidth: 15 }, // Qty
            3: { cellWidth: 28 }, // Status
            4: { cellWidth: 28 }, // Date
            5: { cellWidth: 15 }, // DTF checkbox
            6: { cellWidth: 15 }, // Tshirt checkbox
          },
        })

        startY = (doc as any).lastAutoTable.finalY + 6
      })

      startY += 8 // Extra space between customers
    })

    doc.save("Customers_Orders.pdf")
  }


  // ✅ Export Shipping Info with Text Wrapping
  const handleExportShippingInfo = () => {
    if (!orders.length) {
      alert("No shipping information to export.")
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Shipping Information", 14, 15)

    const groupedCustomers: Record<string, { address?: string; phone?: string; totalOrder: number }> = {}

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
      styles: {
        halign: "left",
        overflow: "linebreak",
        cellPadding: 3,
      },
      headStyles: { fillColor: [144, 238, 144] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 35 },
      },
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

  // ✅ Sort customers alphabetically
  const sortedCustomers = [...uniqueCustomers].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // ✅ Filter Logic (with Payment Status)
  const filteredCustomers = sortedCustomers.filter((customer) => {
    const matchesName = customer.name.toLowerCase().includes(filterName.toLowerCase())
    const hasMatchingOrder = customer.orders.some((order) => {
      const matchesColor = filterColor === "All" || order.color === filterColor
      const matchesSize = filterSize === "All" || order.size === filterSize
      const matchesDesign = filterDesign === "All" || order.design === filterDesign
      const matchesPaymentStatus =
        filterPaymentStatus === "All" || order.payment_status === filterPaymentStatus
      return matchesColor && matchesSize && matchesDesign && matchesPaymentStatus
    })
    return matchesName && hasMatchingOrder
  })

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const selectedCustomerObj = selectedCustomer
    ? uniqueCustomers.find((c) => c.id === selectedCustomer) || null
    : null

  // ✅ Count unique batch folders
  const uniqueFolderCount = Array.from(
    new Set(orders.filter((o) => o.batch_folder).map((o) => o.batch_folder))
  ).length

  // ✅ Delete a single order → Move to Trash
  const handleDeleteOrder = async (orderId: number) => {
    const orderToTrash = orders.find((o) => o.id === orderId);
    if (!orderToTrash) return;

    // Create a new object with only the columns that exist in the trash_orders table
    const trashOrderData = {
      name: orderToTrash.name,
      phone: orderToTrash.phone,
      facebook: orderToTrash.facebook,
      chapter: orderToTrash.chapter,
      address: orderToTrash.address,
      color: orderToTrash.color,
      size: orderToTrash.size,
      design: orderToTrash.design,
      payment_status: orderToTrash.payment_status,
      price: orderToTrash.price,
      created_at: orderToTrash.created_at,
      defective_note: orderToTrash.defectiveNote,
      deleted_at: new Date().toISOString(),
      is_defective: orderToTrash.isDefective,
      is_deleted: true,
      is_trashed: true,
      batch: orderToTrash.batch,
      batch_folder: orderToTrash.batch_folder,
    };

    try {
      // 1. Move to trash_orders table
      const { error: trashError } = await supabase
        .from("trash_orders")
        .insert([trashOrderData]);

      if (trashError) throw trashError;

      // 2. Delete from orders table
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (deleteError) throw deleteError;

      // 3. Update local state
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      await fetchTrashOrders();
      
      toast({ title: "✅ Order moved to trash." });

    } catch (err: any) {
      console.error("Error moving order to trash:", err.message);
      toast({
        title: "Error moving order to trash",
        description: err.message,
        variant: "destructive",
      });
    }
  };

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

  // ✅ Updated to increment key when opening dialog
  const handleViewOrder = (customerId: string) => {
    setSelectedCustomer(customerId)
    setViewDialogKey(prev => prev + 1) // Force remount
    setShowViewOrderDialog(true)
  }

  // ✅ Delete All → Move to Trash
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
          payment_status: o.payment_status,
          defective_note: o.defective_note,
          is_defective: o.is_defective,
          is_deleted: true,
          is_trashed: true,
          deleted_at: new Date(),
          created_at: o.created_at,
          batch: o.batch,
          batch_folder: o.batch_folder,
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
    <div className="min-h-screen bg-background relative">
      {/* Background Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/logo.png"
          alt=""
          className="w-[500px] h-[500px] object-contain opacity-5"
        />
      </div>

      <div className="relative z-10">
      <Header
        onAddOrder={() => setShowAddOrderDialog(true)}
        onAddDesign={() => setShowAddDesignDialog(true)}
        onAddColor={() => setShowAddColorDialog(true)}
        onDeleteAll={handleDeleteAll}
        onViewTrash={() => setIsTrashOpen(true)} 
        onLogout={handleLogout}
        onExportTotalPDF={handleExportTotalPDF}
        onExportByDesignPDF={handleExportByDesignPDF}
        onExportOrdersPDF={handleExportOrdersPDF} 
        onExportShippingInfo={handleExportShippingInfo}
      />

      {/* ✅ Add Design Dialog */}
      <AddDesignDialog
        open={showAddDesignDialog}
        onOpenChange={setShowAddDesignDialog}
        onAddDesign={(newDesign) => {
          setDesigns((prev) => [...prev, newDesign])
        }}
        onDeleteDesign={(designToDelete) => {
          setDesigns((prev) => prev.filter((d) => d !== designToDelete))
        }}
        existingDesigns={designs}
      />

      {/* ✅ Add Color Dialog */}
      <AddColorDialog
        open={showAddColorDialog}
        onOpenChange={setShowAddColorDialog}
        onAddColor={async (color) => {
          console.log("Added color:", color)
        }}
        onDeleteColor={async (color) => {
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
              console.log("Customers card clicked")
            }
          }}
          onDownload={(type: "total" | "byDesign" | "orders") => {
            if (type === "total") handleExportTotalPDF()
            if (type === "byDesign") handleExportByDesignPDF()
            if (type === "orders") handleExportOrdersPDF()
          }}
        />

        {/* ✅ Action Buttons Row */}
        <div className="flex justify-end mb-4 gap-3 flex-wrap">
          {/* Batch Folders Button */}
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2"
            onClick={() => setShowBatchDialog(true)}
          >
            📁 Batch Folders
            <span className="bg-white text-indigo-700 font-bold rounded-full px-2 py-0.5 text-sm">
              {uniqueFolderCount}
            </span>
          </button>

          {/* Defective Items Button */}
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
          filterPaymentStatus={filterPaymentStatus}
          setFilterPaymentStatus={setFilterPaymentStatus}
          paymentStatusOptions={paymentStatusOptions}
          colors={colors}
          designs={designs}
          sizes={sizes}
          onReset={() => {
            setFilterName("")
            setFilterColor("All")
            setFilterSize("All")
            setFilterDesign("All")
            setFilterPaymentStatus("All")
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

      {/* ✅ View Orders Dialog - Using key to force remount */}
      <ViewOrderDialog
        key={viewDialogKey}
        open={showViewOrderDialog}
        onOpenChange={setShowViewOrderDialog}
        customerName={selectedCustomerObj?.name || ""}
        customerOrders={selectedCustomerObj?.orders || []}
        colors={colors}
        designs={designs}
        onAddMoreOrder={async () => {
          await fetchOrders()
        }}
        onDeleteOrder={handleDeleteOrder}
        onEditOrder={() => {}}
        onMarkDefective={(orderId, note) => handleMarkDefective(orderId, note || "")}
        onEditCustomer={() => {}}
      />

      {/* ✅ Trash Dialogs */}
      <TrashDialog
        open={isTrashOpen}
        onOpenChange={setIsTrashOpen}
        trashOrders={trashOrders}
        onRetrieveOrder={async (orderId) => {
          try {
            const { data: orderToRestoreResult, error: fetchError } = await supabase
              .from("trash_orders")
              .select("*")
              .eq("id", orderId)

            if (fetchError) throw fetchError

            if (!orderToRestoreResult || orderToRestoreResult.length === 0) {
              toast({ title: "Order not found in trash.", variant: "destructive" })
              return
            }
            const orderToRestore = orderToRestoreResult[0]

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
                batch: orderToRestore.batch,
                batch_folder: orderToRestore.batch_folder,
                created_at: new Date(),
              },
            ])

            if (insertError) throw insertError

            const { error: deleteError } = await supabase
              .from("trash_orders")
              .delete()
              .eq("id", orderId)
            if (deleteError) throw deleteError

            await fetchOrders()
            await fetchTrashOrders()
            toast({ title: "✅ Order successfully retrieved!" })
          } catch (err: any) {
            console.error("❌ Error retrieving order:", err.message)
            toast({
              title: "Failed to retrieve order.",
              description: err.message,
              variant: "destructive",
            })
          }
        }}
        onRetrieveAll={async () => {
          try {
            const { data: trashData, error: fetchError } = await supabase
              .from("trash_orders")
              .select("*")

            if (fetchError) throw fetchError
            if (!trashData || trashData.length === 0) {
              toast({ title: "Trash is empty.", variant: "destructive" })
              return
            }

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
              batch: o.batch,
              batch_folder: o.batch_folder,
              created_at: new Date(),
            }))

            const { error: insertError } = await supabase.from("orders").insert(formatted)
            if (insertError) throw insertError

            const { error: deleteError } = await supabase.from("trash_orders").delete().neq("id", 0)
            if (deleteError) throw deleteError

            await fetchOrders()
            await fetchTrashOrders()
            toast({ title: "✅ All orders retrieved successfully!" })
          } catch (err: any) {
            console.error("❌ Error retrieving all orders:", err.message)
            toast({
              title: "Failed to retrieve all orders.",
              description: err.message,
              variant: "destructive",
            })
          }
        }}
        onDeleteOrderPermanently={async (orderId) => {
          try {
            const { error } = await supabase.from("trash_orders").delete().eq("id", orderId)
            if (error) throw error

            await fetchTrashOrders()
            toast({ title: "🗑️ Order permanently deleted." })
          } catch (err: any) {
            console.error("❌ Error deleting order permanently:", err.message)
            toast({
              title: "Failed to delete order permanently.",
              description: err.message,
              variant: "destructive",
            })
          }
        }}
        onDeleteAllPermanently={async () => {
          try {
            const { error } = await supabase.from("trash_orders").delete().neq("id", 0)
            if (error) throw error

            await fetchTrashOrders()
            toast({ title: "🗑️ All trash orders deleted permanently." })
          } catch (err: any) {
            console.error("❌ Error deleting all trash:", err.message)
            toast({
              title: "Failed to delete all trash.",
              description: err.message,
              variant: "destructive",
            })
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

      {/* ✅ Batch Folders Dialog */}
      <BatchOrdersDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        orders={orders}
        onRefresh={fetchOrders}
      />

      <ColorByDesignChart />  

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
    </div>
  )
}