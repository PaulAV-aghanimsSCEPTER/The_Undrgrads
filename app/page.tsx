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
import PreviousOrdersDialog from "@/components/previous-orders-dialog"
import TShirtsBreakdownDialog from "@/components/tshirts-breakdown-dialog"
import DesignsBreakdownDialog from "@/components/designs-breakdown-dialog"
import DefectiveItemsDialog from "@/components/defective-items-dialog"
import BatchOrdersDialog from "@/components/batch-orders-dialog"
import StockManagementDialog, { type StockItem } from "@/components/stock-management-dialog"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ColorByDesignChart from "@/components/ColorByDesignChart"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Archive, Folder, AlertTriangle } from "lucide-react"

// Unique separator that won't appear in user data
const SEPARATOR = "|||"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // --- Data ---
  const [orders, setOrders] = useState<Order[]>([])
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [trashOrders, setTrashOrders] = useState<Order[]>([])
  const [isPreviousOrdersOpen, setIsPreviousOrdersOpen] = useState(false)
  const [previousOrders, setPreviousOrders] = useState<Order[]>([])
  const [previousFolders, setPreviousFolders] = useState<string[]>([])
  const [archiveAllFolder, setArchiveAllFolder] = useState("")
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

  // Counter to force ViewOrderDialog remount
  const [viewDialogKey, setViewDialogKey] = useState(0)

  const [showTShirtsBreakdown, setShowTShirtsBreakdown] = useState(false)
  const [showDesignsBreakdown, setShowDesignsBreakdown] = useState(false)
  const [showStockDialog, setShowStockDialog] = useState(false)
  const [showArchiveAllConfirm, setShowArchiveAllConfirm] = useState(false)
  const [stocks, setStocks] = useState<StockItem[]>([])

  const itemsPerPage = 10

  // Payment status options for filter
  const paymentStatusOptions = ["All", "pending", "awaiting_payment", "partially paid", "fully paid"]
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
  const sortSizes = (a: string, b: string) => {
    const aIndex = sizeOrder.indexOf(a)
    const bIndex = sizeOrder.indexOf(b)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  }

  // Authentication
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token && isTokenValid(token)) setIsAuthenticated(true)
    setIsLoading(false)
  }, [])

  // Defective items
  const fetchDefectiveOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("is_defective", true)
      .order("id", { ascending: false })

    if (error) console.error("Error fetching defective items:", error)
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
        title: "Note updated successfully!",
        description: "The defective note has been saved.",
      })
    } catch (err: any) {
      console.error("Error updating defective note:", err.message)
      toast({
        title: "Error updating note",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  // Export Orders to PDF
  // 1. Export: Total T-Shirts Summary (with aligned Size + Color)
  const handleExportTotalPDF = () => {
    if (!orders.length) {
      alert("No orders to export.")
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Total Ordered Tshirts", 14, 15)

    // Group by color + size
    const grouped: Record<string, Record<string, number>> = {}

    orders.forEach((o) => {
      const color = o.color || "Unknown"
      const size = o.size || "Unknown"
      if (!grouped[color]) grouped[color] = {}
      grouped[color][size] = (grouped[color][size] || 0) + 1
    })

    const tableData: any[] = []
    let overallTotal = 0

    const sortedColors = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

    sortedColors.forEach((color, index) => {
      const sizes = grouped[color]
      Object.keys(sizes).sort(sortSizes).forEach((size) => {
        const qty = sizes[size]
        tableData.push([color, size, qty])
        overallTotal += qty
      })

      // Add a light green divider after each color group (except last)
      if (index < sortedColors.length - 1) {
        tableData.push([
          {
            content: "",
            colSpan: 3,
            styles: { fillColor: [144, 238, 144] },
          },
        ])
      }
    })

    // Add overall total row
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

  // 2. Export: Orders by Design (aligned columns)
  const handleExportByDesignPDF = () => {
    if (!orders.length) {
      alert("No orders to export.")
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Orders by Design", 14, 15)

    // Group by design > color > size
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

    const sortedDesigns = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

    sortedDesigns.forEach((design, index) => {
      const colors = grouped[design]
      Object.keys(colors).sort((a, b) => a.localeCompare(b)).forEach((color) => {
        const sizes = colors[color]
        Object.keys(sizes).sort(sortSizes).forEach((size) => {
          const qty = sizes[size]
          tableData.push([design, color, size, qty])
          overallTotal += qty
        })
      })

      // Add light green divider after each design (except last)
      if (index < sortedDesigns.length - 1) {
        tableData.push([
          {
            content: "",
            colSpan: 4,
            styles: { fillColor: [144, 238, 144] },
          },
        ])
      }
    })

    // Add Overall Total at bottom
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

  // 3. Export: Detailed Orders Report
  const handleExportOrdersPDF = () => {
    if (!orders.length) {
      alert("No orders to export.")
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Customers Orders", 14, 14)

    // Group by unique customer identity (name + phone + address)
    const grouped: Record<string, any[]> = {}
    orders.forEach((o) => {
      const key = `${o.name || "Unknown"}${SEPARATOR}${o.phone || "NoPhone"}${SEPARATOR}${o.address || "NoAddress"}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(o)
    })

    let startY = 23

    const sortedCustomerEntries = Object.entries(grouped).sort(([a], [b]) => {
      const nameA = a.split(SEPARATOR)[0]
      const nameB = b.split(SEPARATOR)[0]
      return nameA.localeCompare(nameB)
    })

    sortedCustomerEntries.forEach(([key, items]) => {
      const parts = key.split(SEPARATOR)
      const name = parts[0]

      // Check if we need a new page
      if (startY > 260) {
        doc.addPage()
        startY = 20
      }

      // Green header bar for customer
      doc.setFillColor(90, 180, 50)
      doc.rect(14, startY - 5, 182, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text(`Customer: ${name}`, 18, startY)
      doc.setTextColor(0, 0, 0)
      startY += 8

      const customerOrders = [...items].sort((a, b) => {
        const designCompare = (a.design || "").localeCompare(b.design || "")
        if (designCompare !== 0) return designCompare
        const colorCompare = (a.color || "").localeCompare(b.color || "")
        if (colorCompare !== 0) return colorCompare
        return sortSizes(a.size || "", b.size || "")
      })

      const tableData = customerOrders.map((o) => [
        o.design || "",
        o.color || "",
        o.size || "",
        o.created_at ? new Date(o.created_at).toLocaleDateString() : "",
        " ", // DTF checkbox
        " ", // Tshirt checkbox
      ])

      autoTable(doc, {
        head: [["Design", "Color", "Size", "Date", "DTF", "Tshirt"]],
        body: tableData,
        startY,
        theme: "grid",
        styles: { fontSize: 8.5, halign: "center", cellPadding: 2 },
        headStyles: { fillColor: [20, 40, 80], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [235, 242, 245] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 52 },
          1: { cellWidth: 38 },
          2: { cellWidth: 18 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 24 },
        },
      })

      startY = (doc as any).lastAutoTable.finalY + 11
    })

    doc.save("Customers_Orders.pdf")
  }

  // Export Shipping Info with Text Wrapping
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
      const key = `${o.name || "Unknown"}${SEPARATOR}${o.phone || "NoPhone"}${SEPARATOR}${o.address || "NoAddress"}`
      if (!groupedCustomers[key]) {
        groupedCustomers[key] = {
          address: o.address || "N/A",
          phone: o.phone || "N/A",
          totalOrder: 0,
        }
      }
      groupedCustomers[key].totalOrder++
    })

    const tableData = Object.entries(groupedCustomers)
      .map(([key, info]) => {
        const name = key.split(SEPARATOR)[0]
        return [name, info.address, info.totalOrder, info.phone]
      })
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))

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

    if (error) console.error("Error fetching orders:", error)
    else setOrders(data || [])
  }

  // Fetch Trash
  const fetchTrashOrders = async () => {
    const { data, error } = await supabase
      .from("trash_orders")
      .select("*")
      .order("deleted_at", { ascending: false })

    if (error) {
      console.error("Error fetching trash_orders:", error)
    } else {
      setTrashOrders(data || [])
    }
  }

  const fetchPreviousOrders = async () => {
    const { data, error } = await supabase
      .from("previous_orders")
      .select("*")
      .order("archived_at", { ascending: false })

    if (error) {
      console.error("Error fetching previous_orders:", error)
    } else {
      setPreviousOrders(data || [])
    }
  }

  const fetchPreviousFolders = async () => {
    const { data, error } = await supabase
      .from("previous_order_folders")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching previous_order_folders:", error)
    } else {
      setPreviousFolders(data?.map((folder) => folder.name) || [])
    }
  }

  // Fetch Designs and Colors from Supabase (parallel)
  const fetchDesignsAndColors = async () => {
    const [{ data: designData }, { data: colorData }] = await Promise.all([
      supabase.from("designs").select("*").order("name", { ascending: true }),
      supabase.from("colors").select("*").order("name", { ascending: true }),
    ])
    setDesigns(designData?.map((d) => d.name) || [])
    setColors(colorData?.map((c) => c.name) || [])
  }

  // Fetch Stocks
  const fetchStocks = async () => {
    const { data, error } = await supabase
      .from("stocks")
      .select("*")
      .order("color", { ascending: true })

    if (error) console.error("Error fetching stocks:", error)
    else setStocks(data || [])
  }

  // Initial Fetch — critical data in parallel, defer non-essential
  useEffect(() => {
    Promise.all([
      fetchOrders(),
      fetchDefectiveOrders(),
      fetchDesignsAndColors(),
    ]).then(() => {
      // Load non-essential data after main content is ready
      fetchTrashOrders()
      fetchPreviousOrders()
      fetchPreviousFolders()
      fetchStocks()
    })

    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders()
        fetchDefectiveOrders()
      })
      .subscribe()

    const stockChannel = supabase
      .channel("stocks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "stocks" }, () => {
        fetchStocks()
      })
      .subscribe()

    const previousOrdersChannel = supabase
      .channel("previous-orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "previous_orders" }, () => {
        fetchPreviousOrders()
      })
      .subscribe()

    const previousFoldersChannel = supabase
      .channel("previous-order-folders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "previous_order_folders" }, () => {
        fetchPreviousFolders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(stockChannel)
      supabase.removeChannel(previousOrdersChannel)
      supabase.removeChannel(previousFoldersChannel)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
  }

  const handleLogin = () => setIsAuthenticated(true)

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <div className="w-10 h-10 border-4 border-muted border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
  if (!isAuthenticated) return <LoginDialog onLogin={handleLogin} />

  // --- Customer grouping (using safe separator) ---
  const uniqueCustomers = Array.from(
    new Set(orders.map((o) => `${o.name}${SEPARATOR}${o.phone}${SEPARATOR}${o.facebook}${SEPARATOR}${o.address}`))
  ).map((key) => {
    const parts = key.split(SEPARATOR)
    const [name, phone, facebook, address] = parts
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

  // Sort customers alphabetically
  const sortedCustomers = [...uniqueCustomers].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // Filter Logic (with Payment Status)
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

  // Count unique batch folders
  const uniqueFolderCount = Array.from(
    new Set(orders.filter((o) => o.batch_folder).map((o) => o.batch_folder))
  ).length
  const previousCustomerCount = Array.from(
    new Set(
      previousOrders.map(
        (o) => `${o.name}${SEPARATOR}${o.phone || ""}${SEPARATOR}${o.facebook || ""}${SEPARATOR}${o.address || ""}`
      )
    )
  ).length

  // Delete a single order -> Move to Trash
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
      payment_method: orderToTrash.payment_method,
      payment_status: orderToTrash.payment_status,
      price: orderToTrash.price,
      downpayment: orderToTrash.downpayment || 0,
      created_at: orderToTrash.created_at,
      defective_note: orderToTrash.defective_note,
      deleted_at: new Date().toISOString(),
      is_defective: orderToTrash.is_defective,
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

      toast({ title: "Order moved to trash." });

    } catch (err: any) {
      console.error("Error moving order to trash:", err.message);
      toast({
        title: "Error moving order to trash",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (orderIds: number[]) => {
    if (orderIds.length === 0) return

    const ordersToTrash = orders.filter((order) => orderIds.includes(order.id))
    if (ordersToTrash.length === 0) return

    const trashOrdersData = ordersToTrash.map((order) => ({
      name: order.name,
      phone: order.phone,
      facebook: order.facebook,
      chapter: order.chapter,
      address: order.address,
      color: order.color,
      size: order.size,
      design: order.design,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      price: order.price,
      downpayment: order.downpayment || 0,
      created_at: order.created_at,
      defective_note: order.defective_note,
      deleted_at: new Date().toISOString(),
      is_defective: order.is_defective,
      is_deleted: true,
      is_trashed: true,
      batch: order.batch,
      batch_folder: order.batch_folder,
    }))

    try {
      const { error: trashError } = await supabase
        .from("trash_orders")
        .insert(trashOrdersData)

      if (trashError) throw trashError

      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .in("id", orderIds)

      if (deleteError) throw deleteError

      setOrders((prev) => prev.filter((order) => !orderIds.includes(order.id)))
      setShowViewOrderDialog(false)
      setSelectedCustomer(null)
      await fetchTrashOrders()

      toast({ title: "Customer moved to trash." })
    } catch (err: any) {
      console.error("Error moving customer to trash:", err.message)
      toast({
        title: "Error moving customer to trash",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const formatOrdersForArchive = (ordersToArchive: Order[], previousFolder = "") =>
    ordersToArchive.map((order) => ({
      name: order.name,
      phone: order.phone,
      facebook: order.facebook,
      chapter: order.chapter,
      address: order.address,
      color: order.color,
      size: order.size,
      design: order.design,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      price: order.price,
      downpayment: order.downpayment || 0,
      created_at: order.created_at,
      defective_note: order.defective_note,
      archived_at: new Date().toISOString(),
      is_defective: order.is_defective,
      is_deleted: false,
      is_trashed: false,
      batch: order.batch,
      batch_folder: order.batch_folder,
      previous_folder: previousFolder || null,
    }))

  const formatArchivedOrderForRestore = (order: Order) => ({
    name: order.name,
    phone: order.phone,
    facebook: order.facebook,
    chapter: order.chapter,
    address: order.address,
    color: order.color,
    size: order.size,
    design: order.design,
    price: order.price,
    downpayment: order.downpayment || 0,
    is_defective: order.is_defective,
    defective_note: order.defective_note,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    batch: order.batch,
    batch_folder: order.batch_folder,
    created_at: order.created_at || new Date().toISOString(),
  })

  const handleArchiveOrders = async (orderIds: number[]) => {
    await handleArchiveOrdersToFolder(orderIds, "")
  }

  const handleArchiveOrdersToFolder = async (orderIds: number[], previousFolder: string) => {
    if (orderIds.length === 0) return

    const ordersToArchive = orders.filter((order) => orderIds.includes(order.id))
    if (ordersToArchive.length === 0) return

    try {
      const { error: archiveError } = await supabase
        .from("previous_orders")
        .insert(formatOrdersForArchive(ordersToArchive, previousFolder))

      if (archiveError) throw archiveError

      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .in("id", orderIds)

      if (deleteError) throw deleteError

      setOrders((prev) => prev.filter((order) => !orderIds.includes(order.id)))
      setShowViewOrderDialog(false)
      setSelectedCustomer(null)
      await fetchPreviousOrders()

      toast({
        title:
          ordersToArchive.length === 1
            ? "Order moved to Previous Orders."
            : `${ordersToArchive.length} orders moved to Previous Orders.`,
      })
    } catch (err: any) {
      console.error("Error moving order to previous orders:", err.message)
      toast({
        title: "Error moving order to Previous Orders",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleCreatePreviousFolder = async (folderName: string) => {
    const name = folderName.trim()
    if (!name) return

    const { error } = await supabase.from("previous_order_folders").insert([{ name }])
    if (error) {
      toast({ title: "Failed to create folder.", description: error.message, variant: "destructive" })
      return
    }

    await fetchPreviousFolders()
    toast({ title: "Previous Orders folder created." })
  }

  const handleRenamePreviousFolder = async (oldName: string, newName: string) => {
    const name = newName.trim()
    if (!oldName || !name || oldName === name) return

    const { error: folderError } = await supabase
      .from("previous_order_folders")
      .update({ name })
      .eq("name", oldName)

    if (folderError) {
      toast({ title: "Failed to rename folder.", description: folderError.message, variant: "destructive" })
      return
    }

    const { error: ordersError } = await supabase
      .from("previous_orders")
      .update({ previous_folder: name })
      .eq("previous_folder", oldName)

    if (ordersError) {
      toast({ title: "Folder renamed, but orders were not moved.", description: ordersError.message, variant: "destructive" })
    }

    await Promise.all([fetchPreviousFolders(), fetchPreviousOrders()])
    toast({ title: "Previous Orders folder renamed." })
  }

  const handleDeletePreviousFolder = async (folderName: string) => {
    if (!folderName) return

    const { error: ordersError } = await supabase
      .from("previous_orders")
      .update({ previous_folder: null })
      .eq("previous_folder", folderName)

    if (ordersError) {
      toast({ title: "Failed to clear folder orders.", description: ordersError.message, variant: "destructive" })
      return
    }

    const { error: folderError } = await supabase
      .from("previous_order_folders")
      .delete()
      .eq("name", folderName)

    if (folderError) {
      toast({ title: "Failed to delete folder.", description: folderError.message, variant: "destructive" })
      return
    }

    await Promise.all([fetchPreviousFolders(), fetchPreviousOrders()])
    toast({ title: "Previous Orders folder deleted." })
  }

  const handleMovePreviousOrdersToFolder = async (orderIds: number[], folderName: string) => {
    if (orderIds.length === 0) return

    const { error } = await supabase
      .from("previous_orders")
      .update({ previous_folder: folderName || null })
      .in("id", orderIds)

    if (error) {
      toast({ title: "Failed to move previous orders.", description: error.message, variant: "destructive" })
      return
    }

    await fetchPreviousOrders()
    toast({ title: "Previous orders moved." })
  }

  const handleRetrievePreviousOrders = async (orderIds: number[]) => {
    if (orderIds.length === 0) return

    try {
      const { data: previousData, error: fetchError } = await supabase
        .from("previous_orders")
        .select("*")
        .in("id", orderIds)

      if (fetchError) throw fetchError
      if (!previousData || previousData.length === 0) {
        toast({ title: "Order not found in Previous Orders.", variant: "destructive" })
        return
      }

      const { error: insertError } = await supabase
        .from("orders")
        .insert(previousData.map(formatArchivedOrderForRestore))

      if (insertError) throw insertError

      const { error: deleteError } = await supabase
        .from("previous_orders")
        .delete()
        .in("id", orderIds)

      if (deleteError) throw deleteError

      await fetchOrders()
      await fetchPreviousOrders()
      toast({
        title:
          previousData.length === 1
            ? "Order restored to dashboard."
            : `${previousData.length} orders restored to dashboard.`,
      })
    } catch (err: any) {
      console.error("Error retrieving previous orders:", err.message)
      toast({
        title: "Failed to retrieve previous orders.",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleDeletePreviousOrdersPermanently = async (orderIds: number[]) => {
    if (orderIds.length === 0) return

    try {
      const { error } = await supabase.from("previous_orders").delete().in("id", orderIds)
      if (error) throw error

      await fetchPreviousOrders()
      toast({
        title:
          orderIds.length === 1
            ? "Previous order permanently deleted."
            : `${orderIds.length} previous orders permanently deleted.`,
      })
    } catch (err: any) {
      console.error("Error deleting previous orders:", err.message)
      toast({
        title: "Failed to delete previous orders.",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleArchiveAll = async () => {
    if (!orders.length) {
      alert("No orders to move.")
      return
    }

    setShowArchiveAllConfirm(true)
  }

  const confirmArchiveAll = async () => {
    await handleArchiveOrdersToFolder(orders.map((order) => order.id), archiveAllFolder)
    setShowArchiveAllConfirm(false)
    setArchiveAllFolder("")
  }

  const handleMarkDefective = async (orderId: number, note: string = "") => {
    const { error } = await supabase
      .from("orders")
      .update({ is_defective: true, defective_note: note })
      .eq("id", orderId)

    if (error) {
      console.error("Failed to mark defective:", error)
      return
    }

    await fetchOrders()
    await fetchDefectiveOrders()
    toast({ title: "Order marked as defective!" })
  }

  const handleAddOrder = async () => {
    await fetchOrders()
    setShowAddOrderDialog(false)
  }

  // Updated to increment key when opening dialog
  const handleViewOrder = (customerId: string) => {
    setSelectedCustomer(customerId)
    setViewDialogKey(prev => prev + 1)
    setShowViewOrderDialog(true)
  }

  const handleEditCustomer = (customer: any) => {
    const orderIds = selectedCustomerObj?.orders.map((order) => order.id) || []

    setOrders((prev) =>
      prev.map((order) =>
        orderIds.includes(order.id)
          ? {
              ...order,
              name: customer.name || "",
              phone: customer.phone || "",
              facebook: customer.facebook || "",
              chapter: customer.chapter || "",
              address: customer.address || "",
              batch: customer.batch || "",
              batch_folder: customer.batch_folder || "",
            }
          : order
      )
    )

    setSelectedCustomer(
      `${customer.name || ""}${SEPARATOR}${customer.phone || ""}${SEPARATOR}${customer.facebook || ""}${SEPARATOR}${customer.address || ""}`
    )
  }

  // Delete All -> Move to Trash (excludes defective items)
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all orders?")) return

    try {
      // Get all non-defective orders only
      const { data: allOrders, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("is_defective", false)

      if (fetchError) throw fetchError
      if (!allOrders || allOrders.length === 0) {
        alert("No orders to delete.")
        return
      }

      // Move them to trash_orders (excluding id)
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
          downpayment: o.downpayment || 0,
          payment_method: o.payment_method,
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

      // Delete non-defective orders from orders table
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .eq("is_defective", false)
      if (deleteError) throw deleteError

      // Refresh data
      await fetchOrders()
      await fetchTrashOrders()

      toast({ title: "All orders moved to Trash successfully!" })
    } catch (err: any) {
      console.error("Error moving to trash:", err.message)
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
        onManageStock={() => setShowStockDialog(true)}
        onArchiveAll={handleArchiveAll}
        onDeleteAll={handleDeleteAll}
        onViewTrash={() => setIsTrashOpen(true)}
        onLogout={handleLogout}
        onExportTotalPDF={handleExportTotalPDF}
        onExportByDesignPDF={handleExportByDesignPDF}
        onExportOrdersPDF={handleExportOrdersPDF}
        onExportShippingInfo={handleExportShippingInfo}
      />

      <AlertDialog open={showArchiveAllConfirm} onOpenChange={setShowArchiveAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Archive className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div>
                <AlertDialogTitle>Add All Orders to Previous?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move {orders.length} dashboard order(s) to Previous Orders and hide them from the main list.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Folder</label>
            <select
              value={archiveAllFolder}
              onChange={(event) => setArchiveAllFolder(event.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">No folder</option>
              {previousFolders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Add All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Design Dialog */}
      <AddDesignDialog
        open={showAddDesignDialog}
        onOpenChange={setShowAddDesignDialog}
        onAddDesign={(newDesign) => {
          setDesigns((prev) => [...prev, newDesign].sort((a, b) => a.localeCompare(b)))
        }}
        onDeleteDesign={(designToDelete) => {
          setDesigns((prev) => prev.filter((d) => d !== designToDelete))
        }}
        existingDesigns={designs}
      />

      {/* Add Color Dialog */}
      <AddColorDialog
        open={showAddColorDialog}
        onOpenChange={setShowAddColorDialog}
        onAddColor={async (color) => {
          setColors((prev) => [...prev, color].sort((a, b) => a.localeCompare(b)))
        }}
        onDeleteColor={async (color) => {
          setColors((prev) => prev.filter((c) => c !== color))
        }}
      />

      <main className="container mx-auto px-4 py-8">
        <SummaryCards
          totalTShirts={orders.length}
          orders={orders}
          onCardClick={(type: "total" | "designs" | "customers") => {
            if (type === "total") setShowTShirtsBreakdown(true)
            if (type === "designs") setShowDesignsBreakdown(true)
          }}
          onDownload={(type: "total" | "byDesign" | "orders") => {
            if (type === "total") handleExportTotalPDF()
            if (type === "byDesign") handleExportByDesignPDF()
            if (type === "orders") handleExportOrdersPDF()
          }}
        />

        {/* Action Buttons Row */}
        <div className="flex justify-end mb-4 gap-3 flex-wrap">
          {/* Batch Folders Button */}
          <button
            className="bg-card hover:bg-muted/50 text-foreground border border-border px-4 py-2 rounded-lg transition flex items-center gap-2"
            onClick={() => setShowBatchDialog(true)}
          >
            <Folder className="w-4 h-4" />
            Batch Folders
            <span className="bg-muted text-muted-foreground font-bold rounded-full px-2 py-0.5 text-sm">
              {uniqueFolderCount}
            </span>
          </button>

          {/* Defective Items Button */}
          <button
            className="bg-card hover:bg-muted/50 text-foreground border border-border px-4 py-2 rounded-lg transition flex items-center gap-2"
            onClick={() => setShowDefectiveDialog(true)}
          >
            <AlertTriangle className="w-4 h-4" />
            Defective Items
            <span className="bg-muted text-muted-foreground font-bold rounded-full px-2 py-0.5 text-sm">
              {defectiveOrders.length}
            </span>
          </button>

          <button
            className="bg-card hover:bg-muted/50 text-foreground border border-border px-4 py-2 rounded-lg transition flex items-center gap-2"
            onClick={() => setIsPreviousOrdersOpen(true)}
          >
            <Archive className="w-4 h-4" />
            Previous Orders
            <span className="bg-muted text-muted-foreground font-bold rounded-full px-2 py-0.5 text-sm">
              {previousCustomerCount}
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

      {/* Add Order Dialog */}
      <AddOrderDialog
        open={showAddOrderDialog}
        onOpenChange={setShowAddOrderDialog}
        onAddOrder={handleAddOrder}
        colors={colors}
        designs={designs}
        stocks={stocks}
        onStockUpdate={fetchStocks}
      />

      {/* View Orders Dialog - Using key to force remount */}
      <ViewOrderDialog
        key={viewDialogKey}
        open={showViewOrderDialog}
        onOpenChange={setShowViewOrderDialog}
        customerName={selectedCustomerObj?.name || ""}
        customerOrders={selectedCustomerObj?.orders || []}
        colors={colors}
        designs={designs}
        previousFolders={previousFolders}
        stocks={stocks}
        onStockUpdate={fetchStocks}
        onAddMoreOrder={async () => {
          await fetchOrders()
        }}
        onDeleteOrder={handleDeleteOrder}
        onDeleteCustomer={handleDeleteCustomer}
        onArchiveOrder={(orderId, previousFolder) => handleArchiveOrdersToFolder([orderId], previousFolder || "")}
        onArchiveCustomer={(orderIds, previousFolder) => handleArchiveOrdersToFolder(orderIds, previousFolder || "")}
        onEditOrder={() => {}}
        onMarkDefective={(orderId, note) => handleMarkDefective(orderId, note || "")}
        onEditCustomer={handleEditCustomer}
      />

      <PreviousOrdersDialog
        open={isPreviousOrdersOpen}
        onOpenChange={setIsPreviousOrdersOpen}
        previousOrders={previousOrders}
        folders={previousFolders}
        onCreateFolder={handleCreatePreviousFolder}
        onRenameFolder={handleRenamePreviousFolder}
        onDeleteFolder={handleDeletePreviousFolder}
        onMoveOrdersToFolder={handleMovePreviousOrdersToFolder}
        onRetrieveOrder={(orderId) => handleRetrievePreviousOrders([orderId])}
        onRetrieveOrders={handleRetrievePreviousOrders}
        onRetrieveAll={async () => {
          try {
            const { data: previousData, error: fetchError } = await supabase
              .from("previous_orders")
              .select("*")

            if (fetchError) throw fetchError
            if (!previousData || previousData.length === 0) {
              toast({ title: "Previous Orders is empty.", variant: "destructive" })
              return
            }

            const { error: insertError } = await supabase
              .from("orders")
              .insert(previousData.map(formatArchivedOrderForRestore))

            if (insertError) throw insertError

            const { error: deleteError } = await supabase
              .from("previous_orders")
              .delete()
              .neq("id", 0)

            if (deleteError) throw deleteError

            await fetchOrders()
            await fetchPreviousOrders()
            toast({ title: "All previous orders restored." })
          } catch (err: any) {
            console.error("Error retrieving previous orders:", err.message)
            toast({
              title: "Failed to retrieve previous orders.",
              description: err.message,
              variant: "destructive",
            })
          }
        }}
        onDeleteOrderPermanently={(orderId) => handleDeletePreviousOrdersPermanently([orderId])}
        onDeleteOrdersPermanently={handleDeletePreviousOrdersPermanently}
        onDeleteAllPermanently={async () => {
          try {
            const { error } = await supabase.from("previous_orders").delete().neq("id", 0)
            if (error) throw error

            await fetchPreviousOrders()
            toast({ title: "All previous orders deleted permanently." })
          } catch (err: any) {
            console.error("Error deleting previous orders:", err.message)
            toast({
              title: "Failed to delete previous orders.",
              description: err.message,
              variant: "destructive",
            })
          }
        }}
      />

      {/* Trash Dialog */}
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
                downpayment: orderToRestore.downpayment || 0,
                is_defective: orderToRestore.is_defective,
                defective_note: orderToRestore.defective_note,
                payment_method: orderToRestore.payment_method,
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
            toast({ title: "Order successfully retrieved!" })
          } catch (err: any) {
            console.error("Error retrieving order:", err.message)
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
              downpayment: o.downpayment || 0,
              is_defective: o.is_defective,
              defective_note: o.defective_note,
              payment_method: o.payment_method,
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
            toast({ title: "All orders retrieved successfully!" })
          } catch (err: any) {
            console.error("Error retrieving all orders:", err.message)
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
            toast({ title: "Order permanently deleted." })
          } catch (err: any) {
            console.error("Error deleting order permanently:", err.message)
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
            toast({ title: "All trash orders deleted permanently." })
          } catch (err: any) {
            console.error("Error deleting all trash:", err.message)
            toast({
              title: "Failed to delete all trash.",
              description: err.message,
              variant: "destructive",
            })
          }
        }}
      />

      {/* Defective Items Dialog */}
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
          toast({ title: "Order restored to normal list!" })
        }}
        onDeleteDefectivePermanently={async (id: number) => {
          await supabase.from("orders").delete().eq("id", id)
          await fetchDefectiveOrders()
          toast({ title: "Order permanently deleted." })
        }}
        onDeleteAllDefectivePermanently={async () => {
          await supabase.from("orders").delete().eq("is_defective", true)
          await fetchDefectiveOrders()
          toast({ title: "All defective orders deleted." })
        }}
      />

      {/* Batch Folders Dialog */}
      <BatchOrdersDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        orders={orders}
        onRefresh={fetchOrders}
      />

      {/* Stock Management Dialog */}
      <StockManagementDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        colors={colors}
        stocks={stocks}
        orders={orders}
        onStockUpdate={fetchStocks}
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
