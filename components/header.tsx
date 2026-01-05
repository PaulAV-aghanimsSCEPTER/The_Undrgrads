"use client"

import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Palette,
  Layers,
  Trash2,
  LogOut,
  Download,
  Menu,
  FileDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onAddOrder: () => void
  onAddDesign: () => void
  onAddColor: () => void
  onDeleteAll: () => void
  onViewTrash: () => void
  onLogout: () => void
  onExportTotalPDF: () => void
  onExportByDesignPDF: () => void
  onExportOrdersPDF: () => void
  onExportShippingInfo: () => void
}

export default function Header({
  onAddOrder,
  onAddDesign,
  onAddColor,
  onDeleteAll,
  onViewTrash,
  onLogout,
  onExportTotalPDF,
  onExportByDesignPDF,
  onExportOrdersPDF,
  onExportShippingInfo,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* ✅ Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 sm:h-10 sm:w-10 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            The Undergrads
          </h1>
        </div>

        {/* ✅ Main Actions */}
        <div className="flex items-center gap-3">
          {/* Keep Add Order separate */}
          <Button
            onClick={onAddOrder}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            Add Order
          </Button>

          {/* Dropdown for grouped actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Menu className="w-4 h-4" /> More Actions
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* --- Export Group --- */}
              <DropdownMenuLabel>📦 Export</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onExportShippingInfo}>
                  <Download className="mr-2 h-4 w-4 text-green-600" />
                  Export Shipping Info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportTotalPDF}>
                  <FileDown className="mr-2 h-4 w-4 text-green-600" />
                  Export Total T-Shirts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportByDesignPDF}>
                  <FileDown className="mr-2 h-4 w-4 text-green-600" />
                  Export By Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportOrdersPDF}>
                  <FileDown className="mr-2 h-4 w-4 text-green-600" />
                  Export Orders Report
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* --- Manage Group --- */}
              <DropdownMenuLabel>🎨 Manage</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onAddDesign}>
                  <Layers className="mr-2 h-4 w-4 text-indigo-600" />
                  Add Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAddColor}>
                  <Palette className="mr-2 h-4 w-4 text-green-600" />
                  Add Color
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewTrash}>
                  <Trash2 className="mr-2 h-4 w-4 text-gray-600" />
                  View Trash
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDeleteAll}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  Delete All
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* --- System Group --- */}
              <DropdownMenuLabel>⚙️ System</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

