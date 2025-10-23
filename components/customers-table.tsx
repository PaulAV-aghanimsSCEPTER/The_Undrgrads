"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Customer {
  name: string
  facebook: string
  phone: string
  chapter: string
  orders: any[]
}

interface DefectiveItem {
  id: number
  name: string
  color: string
  size: string
  design: string
}

interface CustomersTableProps {
  customers: Customer[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onViewOrder: (customerName: string) => void
  defectiveItems: DefectiveItem[]
}

export default function CustomersTable({
  customers,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewOrder,
  defectiveItems,
}: CustomersTableProps) {
  const startItem = (currentPage - 1) * 10 + 1
  const endItem = Math.min(currentPage * 10, totalItems)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">NAME</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">FACEBOOK</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">PHONE</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">CHAPTER</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">ORDERS</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.name} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{customer.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`https://${customer.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {customer.facebook}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.phone}</td>
                    <td className="px-4 py-3 text-sm">{customer.chapter}</td>
                    <td className="px-4 py-3 text-sm">{customer.orders.length}</td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="link"
                        className="p-0 text-blue-600 hover:text-blue-700"
                        onClick={() => onViewOrder(customer.name)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {totalItems} entries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => onPageChange(page)}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300"}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {defectiveItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Defective Items ({defectiveItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">CUSTOMER</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">COLOR</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">SIZE</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">DESIGN</th>
                  </tr>
                </thead>
                <tbody>
                  {defectiveItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.color}</td>
                      <td className="px-4 py-3 text-sm">{item.size}</td>
                      <td className="px-4 py-3 text-sm">{item.design}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
