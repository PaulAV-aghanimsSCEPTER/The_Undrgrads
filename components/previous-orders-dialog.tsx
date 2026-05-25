"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Archive, Folder, Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react"
import type { Order } from "@/components/trash-dialog"

interface PreviousOrdersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previousOrders: Order[]
  folders: string[]
  onCreateFolder: (folderName: string) => void
  onRenameFolder: (oldName: string, newName: string) => void
  onDeleteFolder: (folderName: string) => void
  onMoveOrdersToFolder: (orderIds: number[], folderName: string) => void
  onRetrieveOrder: (orderId: number) => void
  onRetrieveOrders: (orderIds: number[]) => void
  onDeleteOrderPermanently: (orderId: number) => void
  onDeleteOrdersPermanently: (orderIds: number[]) => void
  onRetrieveAll: () => void
  onDeleteAllPermanently: () => void
}

const SEPARATOR = "|||"

export default function PreviousOrdersDialog({
  open,
  onOpenChange,
  previousOrders,
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveOrdersToFolder,
  onRetrieveOrder,
  onRetrieveOrders,
  onDeleteOrderPermanently,
  onDeleteOrdersPermanently,
  onRetrieveAll,
  onDeleteAllPermanently,
}: PreviousOrdersDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState("All")
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolder, setEditingFolder] = useState("")
  const [editingFolderName, setEditingFolderName] = useState("")

  if (!open) return null

  const visiblePreviousOrders = previousOrders.filter((order) => {
    const orderFolder = (order as any).previous_folder || ""

    if (selectedFolder === "All") return true
    if (selectedFolder === "") return orderFolder === ""
    return orderFolder === selectedFolder
  })

  const previousCustomers = Array.from(
    new Set(
      visiblePreviousOrders.map(
        (order) =>
          `${order.name}${SEPARATOR}${order.phone || ""}${SEPARATOR}${order.facebook || ""}${SEPARATOR}${order.address || ""}`
      )
    )
  )
    .map((key) => {
      const [name, phone, facebook, address] = key.split(SEPARATOR)
      const orders = visiblePreviousOrders.filter(
        (order) =>
          order.name === name &&
          (order.phone || "") === phone &&
          (order.facebook || "") === facebook &&
          (order.address || "") === address
      )

      return {
        id: key,
        name,
        orders,
        firstOrder: orders[0],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (!name) return

    onCreateFolder(name)
    setNewFolderName("")
    setSelectedFolder(name)
  }

  const handleSaveFolder = () => {
    const name = editingFolderName.trim()
    if (!editingFolder || !name) return

    onRenameFolder(editingFolder, name)
    setSelectedFolder((current) => (current === editingFolder ? name : current))
    setEditingFolder("")
    setEditingFolderName("")
  }

  const handleDeleteFolder = (folder: string) => {
    onDeleteFolder(folder)
    setSelectedFolder((current) => (current === folder ? "All" : current))
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-card text-card-foreground rounded-2xl shadow-xl p-6 max-w-4xl w-full mx-4 my-8 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Archive className="w-5 h-5" /> Previous Customers ({previousCustomers.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {visiblePreviousOrders.length} archived order(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onRetrieveAll}
              disabled={previousOrders.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retrieve All
            </Button>
            <Button
              onClick={onDeleteAllPermanently}
              disabled={previousOrders.length === 0}
              variant="destructive"
              size="sm"
            >
              Delete All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 mb-4">
          <div className="border border-border rounded-lg p-3 space-y-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Folder className="w-4 h-4" /> Folders
              </h3>
              <div className="flex gap-2">
                <input
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleCreateFolder()
                  }}
                  placeholder="Folder name"
                  className="min-w-0 flex-1 h-9 rounded-md border border-input bg-background px-2 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleCreateFolder}
                  size="icon"
                  className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700"
                  title="Create folder"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedFolder("All")}
                className={`w-full text-left rounded-md px-2 py-2 text-sm transition ${
                  selectedFolder === "All" ? "bg-muted font-medium" : "hover:bg-muted/60"
                }`}
              >
                All Previous
              </button>
              <button
                type="button"
                onClick={() => setSelectedFolder("")}
                className={`w-full text-left rounded-md px-2 py-2 text-sm transition ${
                  selectedFolder === "" ? "bg-muted font-medium" : "hover:bg-muted/60"
                }`}
              >
                No Folder
              </button>

              {folders.map((folder) => (
                <div key={folder} className="rounded-md hover:bg-muted/60">
                  {editingFolder === folder ? (
                    <div className="flex items-center gap-1 p-1">
                      <input
                        value={editingFolderName}
                        onChange={(event) => setEditingFolderName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSaveFolder()
                          if (event.key === "Escape") setEditingFolder("")
                        }}
                        className="min-w-0 flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm"
                        autoFocus
                      />
                      <Button type="button" size="icon" className="h-8 w-8" onClick={handleSaveFolder}>
                        <Save className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingFolder("")}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedFolder(folder)}
                        className={`min-w-0 flex-1 text-left rounded-md px-2 py-2 text-sm transition ${
                          selectedFolder === folder ? "bg-muted font-medium" : ""
                        }`}
                      >
                        <span className="block truncate">{folder}</span>
                      </button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingFolder(folder)
                          setEditingFolderName(folder)
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteFolder(folder)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {previousCustomers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Archive className="w-10 h-10 mx-auto mb-2 opacity-50" />
                No previous orders yet
              </div>
            ) : (
              previousCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 border border-border rounded-lg flex flex-col gap-3 hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="text-sm">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        {customer.name}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {customer.orders.length} order(s)
                        </span>
                        {customer.firstOrder?.batch && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            Batch: {customer.firstOrder.batch}
                          </span>
                        )}
                        {customer.firstOrder?.batch_folder && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                            <Folder className="w-3 h-3" /> {customer.firstOrder.batch_folder}
                          </span>
                        )}
                      </div>
                      {(customer.firstOrder as any)?.archived_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Archived: {new Date((customer.firstOrder as any).archived_at).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="grid w-full grid-cols-[minmax(96px,1fr)_auto_auto] items-center gap-2 sm:w-auto">
                      <select
                        value={(customer.firstOrder as any)?.previous_folder || ""}
                        onChange={(event) =>
                          onMoveOrdersToFolder(
                            customer.orders.map((order) => order.id),
                            event.target.value
                          )
                        }
                        className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="">No folder</option>
                        {folders.map((folder) => (
                          <option key={folder} value={folder}>
                            {folder}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => onRetrieveOrders(customer.orders.map((order) => order.id))}
                        className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Add All
                      </Button>
                      <Button
                        onClick={() => onDeleteOrdersPermanently(customer.orders.map((order) => order.id))}
                        variant="destructive"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-border pt-2">
                    {customer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground"
                      >
                        <span>
                          {order.design} - {order.color} - {order.size}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-700 font-medium"
                            onClick={() => order.id && onRetrieveOrder(order.id)}
                          >
                            Retrieve
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700 font-medium"
                            onClick={() => order.id && onDeleteOrderPermanently(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
          Close
        </Button>
      </div>
    </div>
  )
}
