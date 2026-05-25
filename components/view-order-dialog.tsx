"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  User,
  X,
  Pencil,
  RefreshCw,
  Trash2,
  Archive,
  Plus,
  Save,
  FileText,
  ClipboardList,
  ShoppingBag,
  CreditCard,
  Phone,
  BookOpen,
  Tag,
  Hash,
  Folder,
  MapPin,
  CheckCircle,
  Clock,
  Pause,
  AlertTriangle,
} from "lucide-react"
import type { StockItem } from "@/components/stock-management-dialog"
import {
  EXTENDED_SIZE_COLORS,
  LOW_STOCK_THRESHOLD,
  getAvailableSizes,
} from "@/lib/constants"

interface Order {
  id: number
  name: string
  phone?: string
  facebook?: string
  chapter?: string
  address?: string
  batch?: string
  batch_folder?: string
  color: string
  size: string
  design: string
  payment_status: string
  payment_method?: string
  order_status?: string
  price: number
  downpayment?: number
  qty?: number
  is_defective?: boolean
  isDefective?: boolean
  defective_note?: string
  defectiveNote?: string
  created_at?: string
  deleted_at?: string
  is_deleted?: boolean
  is_trashed?: boolean
}

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string | null
  customerOrders: Order[]
  colors: string[]
  designs: string[]
  previousFolders: string[]
  stocks?: StockItem[]
  onStockUpdate?: () => void
  onAddMoreOrder: (order: Order) => void
  onDeleteOrder: (orderId: number) => void
  onDeleteCustomer: (orderIds: number[]) => void | Promise<void>
  onArchiveOrder: (orderId: number, previousFolder?: string) => void | Promise<void>
  onArchiveCustomer: (orderIds: number[], previousFolder?: string) => void | Promise<void>
  onEditOrder: (order: Order) => void
  onMarkDefective: (orderId: number, note?: string) => void
  onEditCustomer: (customer: any) => void
}

