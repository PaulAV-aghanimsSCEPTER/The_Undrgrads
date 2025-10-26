"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Order {
  id?: number
  name: string
  color: string
  size: string
  design: string
  price?: number
  total?: number
}

interface SummaryCardsProps {
  totalTShirts: number
  orders: Order[]
  onCardClick?: (type: "total" | "designs") => void
  onDownload?: (type: "total" | "byDesign" | "orders") => void
}

export default function SummaryCards({ totalTShirts, orders, onCardClick, onDownload }: SummaryCardsProps) {
  const designsPerSizeColor = new Set(orders.map((o) => `${o.color}-${o.size}`)).size

  const cardClass = "p-3 sm:p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <Card
        className={`${cardClass} bg-blue-50 border-blue-200 hover:bg-blue-100`}
        onClick={() => onCardClick?.("total")}
      >
        <div className="text-xs sm:text-sm text-gray-600">Total T-Shirts</div>
        <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalTShirts}</div>
      </Card>

      <Card
        className={`${cardClass} bg-green-50 border-green-200 hover:bg-green-100`}
        onClick={() => onCardClick?.("designs")}
      >
        <div className="text-xs sm:text-sm text-gray-600">Designs Per Size/Color</div>
        <div className="text-2xl sm:text-3xl font-bold text-green-600">{designsPerSizeColor}</div>
      </Card>

      <Card className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg transition-all">
        <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Export Data</div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
            onClick={() => onDownload?.("total")}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs">Total T-Shirts</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
            onClick={() => onDownload?.("byDesign")}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs">By Design</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
            onClick={() => onDownload?.("orders")}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs">Orders Report</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
