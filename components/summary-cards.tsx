"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, ChevronDown, ChevronUp } from "lucide-react"

interface SummaryCardsProps {
  totalTShirts: number
  onDownloadBreakdown: (format: "color-size" | "design-color-size") => void
  // 🆕 Add the orders array to show breakdown beside the card
  orders?: {
    color: string
    size: string
  }[]
}

export default function SummaryCards({ totalTShirts, onDownloadBreakdown, orders = [] }: SummaryCardsProps) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [openColor, setOpenColor] = useState<string | null>(null)

  // 🧮 Group orders by color → size → quantity
  const colorGroups = orders.reduce((acc: Record<string, Record<string, number>>, order) => {
    if (!acc[order.color]) acc[order.color] = {}
    if (!acc[order.color][order.size]) acc[order.color][order.size] = 0
    acc[order.color][order.size]++
    return acc
  }, {})

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* 📦 Total Orders Card */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <h2 className="text-xl font-semibold mb-2">Total T-Shirts Ordered</h2>
          <p className="text-4xl font-bold mb-4">{totalTShirts}</p>

          {/* 🔽 Download Button */}
          <Button onClick={() => setShowDownloadDialog(true)} className="flex items-center gap-2">
            <Download size={18} />
            Download Breakdown
          </Button>
        </CardContent>
      </Card>

      {/* 🎨 Color & Size Breakdown beside the card */}
      <Card className="shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-3">Breakdown by Color & Size</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {Object.entries(colorGroups).length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            Object.entries(colorGroups).map(([color, sizes]) => (
              <div key={color} className="border rounded-lg">
                <button
                  onClick={() => setOpenColor(openColor === color ? null : color)}
                  className="flex justify-between w-full px-3 py-2 font-medium bg-gray-50 rounded-t-lg"
                >
                  <span>{color}</span>
                  {openColor === color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openColor === color && (
                  <div className="px-4 py-2 text-sm space-y-1">
                    {Object.entries(sizes).map(([size, qty]) => (
                      <div key={size} className="flex justify-between">
                        <span>
                          Size <b>{size}</b>
                        </span>
                        <span className="font-semibold">{qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 🪟 Download Options Popup */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Choose Download Format</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onDownloadBreakdown("color-size")
                setShowDownloadDialog(false)
              }}
              className="w-full"
            >
              Download by Color & Size
            </Button>
            <Button
              onClick={() => {
                onDownloadBreakdown("design-color-size")
                setShowDownloadDialog(false)
              }}
              variant="outline"
              className="w-full"
            >
              Download by Design, Color & Size
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
