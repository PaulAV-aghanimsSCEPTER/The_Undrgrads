"use client"

import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import {
  PlusCircle,
  Archive,
  Palette,
  Layers,
  Trash2,
  LogOut,
  Download,
  Menu,
  FileDown,
  Package,
  Settings,
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
  onManageStock: () => void
  onArchiveAll: () => void
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
  onManageStock,
  onArchiveAll,
  onDeleteAll,
  onViewTrash,
  onLogout,
  onExportTotalPDF,
  onExportByDesignPDF,
  onExportOrdersPDF,
  onExportShippingInfo,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 shadow-sm backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative h-10 w-10 shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="absolute inset-0 h-10 w-10 object-contain opacity-100 transition-opacity duration-300 ease-in-out dark:opacity-0"
            />
            <img
              src="/logo1.png"
              alt="Logo"
              className="absolute inset-0 h-10 w-10 object-contain opacity-0 transition-opacity duration-300 ease-in-out dark:opacity-100"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            The Undergrads
          </h1>
        </div>

        {/* Main Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
              <DropdownMenuLabel className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Export
              </DropdownMenuLabel>
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
              <DropdownMenuLabel className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Manage
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onAddDesign}>
                  <Layers className="mr-2 h-4 w-4 text-indigo-600" />
                  Add Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAddColor}>
                  <Palette className="mr-2 h-4 w-4 text-green-600" />
                  Add Color
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onManageStock}>
                  <Package className="mr-2 h-4 w-4 text-blue-600" />
                  Manage Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewTrash}>
                  <Trash2 className="mr-2 h-4 w-4 text-gray-600" />
                  View Trash
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchiveAll}>
                  <Archive className="mr-2 h-4 w-4 text-emerald-600" />
                  Add All Orders to Previous
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDeleteAll}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  Delete All Orders
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* --- System Group --- */}
              <DropdownMenuLabel className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> System
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
