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
  onViewOrder: (customerName: string) => void
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
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Facebook</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Orders</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.name} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.chapter}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{customer.phone}</td>
                  <td className="px-4 py-3 text-sm">{customer.facebook}</td>
                  <td className="px-4 py-3 text-sm font-medium">{customer.orders.length}</td>
                  <td className="px-4 py-3 text-center">
                    <Button onClick={() => onViewOrder(customer.name)} size="sm" variant="outline">
                      View Orders
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {customers.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, totalItems)} of{" "}
          {totalItems} customers
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
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
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
