"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"
import { motion, AnimatePresence } from "framer-motion"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Order {
  id: number
  name: string
  phone?: string
  facebook?: string
  chapter?: string
  address?: string
  color: string
  size: string
  design: string
  payment_status: "pending" | "partially paid" | "fully paid"
  price: number
  is_defective?: boolean
  defective_note?: string
  created_at?: string
}

interface ViewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string | null
  customerOrders: Order[]
  colors: string[]
  designs: string[]
  onAddMoreOrder: (order: Order) => void
  onDeleteOrder: (orderId: number) => void
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
  onAddMoreOrder,
  onDeleteOrder,
  onEditCustomer,
  onMarkDefective,
}: ViewOrderDialogProps) {
  const { toast } = useToast()
  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]

  const [editingCustomer, setEditingCustomer] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const [customerData, setCustomerData] = useState({
    name: customerName || "",
    phone: customerOrders[0]?.phone || "",
    facebook: customerOrders[0]?.facebook || "",
    chapter: customerOrders[0]?.chapter || "",
    address: customerOrders[0]?.address || "",
  })

  const [newOrder, setNewOrder] = useState({
    color: colors[0] || "White",
    size: "M",
    design: designs[0] || "Prologue",
    paymentStatus: "Pending",
    price: "",
  })

  const [showAddMoreForm, setShowAddMoreForm] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [defectiveNote, setDefectiveNote] = useState("")
  const [showDefectiveNote, setShowDefectiveNote] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    setCustomerData({
      name: customerName || "",
      phone: customerOrders[0]?.phone || "",
      facebook: customerOrders[0]?.facebook || "",
      chapter: customerOrders[0]?.chapter || "",
      address: customerOrders[0]?.address || "",
    })
  }, [customerName, customerOrders])