export default function ViewOrderDialog({
  open,
  onOpenChange,
  customerName,
  customerOrders,
  colors,
  designs,
  previousFolders,
  stocks = [],
  onStockUpdate,
  onAddMoreOrder,
  onDeleteOrder,
  onDeleteCustomer,
  onArchiveOrder,
  onArchiveCustomer,
  onEditCustomer,
  onMarkDefective,
}: ViewOrderDialogProps) {
  const { toast } = useToast()

  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]

  // Stock lookup
  const stockMap = new Map<string, number>()
  stocks.forEach((s) => stockMap.set(`${s.color}|${s.size}`, s.quantity))
  const getStockQty = (color: string, size: string): number => {
    return stockMap.get(`${color}|${size}`) || 0
  }
  const plusSizeFees: Record<string, number> = {
    "2XL": 40,
    "3XL": 50,
    "4XL": 60,
    "5XL": 70,
  }
  const getPlusSizeFee = (size: string) => plusSizeFees[size] || 0
  const getCalculatedPrice = (price: string | number, size: string) => {
    return (Number(price) || 0) + getPlusSizeFee(size)
  }
  const getBalance = (price: string | number, size: string, downpayment: string | number) => {
    return Math.max(0, getCalculatedPrice(price, size) - (Number(downpayment) || 0))
  }

  const [editingCustomer, setEditingCustomer] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showAddMoreForm, setShowAddMoreForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [defectiveNote, setDefectiveNote] = useState("")
  const [showStatusPopup, setShowStatusPopup] = useState<number | null>(null)
  const [showDefectiveNotePopup, setShowDefectiveNotePopup] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [showDeleteCustomerConfirm, setShowDeleteCustomerConfirm] = useState(false)
  const [archiveConfirmId, setArchiveConfirmId] = useState<number | null>(null)
  const [showArchiveCustomerConfirm, setShowArchiveCustomerConfirm] = useState(false)
  const [selectedPreviousFolder, setSelectedPreviousFolder] = useState("")

  // Use ref to track if we just added an order
  const justAddedOrder = useRef(false)

  const [customerData, setCustomerData] = useState({
    name: customerName || "",
    phone: customerOrders[0]?.phone || "",
    facebook: customerOrders[0]?.facebook || "",
    chapter: customerOrders[0]?.chapter || "",
    address: customerOrders[0]?.address || "",
    batch: customerOrders[0]?.batch || "",
    batch_folder: customerOrders[0]?.batch_folder || "",
  })

  const [newOrder, setNewOrder] = useState({
    color: colors[0] || "White",
    size: "M",
    design: designs[0] || "Prologue",
    paymentStatus: "pending",
    price: "",
  })
  const [paymentDownpayment, setPaymentDownpayment] = useState("")

  // Get available sizes for new order based on selected color
  const availableSizesForNewOrder = getAvailableSizes(newOrder.color)

  useEffect(() => {
    setCustomerData({
      name: customerName || "",
      phone: customerOrders[0]?.phone || "",
      facebook: customerOrders[0]?.facebook || "",
      chapter: customerOrders[0]?.chapter || "",
      address: customerOrders[0]?.address || "",
      batch: customerOrders[0]?.batch || "",
      batch_folder: customerOrders[0]?.batch_folder || "",
    })
    const syncedDownpayment = customerOrders.reduce(
      (sum, order) => sum + (Number(order.downpayment) || 0),
      0
    )

    // If we just added an order, keep the local payment value while the
    // parent refreshes the order list so the new row's 0 downpayment does not
    // briefly reset the customer-level input.
    if (justAddedOrder.current) {
      setShowAddMoreForm(false)
      justAddedOrder.current = false
    } else {
      setPaymentDownpayment(syncedDownpayment.toString())
    }
  }, [customerName, customerOrders])

  // Reset ALL form states when dialog opens or customer changes
  useEffect(() => {
    setShowAddMoreForm(false)
    setEditingCustomer(false)
    setEditingOrder(null)
    setDeleteConfirmId(null)
    setShowDeleteCustomerConfirm(false)
    setShowStatusPopup(null)
    setShowDefectiveNotePopup(false)
    setSelectedOrderId(null)
    setDefectiveNote("")
    justAddedOrder.current = false

    setNewOrder({
      color: colors[0] || "White",
      size: "M",
      design: designs[0] || "Prologue",
      paymentStatus: "pending",
      price: "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerName])

  // Reset size if current size is not available for the selected color (for new order)
  useEffect(() => {
    const availSizes = getAvailableSizes(newOrder.color)
    if (!availSizes.includes(newOrder.size)) {
      setNewOrder((prev) => ({ ...prev, size: "M" }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrder.color])

  const handleGenerateInvoice = (orders: Order[]) => {
    if (!orders.length) return alert("No orders found.")
    const doc = new jsPDF()
    const logoUrl = "/theundergrads-logo.png"
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

    doc.addImage(logoUrl, "PNG", 14, 10, 20, 20)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("THE UNDERGRADS", 40, 20)
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Invoice No: ${invoiceNumber}`, 150, 20)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 26)

    const customer = orders[0]
    let y = 40
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Customer Information", 14, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Name: ${customer.name}`, 14, y)
    y += 5
    doc.text(`Phone: ${customer.phone || "N/A"}`, 14, y)
    y += 5
    doc.text(`Address: ${customer.address || "N/A"}`, 14, y)
    y += 8

    const hasSizeFee = orders.some((o) => getPlusSizeFee(o.size) > 0)
    const tableHead = hasSizeFee
      ? [["Design", "Color", "Size", "Size Fee", "Price", "Status", "Date"]]
      : [["Design", "Color", "Size", "Price", "Status", "Date"]]
    const tableData = orders.map((o) => {
      const sizeFee = getPlusSizeFee(o.size)
      const row = [
        o.design,
        o.color,
        o.size,
        `Php = ${o.price}`,
        formatPaymentStatus(o.payment_status),
        new Date(o.created_at || "").toLocaleDateString(),
      ]

      if (hasSizeFee) {
        row.splice(3, 0, sizeFee > 0 ? `+ Php ${sizeFee}` : "--")
      }

      return row
    })

    autoTable(doc, {
      startY: y,
      head: tableHead,
      body: tableData,
      styles: {
        halign: "center",
        fontSize: 10,
      },
      headStyles: {
        fillColor: [40, 40, 120],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    })

    const tableEnd = (doc as any).lastAutoTable.finalY

    const total = orders.reduce((sum, o) => sum + (o.price || 0), 0)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Total: Php = ${total.toLocaleString()}`, 150, tableEnd + 10)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Thank you for supporting The Undergrads!", 14, tableEnd + 20)
    doc.text("Follow us on Facebook: https://www.facebook.com/TheUndergradsAPOWear", 14, tableEnd + 26)

    doc.save(`Invoice_${customer.name}_${invoiceNumber}.pdf`)
  }

  // Save Customer Info
  const handleSaveCustomer = async () => {
    try {
      const orderIds = customerOrders.map((order) => order.id)
      const updateData = {
        name: customerData.name,
        phone: customerData.phone,
        facebook: customerData.facebook,
        chapter: customerData.chapter,
        address: customerData.address,
        batch: customerData.batch,
        batch_folder: customerData.batch_folder,
      }

      const query = supabase
        .from("orders")
        .update(updateData)

      const { error } = orderIds.length > 0
        ? await query.in("id", orderIds)
        : await query.eq("name", customerName)

      if (error) throw error

      onEditCustomer(customerData)
      setEditingCustomer(false)
      toast({ title: "Customer updated successfully!" })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error updating customer", variant: "destructive" })
    }
  }

  const handleSaveDownpayment = async () => {
    if (!customerOrders.length) return

    const downpayment = Number(paymentDownpayment) || 0
    const firstOrder = customerOrders[0]
    const remainingOrderIds = customerOrders.slice(1).map((order) => order.id)

    try {
      const { error: firstError } = await supabase
        .from("orders")
        .update({ downpayment })
        .eq("id", firstOrder.id)

      if (firstError) throw firstError

      if (remainingOrderIds.length > 0) {
        const { error: remainingError } = await supabase
          .from("orders")
          .update({ downpayment: 0 })
          .in("id", remainingOrderIds)

        if (remainingError) throw remainingError
      }

      toast({ title: "Down payment updated!" })
      onAddMoreOrder({ ...firstOrder, downpayment })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error updating down payment",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const isNewOrderOutOfStock = newOrder.color && newOrder.size && getStockQty(newOrder.color, newOrder.size) === 0

  // Add More Order
  const handleAddOrder = async () => {
    const { data: latestStock } = await supabase
      .from("stocks")
      .select("quantity")
      .eq("color", newOrder.color)
      .eq("size", newOrder.size)
      .maybeSingle()
    const latestStockQty = latestStock?.quantity || 0

    if (latestStockQty === 0) {
      toast({ title: `${newOrder.color} - ${newOrder.size} is out of stock`, variant: "destructive" })
      return
    }

    const normalizedStatus = newOrder.paymentStatus.toLowerCase() as
      | "pending"
      | "awaiting_payment"
      | "partially paid"
      | "fully paid"

    const orderToAdd: Order = {
      id: Date.now(),
      ...customerData,
      color: newOrder.color,
      size: newOrder.size,
      design: newOrder.design,
      payment_status: normalizedStatus,
      price: getCalculatedPrice(newOrder.price, newOrder.size),
      downpayment: 0,
      is_defective: false,
      defective_note: "",
    }

    const insertOrder = {
      name: customerData.name,
      phone: customerData.phone,
      facebook: customerData.facebook,
      chapter: customerData.chapter,
      address: customerData.address,
      batch: customerData.batch,
      batch_folder: customerData.batch_folder,
      color: newOrder.color,
      size: newOrder.size,
      design: newOrder.design,
      payment_status: normalizedStatus,
      price: getCalculatedPrice(newOrder.price, newOrder.size),
      downpayment: 0,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("orders").insert([insertOrder])

    if (error) {
      toast({
        title: "Error adding order",
        description: error.message.toLowerCase().includes("downpayment")
          ? "The orders.downpayment column is missing in Supabase. Run the latest migration first."
          : error.message,
        variant: "destructive",
      })
      return
    }

    // Deduct stock
    if (latestStockQty > 0) {
      await supabase
        .from("stocks")
        .upsert(
          { color: newOrder.color, size: newOrder.size, quantity: latestStockQty - 1 },
          { onConflict: "color,size" }
        )
    }
    onStockUpdate?.()

    justAddedOrder.current = true
    setShowAddMoreForm(false)

    setNewOrder({
      color: colors[0] || "White",
      size: "M",
      design: designs[0] || "Prologue",
      paymentStatus: "pending",
      price: "",
    })

    toast({ title: "Order added successfully!" })
    onAddMoreOrder(orderToAdd)
  }

  // Edit Existing Order
  const handleEditOrderSave = async () => {
    if (!editingOrder) return

    const { error } = await supabase
      .from("orders")
      .update({
        color: editingOrder.color,
        size: editingOrder.size,
        design: editingOrder.design,
        payment_status: editingOrder.payment_status,
        price: editingOrder.price,
      })
      .eq("id", editingOrder.id)

    if (error) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({ title: "Order updated successfully!" })
    onAddMoreOrder(editingOrder)
    setEditingOrder(null)
  }

  // Handle Order Status Change
  const handleOrderStatusChange = async (orderId: number, status: string) => {
    if (status === "defective") {
      setSelectedOrderId(orderId)
      setShowDefectiveNotePopup(true)
      setShowStatusPopup(null)
    } else if (status === "partial_payment") {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "partially paid" })
        .eq("id", orderId)

      if (error) {
        toast({
          title: "Error updating order",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({ title: "Order marked as Partially Paid!" })
      const updatedOrder = customerOrders.find((order) => order.id === orderId)
      if (updatedOrder) onAddMoreOrder({ ...updatedOrder, payment_status: "partially paid" })
      setShowStatusPopup(null)
    } else if (status === "for_shipment") {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "fully paid" })
        .eq("id", orderId)

      if (error) {
        toast({
          title: "Error updating order",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({ title: "Order marked as For Shipment!" })
      const updatedOrder = customerOrders.find((order) => order.id === orderId)
      if (updatedOrder) onAddMoreOrder({ ...updatedOrder, payment_status: "fully paid" })
      setShowStatusPopup(null)
    }
  }

  // Mark Defective with Note
  const handleMarkDefective = async (orderId: number) => {
    const { error } = await supabase
      .from("orders")
      .update({ is_defective: true, defective_note: defectiveNote })
      .eq("id", orderId)

    if (error) {
      toast({
        title: "Error marking defective",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    onMarkDefective(orderId, defectiveNote)
    setShowDefectiveNotePopup(false)
    setSelectedOrderId(null)
    setDefectiveNote("")
    toast({
      title: "Order marked as defective!",
      description: "It has been moved to the Defective Items list.",
    })
  }

  // Get payment status color and icon
  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case "fully paid":
        return { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-400", Icon: CheckCircle }
      case "partially paid":
        return { bg: "bg-amber-100 dark:bg-yellow-900/40", text: "text-amber-700 dark:text-yellow-400", Icon: Clock }
      case "awaiting_payment":
        return { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-400", Icon: Clock }
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", Icon: Pause }
    }
  }

  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "No Confirmation"
      case "awaiting_payment":
        return "Confirmed - Unpaid"
      case "partially paid":
        return "Partially Paid"
      case "fully paid":
        return "Fully Paid"
      default:
        return status.replace("_", " ")
    }
  }

  const getGroupedValue = (values: string[]) => {
    const uniqueValues = Array.from(new Set(values.filter(Boolean)))
    if (uniqueValues.length === 0) return "--"
    if (uniqueValues.length === 1) return uniqueValues[0]
    return "Mixed"
  }

  if (!open) return null

  // Calculate total
  const totalPrice = customerOrders.reduce((sum, o) => sum + (o.price || 0), 0)
  const totalPlusSizeFee = customerOrders.reduce((sum, o) => sum + getPlusSizeFee(o.size), 0)
  const currentDownpayment = Number(paymentDownpayment) || 0
  const remainingBalance = Math.max(0, totalPrice - currentDownpayment)
  const groupedPaymentStatus = getGroupedValue(customerOrders.map((order) => order.payment_status))
  const groupedStatusStyle = getPaymentStatusStyle(groupedPaymentStatus)
  const GroupedStatusIcon = groupedStatusStyle.Icon
  const newOrderSizeFee = getPlusSizeFee(newOrder.size)
  const newOrderCalculatedPrice = getCalculatedPrice(newOrder.price, newOrder.size)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card text-card-foreground rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-none">
                    {customerData.name || "Customer"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs text-blue-100 hover:bg-white/20 hover:text-white flex items-center gap-1"
                    onClick={() => setShowArchiveCustomerConfirm(true)}
                    disabled={customerOrders.length === 0}
                    title="Move customer to previous orders"
                  >
                    <Archive className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs text-red-100 hover:bg-red-500/30 hover:text-white flex items-center gap-1"
                    onClick={() => setShowDeleteCustomerConfirm(true)}
                    disabled={customerOrders.length === 0}
                    title="Delete customer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
                <p className="text-blue-200 text-sm">{customerOrders.length} order(s) - P{totalPrice.toLocaleString()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Customer and Payment Details */}
          <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
            <div className="bg-muted rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Customer Details
                </h3>
                {!editingCustomer && (
                  <Button
                    onClick={() => setEditingCustomer(true)}
                    variant="outline"
                    size="sm"
                    className="h-8 flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                )}
              </div>

              {editingCustomer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                      <Input value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} placeholder="Name" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                      <Input value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} placeholder="Phone" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Facebook</label>
                      <Input value={customerData.facebook} onChange={e => setCustomerData({...customerData, facebook: e.target.value})} placeholder="Facebook" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Chapter</label>
                      <Input value={customerData.chapter} onChange={e => setCustomerData({...customerData, chapter: e.target.value})} placeholder="Chapter" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Batch No.</label>
                      <Input value={customerData.batch} onChange={e => setCustomerData({...customerData, batch: e.target.value})} placeholder="e.g. 22B" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Batch Folder</label>
                      <Input value={customerData.batch_folder} onChange={e => setCustomerData({...customerData, batch_folder: e.target.value})} placeholder="Folder" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                    <Input value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} placeholder="Address" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveCustomer} className="bg-blue-600 hover:bg-blue-700 flex-1 flex items-center justify-center gap-1">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button onClick={() => setEditingCustomer(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2 items-center">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium break-all">{customerData.phone || "--"}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Facebook:</span>
                    <span className="font-medium break-all">{customerData.facebook || "--"}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Chapter:</span>
                    <span className="font-medium">{customerData.chapter || "--"}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Batch:</span>
                    <span className="font-medium">{customerData.batch || "--"}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Folder:</span>
                    <span className="font-medium">{customerData.batch_folder || "--"}</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium break-words">{customerData.address || "--"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block w-px bg-border" />

            <div className="bg-muted rounded-xl p-4 border border-border">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" /> Payment Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${groupedStatusStyle.bg} ${groupedStatusStyle.text} flex items-center gap-1`}>
                    <GroupedStatusIcon className="w-3 h-3" /> {groupedPaymentStatus === "Mixed" ? "Mixed" : formatPaymentStatus(groupedPaymentStatus)}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Down Payment</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentDownpayment}
                    onChange={(e) => setPaymentDownpayment(e.target.value)}
                    onBlur={handleSaveDownpayment}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur()
                      }
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Plus Size Fee</span>
                  <span className="font-medium">Php {totalPlusSizeFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Orders Total</span>
                    <span className="font-semibold">Php {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-base">
                    <span className="font-semibold">Remaining Balance</span>
                    <span className="font-bold text-green-500">Php {remainingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Orders ({customerOrders.length})
            </h3>
            <div className="space-y-3">
              {customerOrders.map(order => {
                const statusStyle = getPaymentStatusStyle(order.payment_status)
                const StatusIcon = statusStyle.Icon
                const sizeFee = getPlusSizeFee(order.size)
                return (
                  <div
                    key={order.id}
                    className="p-4 border border-border rounded-xl bg-card hover:border-blue-300 transition-colors"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Design, Color, Size */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-base truncate max-w-[150px]">{order.design}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm">{order.color}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm font-medium">{order.size}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {order.batch && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                              Batch: {order.batch}
                            </span>
                          )}
                          {order.batch_folder && (
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center gap-1">
                              <Folder className="w-3 h-3" /> {order.batch_folder}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" /> {formatPaymentStatus(order.payment_status)}
                          </span>
                          {sizeFee > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Plus size fee: Php {sizeFee}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-baseline justify-end gap-2">
                          {sizeFee > 0 && (
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              includes +Php {sizeFee}
                            </span>
                          )}
                          <span className="text-lg font-bold text-green-600">P{order.price.toLocaleString()}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 rounded-full px-2 text-xs leading-none flex items-center gap-1"
                            onClick={() => setEditingOrder(order)}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 rounded-full px-2 text-xs leading-none bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1"
                            onClick={() => setShowStatusPopup(order.id)}
                          >
                            <RefreshCw className="w-3 h-3" /> Issue
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 rounded-full px-2 text-xs leading-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1"
                            onClick={() => setArchiveConfirmId(order.id)}
                          >
                            <Archive className="w-3 h-3" /> Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 rounded-full px-2 text-xs leading-none bg-red-50 hover:bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-800 flex items-center gap-1"
                            onClick={() => setDeleteConfirmId(order.id)}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Order Form */}
          {showAddMoreForm && (
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 rounded-xl p-4">
              <h3 className="text-base font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add More Order
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Design *</label>
                  <select
                    className="w-full p-2 border border-input bg-card text-foreground rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newOrder.design}
                    onChange={(e) => setNewOrder({ ...newOrder, design: e.target.value })}
                  >
                    {designs.map(design => <option key={design} value={design}>{design}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Color *</label>
                  <select
                    className="w-full p-2 border border-input bg-card text-foreground rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newOrder.color}
                    onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
                  >
                    {colors.map(color => <option key={color} value={color}>{color}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Size *</label>
                  <select
                    className="w-full p-2 border border-input bg-card text-foreground rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newOrder.size}
                    onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                  >
                    {availableSizesForNewOrder.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                  {!EXTENDED_SIZE_COLORS.some(
                    (c) => c.toLowerCase() === newOrder.color.toLowerCase()
                  ) && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      3XL-5XL available on Black & White only
                    </p>
                  )}
                  {/* Stock indicator */}
                  {newOrder.color && newOrder.size && (() => {
                    const qty = getStockQty(newOrder.color, newOrder.size)
                    if (qty === 0) return (
                      <p className="text-[10px] text-red-700 dark:text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> Out of stock
                      </p>
                    )
                    if (qty <= LOW_STOCK_THRESHOLD) return (
                      <p className="text-[10px] text-amber-700 dark:text-yellow-400 mt-1">
                        Low stock: {qty} remaining
                      </p>
                    )
                    return (
                      <p className="text-[10px] text-green-700 dark:text-green-400 mt-1">
                        In stock: {qty}
                      </p>
                    )
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Payment Status *</label>
                  <select
                    className="w-full p-2 border border-input bg-card text-foreground rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newOrder.paymentStatus}
                    onChange={(e) => setNewOrder({ ...newOrder, paymentStatus: e.target.value })}
                  >
                    <option value="pending">NO CONFIRMATION</option>
                    <option value="awaiting_payment">CONFIRMED - UNPAID</option>
                    <option value="partially paid">Partially Paid</option>
                    <option value="fully paid">Fully Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Price</label>
                  <input
                    type="number"
                    placeholder="Base price"
                    className="w-full p-2 border border-input bg-card text-foreground rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {newOrderSizeFee > 0
                      ? `+ Php ${newOrderSizeFee} size fee = Php ${newOrderCalculatedPrice.toLocaleString()}`
                      : `Total: Php ${newOrderCalculatedPrice.toLocaleString()}`}
                  </p>
                </div>

              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleAddOrder}
                  disabled={!!isNewOrderOutOfStock}
                  className="bg-green-600 hover:bg-green-700 flex-1 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isNewOrderOutOfStock ? <><AlertTriangle className="w-4 h-4" /> Out of Stock</> : <><CheckCircle className="w-4 h-4" /> Add Order</>}
                </Button>
                <Button onClick={() => setShowAddMoreForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap gap-2">
          <Button
            onClick={() => setShowAddMoreForm(!showAddMoreForm)}
            className="bg-green-600 hover:bg-green-700 flex-1 min-w-[120px] flex items-center justify-center gap-1"
          >
            {showAddMoreForm ? "Hide Form" : <><Plus className="w-4 h-4" /> Add Order</>}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 min-w-[100px]"
          >
            Close
          </Button>
          <Button
            onClick={() => handleGenerateInvoice(customerOrders)}
            className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-[100px] flex items-center justify-center gap-1"
          >
            <FileText className="w-4 h-4" /> Invoice
          </Button>
        </div>

        {/* Edit Order Modal */}
        <AnimatePresence>
          {editingOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => setEditingOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Pencil className="w-4 h-4" /> Edit Order
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Design</label>
                    <select
                      className="w-full border border-input bg-background p-2 rounded-lg text-sm"
                      value={editingOrder.design}
                      onChange={(e) => setEditingOrder({ ...editingOrder, design: e.target.value })}
                    >
                      {designs.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Color</label>
                    <select
                      className="w-full border border-input bg-background p-2 rounded-lg text-sm"
                      value={editingOrder.color}
                      onChange={(e) => setEditingOrder({ ...editingOrder, color: e.target.value })}
                    >
                      {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Size</label>
                    <select
                      className="w-full border border-input bg-background p-2 rounded-lg text-sm"
                      value={editingOrder.size}
                      onChange={(e) => setEditingOrder({ ...editingOrder, size: e.target.value })}
                    >
                      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Payment Status</label>
                    <select
                      className="w-full border border-input bg-background p-2 rounded-lg text-sm"
                      value={editingOrder.payment_status}
                      onChange={(e) => setEditingOrder({ ...editingOrder, payment_status: e.target.value })}
                    >
                      <option value="pending">NO CONFIRMATION</option>
                      <option value="awaiting_payment">CONFIRMED - UNPAID</option>
                      <option value="partially paid">Partially Paid</option>
                      <option value="fully paid">Fully Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Price</label>
                    <input
                      type="number"
                      className="w-full border border-input bg-background p-2 rounded-lg text-sm"
                      value={editingOrder.price}
                      onChange={(e) => setEditingOrder({ ...editingOrder, price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <Button onClick={handleEditOrderSave} className="bg-blue-600 hover:bg-blue-700 flex-1 flex items-center justify-center gap-1">
                    <Save className="w-4 h-4" /> Save
                  </Button>
                  <Button onClick={() => setEditingOrder(null)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Selection Popup */}
        <AnimatePresence>
          {showStatusPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => setShowStatusPopup(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-bold text-lg mb-4 text-center flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Update Status
                </h3>

                <div className="space-y-3">
                  {/* For Shipment */}
                  <button
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-500 dark:border-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:hover:border-green-600 transition-all"
                    onClick={() => handleOrderStatusChange(showStatusPopup, "for_shipment")}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-green-800 dark:text-green-400">For Shipment</div>
                      <div className="text-xs text-green-700 dark:text-green-500">Ready to ship, fully paid</div>
                    </div>
                  </button>

                  {/* Partial Payment */}
                  <button
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 dark:border-yellow-800 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:hover:border-yellow-600 transition-all"
                    onClick={() => handleOrderStatusChange(showStatusPopup, "partial_payment")}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-yellow-900/60 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-700 dark:text-yellow-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-amber-800 dark:text-yellow-400">Partial Payment</div>
                      <div className="text-xs text-amber-700 dark:text-yellow-500">Customer has made partial payment</div>
                    </div>
                  </button>

                  {/* Defective */}
                  <button
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-500 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:hover:border-red-600 transition-all"
                    onClick={() => handleOrderStatusChange(showStatusPopup, "defective")}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-red-800 dark:text-red-400">Defective</div>
                      <div className="text-xs text-red-700 dark:text-red-500">Item has defects or issues</div>
                    </div>
                  </button>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowStatusPopup(null)}
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Defective Note Popup */}
        <AnimatePresence>
          {showDefectiveNotePopup && selectedOrderId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => {
                setShowDefectiveNotePopup(false)
                setSelectedOrderId(null)
                setDefectiveNote("")
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mark as Defective</h3>
                    <p className="text-sm text-muted-foreground">This cannot be undone easily</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This order will be moved to the Defective Items list.
                  </p>
                </div>

                <label className="block text-sm font-medium mb-2">Defective Note (optional)</label>
                <textarea
                  placeholder="Describe the defect or issue..."
                  value={defectiveNote}
                  onChange={(e) => setDefectiveNote(e.target.value)}
                  className="w-full p-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none resize-none text-sm"
                  rows={3}
                />

                <div className="flex gap-2 mt-4">
                  <Button
                    className="bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center gap-1"
                    onClick={() => handleMarkDefective(selectedOrderId)}
                  >
                    <AlertTriangle className="w-4 h-4" /> Confirm Defective
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDefectiveNotePopup(false)
                      setSelectedOrderId(null)
                      setDefectiveNote("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archive Customer Confirmation */}
        <AnimatePresence>
          {showArchiveCustomerConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => setShowArchiveCustomerConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Archive className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Move to Previous Orders</h3>
                    <p className="text-sm text-muted-foreground">Hide from dashboard</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Move {customerData.name || "this customer"} and all {customerOrders.length} order(s) to Previous Orders?
                    You can restore them later.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Previous Order Folder</label>
                  <select
                    value={selectedPreviousFolder}
                    onChange={(event) => setSelectedPreviousFolder(event.target.value)}
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

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await onArchiveCustomer(customerOrders.map((order) => order.id), selectedPreviousFolder)
                      setShowArchiveCustomerConfirm(false)
                      setSelectedPreviousFolder("")
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 flex-1 flex items-center justify-center gap-1"
                  >
                    <Archive className="w-4 h-4" /> Move
                  </Button>
                  <Button
                    onClick={() => {
                      setShowArchiveCustomerConfirm(false)
                      setSelectedPreviousFolder("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Customer Confirmation */}
        <AnimatePresence>
          {showDeleteCustomerConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => setShowDeleteCustomerConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-700 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Delete Customer</h3>
                    <p className="text-sm text-muted-foreground">Move all orders to Trash</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Move {customerData.name || "this customer"} and all {customerOrders.length} order(s) to Trash?
                    You can restore the orders later from the Trash.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await onDeleteCustomer(customerOrders.map((order) => order.id))
                      setShowDeleteCustomerConfirm(false)
                    }}
                    className="bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  <Button onClick={() => setShowDeleteCustomerConfirm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archive Order Confirmation */}
        <AnimatePresence>
          {archiveConfirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => setArchiveConfirmId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Archive className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Move Order</h3>
                    <p className="text-sm text-muted-foreground">Send to Previous Orders</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    This order will disappear from the dashboard and move to Previous Orders.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Previous Order Folder</label>
                  <select
                    value={selectedPreviousFolder}
                    onChange={(event) => setSelectedPreviousFolder(event.target.value)}
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

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await onArchiveOrder(archiveConfirmId, selectedPreviousFolder)
                      setArchiveConfirmId(null)
                      setSelectedPreviousFolder("")
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 flex-1 flex items-center justify-center gap-1"
                  >
                    <Archive className="w-4 h-4" /> Move
                  </Button>
                  <Button
                    onClick={() => {
                      setArchiveConfirmId(null)
                      setSelectedPreviousFolder("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
              onClick={() => setDeleteConfirmId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-700 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Delete Order</h3>
                    <p className="text-sm text-muted-foreground">Move to Trash</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Are you sure you want to move this order to Trash? You can restore it later from the Trash.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (deleteConfirmId) {
                        onDeleteOrder(deleteConfirmId)
                      }
                      setDeleteConfirmId(null)
                    }}
                    className="bg-red-600 hover:bg-red-700 flex-1 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  <Button onClick={() => setDeleteConfirmId(null)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
