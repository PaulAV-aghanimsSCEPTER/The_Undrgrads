"use client"

import { Button } from "@/components/ui/button"

interface Order {
  id?: number
  name: string
  color: string
  size: string
  design: string
}

interface Customer {
  id: string
  name: string
  facebook: string
  phone: string
  chapter: string
  address: string
  orders: Order[]
}

interface CustomersTableProps {
  customers: Customer[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onViewOrder: (customerId: string) => void
  defectiveItems: any[]
}

export default function CustomersTable({
  customers,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewOrder,
}: CustomersTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Customer</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold hidden sm:table-cell">Phone</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold hidden md:table-cell">Facebook</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Orders</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 sm:px-4 py-4 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="font-medium text-xs sm:text-sm">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.chapter}</div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">
                    {customer.phone}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden md:table-cell">
                    {customer.facebook}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">{customer.orders.length}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                    <Button onClick={() => onViewOrder(customer.id)} size="sm" variant="outline" className="text-xs">
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm">
        <div className="text-gray-600">
          Showing {customers.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, totalItems)} of{" "}
          {totalItems}
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Prev
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="text-xs w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
