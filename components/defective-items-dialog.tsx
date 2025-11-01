"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw } from "lucide-react"

export default function DefectiveItemsDialog({
  open,
  onOpenChange,
  defectiveOrders,
  onRetrieveDefective,
  onDeleteDefectivePermanently,
  onDeleteAllDefectivePermanently,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1200px] rounded-xl bg-background shadow-xl border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-600">🧩</span>
              <span>Defective Items</span>
              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                {defectiveOrders.length}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {defectiveOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg font-medium">No defective items found 🧼</p>
          </div>
        ) : (
          <div className="mt-4 overflow-y-auto max-h-[60vh] border border-border rounded-lg">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 text-left w-[15%]">Customer</th>
                  <th className="p-3 text-left w-[15%]">Design</th>
                  <th className="p-3 text-left w-[10%]">Color</th>
                  <th className="p-3 text-center w-[8%]">Size</th>
                  <th className="p-3 text-left w-[30%] text-red-600">Note</th>
                  <th className="p-3 text-center w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {defectiveOrders.map((o: any, index: number) => (
                  <tr
                    key={o.id}
                    className={`transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="p-3 border-t font-medium text-gray-800">
                      {o.name || "—"}
                    </td>
                    <td className="p-3 border-t">{o.design || "—"}</td>
                    <td className="p-3 border-t">{o.color || "—"}</td>
                    <td className="p-3 border-t text-center">{o.size || "—"}</td>

                    {/* 🔴 More readable red note section */}
                    <td className="p-3 border-t">
                      <div
                        className={`px-3 py-2 rounded-md ${
                          o.defective_note
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium"
                            : "text-gray-500"
                        }`}
                        style={{
                          whiteSpace: "pre-wrap",
                          wordWrap: "break-word",
                          maxHeight: "5rem",
                          overflowY: "auto",
                        }}
                      >
                        {o.defective_note || "—"}
                      </div>
                    </td>

                    <td className="p-3 border-t text-center">
                      <div className="flex justify-center gap-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          onClick={() => onRetrieveDefective(o.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retrieve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => onDeleteDefectivePermanently(o.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {defectiveOrders.length > 0 && (
          <div className="flex justify-end mt-5">
            <Button
              variant="destructive"
              className="flex items-center gap-2 font-medium px-5 py-2.5"
              onClick={onDeleteAllDefectivePermanently}
            >
              <Trash2 className="w-4 h-4" />
              Delete All Permanently
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