const handleGenerateInvoice = (orders: Order[]) => {
  if (!orders.length) return alert("No orders found.");
  const doc = new jsPDF();
  const logoUrl = "/theundergrads-logo.png"; // 🔹 Place your logo inside /public folder
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  // 🧢 Add Logo

  doc.addImage(logoUrl, "PNG", 14, 10, 20, 20);
  // 🧾 Header Text
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("THE UNDERGRADS", 40, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${invoiceNumber}`, 150, 20);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 26);

  // 🧍 Customer Info
  const customer = orders[0];
  let y = 40;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${customer.name}`, 14, y);
  y += 5;
  doc.text(`Phone: ${customer.phone || "N/A"}`, 14, y);
  y += 5;
  doc.text(`Address: ${customer.address || "N/A"}`, 14, y);
  y += 8;

  // 📦 Orders Table
  const tableData = orders.map((o) => [
    o.design,
    o.color,
    o.size,
    `Php = ${o.price}`,
    o.payment_status.replace("_", " "),
    new Date(o.created_at || "").toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Design", "Color", "Size", "Price", "Status", "Date"]],
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
  });

  const tableEnd = (doc as any).lastAutoTable.finalY;

  // 💰 Total
  const total = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: Php = ${total.toLocaleString()}`, 150, tableEnd + 10);

  // 💬 Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for supporting The Undergrads!", 14, tableEnd + 20);
  doc.text("Follow us on Facebook: https://www.facebook.com/TheUndergradsAPOWear", 14, tableEnd + 26);


  // 🧾 Save PDF
  doc.save(`Invoice_${customer.name}_${invoiceNumber}.pdf`);
};

  // ✅ Save Customer Info
  const handleSaveCustomer = async () => {

    try {

      await supabase.from("customers").update(customerData).eq("name", customerName)

      onEditCustomer(customerData)

      setEditingCustomer(false)

      toast({ title: "Customer updated successfully!" })

    } catch (err: any) {

      console.error(err)

      toast({ title: "Error updating customer", variant: "destructive" })

    }

  }



  // ✅ Add More Order

  const handleAddOrder = async () => {

    const normalizedStatus =

      newOrder.paymentStatus.toLowerCase() as "pending" | "partially paid" | "fully paid"



    const orderToAdd: Order = {

      id: Date.now(),

      ...customerData,

      color: newOrder.color,

      size: newOrder.size,

      design: newOrder.design,

      payment_status: normalizedStatus,

      price: Number(newOrder.price) || 0,

      is_defective: false,

      defective_note: "",

    }



    const { error } = await supabase.from("orders").insert([

      {

        name: customerData.name,

        phone: customerData.phone,

        facebook: customerData.facebook,

        chapter: customerData.chapter,

        address: customerData.address,

        color: newOrder.color,

        size: newOrder.size,

        design: newOrder.design,

        payment_status: normalizedStatus,

        price: Number(newOrder.price) || 0,

        created_at: new Date().toISOString(),

      },

    ])



    if (error) {

      toast({

        title: "Error adding order",

        description: error.message,

        variant: "destructive",

      })

      return

    }



    onAddMoreOrder(orderToAdd)

    setShowAddMoreForm(false)

    toast({ title: "✅ Order added successfully!" })

  }



  

  // ✅ Edit Existing Order

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



    toast({ title: "✅ Order updated successfully!" })

    setEditingOrder(null)

  }



  // ✅ Mark Defective

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

    setShowDefectiveNote(false)

    setSelectedOrderId(null)

    setDefectiveNote("")

    toast({

      title: "✅ Order marked as defective!",

      description: "It has been moved to the Defective Items list.",

    })

  }



  if (!open) return null



  return (

    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">

      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 w-full max-w-3xl">

        {/* 🧾 Customer Info */}

        <div className="mb-6 bg-gray-50 rounded-lg p-4 border">

          <h2 className="text-lg font-semibold mb-3">Customer Details</h2>

          {editingCustomer ? (

            <>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">

                <Input value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} placeholder="Name" />

                <Input value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} placeholder="Phone" />

                <Input value={customerData.facebook} onChange={e => setCustomerData({...customerData, facebook: e.target.value})} placeholder="Facebook" />

                <Input value={customerData.chapter} onChange={e => setCustomerData({...customerData, chapter: e.target.value})} placeholder="Chapter" />

                <Input value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} placeholder="Address" />

              </div>

              <div className="flex gap-2">

                <Button onClick={handleSaveCustomer} className="bg-blue-600 hover:bg-blue-700 flex-1">Save</Button>

                <Button onClick={() => setEditingCustomer(false)} variant="outline" className="flex-1">Cancel</Button>

              </div>

            </>

          ) : (

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">

              <div className="text-sm text-gray-700">

                <p><strong>Name:</strong> {customerData.name || "—"}</p>

                <p><strong>Facebook:</strong> {customerData.facebook || "—"}</p>

                <p><strong>Phone:</strong> {customerData.phone || "—"}</p>

                <p><strong>Chapter:</strong> {customerData.chapter || "—"}</p>

                <p><strong>Address:</strong> {customerData.address || "—"}</p>

              </div>

              <Button onClick={() => setEditingCustomer(true)} variant="outline" className="mt-3 sm:mt-0">Edit Info</Button>

            </div>

          )}

        </div>



        {/* 🧩 Orders List */}

        <div className="mb-6">

          <h2 className="text-lg font-semibold mb-3">Orders ({customerOrders.length})</h2>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">

            {customerOrders.map(order => (

              <div key={order.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm">

                <div className="flex-1 text-sm text-gray-800">

                  <div><strong>{order.color}</strong> – {order.size} – {order.design}</div>

                  <div>

                    <strong>Status:</strong>{" "}

                    <span

                      className={

                        order.payment_status === "fully paid"

                          ? "text-green-600 font-semibold"

                          : order.payment_status === "partially paid"

                          ? "text-yellow-600 font-semibold"

                          : "text-gray-600 font-semibold"

                      }

                    >

                      {order.payment_status

                        .split(" ")

                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))

                        .join(" ")}

                    </span>

                  </div>

                  <div>₱{order.price}</div>

                </div>



                <div className="flex gap-2 mt-2 sm:mt-0">

                  <Button size="sm" variant="outline" onClick={() => setEditingOrder(order)}>Edit</Button>

                  <Button size="sm" variant="outline" onClick={() => { setSelectedOrderId(order.id); setShowDefectiveNote(!showDefectiveNote); }}>Mark Defective</Button>

                  <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmId(order.id)}>Delete</Button>

                </div>



                {selectedOrderId === order.id && showDefectiveNote && (

                  <div className="mt-2 w-full flex gap-2">

                    <Input placeholder="Defective note (optional)" value={defectiveNote} onChange={e => setDefectiveNote(e.target.value)} />

                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleMarkDefective(order.id)}>Save</Button>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>



        {/* ➕ Add Order Form */}

        {showAddMoreForm && (

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">

            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-blue-300 pb-1">🛍️ Add More Order</h3>



            <label className="block text-sm font-semibold text-gray-700 mb-1">Color *</label>

            <select

              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"

              value={newOrder.color}

              onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}

            >

              {colors.map(color => <option key={color} value={color}>{color}</option>)}

            </select>



            <label className="block text-sm font-semibold text-gray-700 mb-1">Size *</label>

            <select

              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"

              value={newOrder.size}

              onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}

            >

              {sizes.map(size => <option key={size} value={size}>{size}</option>)}

            </select>



            <label className="block text-sm font-semibold text-gray-700 mb-1">Design *</label>

            <select

              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"

              value={newOrder.design}

              onChange={(e) => setNewOrder({ ...newOrder, design: e.target.value })}

            >

              {designs.map(design => <option key={design} value={design}>{design}</option>)}

            </select>



            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Status *</label>

            <select

              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"

              value={newOrder.paymentStatus}

              onChange={(e) => setNewOrder({ ...newOrder, paymentStatus: e.target.value })}

            >

              <option value="Pending">Pending</option>

              <option value="Partially Paid">Partially Paid</option>

              <option value="Fully Paid">Fully Paid</option>

            </select>



            <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>

            <input

              type="number"

              placeholder="Enter price"

              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"

              value={newOrder.price}

              onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}

            />



            <div className="flex justify-between">

              <button onClick={handleAddOrder} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Order</button>

              <button onClick={() => setShowAddMoreForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded border hover:bg-gray-200">Cancel</button>

            </div>

          </div>

        )}



        <div className="flex gap-2">

          <Button onClick={() => setShowAddMoreForm(!showAddMoreForm)} className="bg-green-600 hover:bg-green-700 flex-1">

            {showAddMoreForm ? "Hide Form" : "Add More Order"}

          </Button>

          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">

            Close

          </Button>

<Button

  onClick={() => handleGenerateInvoice(customerOrders)}

  className="bg-blue-600 hover:bg-blue-700 flex-1"

>

  🧾 Generate Invoice

</Button>





        </div>



        {/* 📝 Edit Order Modal */}

        <AnimatePresence>

          {editingOrder && (

            <motion.div

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: 20 }}

              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"

            >

              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">

                <h3 className="font-semibold mb-3 text-gray-800">Edit Order</h3>



                <div className="space-y-3">

                  <label className="block text-sm font-medium">Color</label>

                  <select

                    className="w-full border p-2 rounded"

                    value={editingOrder.color}

                    onChange={(e) => setEditingOrder({ ...editingOrder, color: e.target.value })}

                  >

                    {colors.map(c => <option key={c} value={c}>{c}</option>)}

                  </select>



                  <label className="block text-sm font-medium">Size</label>

                  <select

                    className="w-full border p-2 rounded"

                    value={editingOrder.size}

                    onChange={(e) => setEditingOrder({ ...editingOrder, size: e.target.value })}

                  >

                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}

                  </select>



                  <label className="block text-sm font-medium">Design</label>

                  <select

                    className="w-full border p-2 rounded"

                    value={editingOrder.design}

                    onChange={(e) => setEditingOrder({ ...editingOrder, design: e.target.value })}

                  >

                    {designs.map(d => <option key={d} value={d}>{d}</option>)}

                  </select>



                  <label className="block text-sm font-medium">Payment Status</label>

                  <select

                    className="w-full border p-2 rounded"

                    value={editingOrder.payment_status}

                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_status: e.target.value as any })}

                  >

                    <option value="pending">Pending</option>

                    <option value="partially paid">Partially Paid</option>

                    <option value="fully paid">Fully Paid</option>

                  </select>



                  <label className="block text-sm font-medium">Price</label>

                  <input

                    type="number"

                    className="w-full border p-2 rounded"

                    value={editingOrder.price}

                    onChange={(e) => setEditingOrder({ ...editingOrder, price: Number(e.target.value) })}

                  />

                </div>



                <div className="flex gap-2 mt-4">

                  <Button onClick={handleEditOrderSave} className="bg-blue-600 hover:bg-blue-700 flex-1">

                    Save

                  </Button>

                  <Button onClick={() => setEditingOrder(null)} variant="outline" className="flex-1">

                    Cancel

                  </Button>

                </div>

              </div>

            </motion.div>

          )}

        </AnimatePresence>



        {/* 🗑️ Delete Confirmation */}

        {deleteConfirmId && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">

              <h3 className="font-semibold mb-2">Confirm Deletion</h3>

              <p>Are you sure you want to move this order to Trash?</p>

              <div className="flex gap-2 mt-4">

                <Button

                  onClick={() => {

                    if (deleteConfirmId) {

                      onDeleteOrder(deleteConfirmId);

                    }

                    setDeleteConfirmId(null);

                  }}

                  className="bg-red-600 hover:bg-red-700 flex-1"

                >

                  Yes

                </Button>

                <Button onClick={() => setDeleteConfirmId(null)} variant="outline" className="flex-1">

                  Cancel

                </Button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  )

}
