"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn, normalizeText } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface SearchableSelectItem {
  value: string
  label: string
}

interface SearchableSelectProps {
  value?: string
  onValueChange: (value: string) => void
  items: SearchableSelectItem[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  onCreateNew?: (searchTerm: string) => void
  createNewLabel?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  items,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  disabled = false,
  className,
  onCreateNew,
  createNewLabel = "Crear",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return items
    const normalizedSearch = normalizeText(searchTerm)
    return items.filter((item) =>
      normalizeText(item.label).includes(normalizedSearch)
    )
  }, [items, searchTerm])

  const selectedItem = items.find((item) => item.value === value)

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew(searchTerm)
      setOpen(false)
      setSearchTerm("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedItem && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2 relative">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pr-9"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 md:h-7 md:w-7"
              onClick={() => setSearchTerm("")}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[280px]">
          <div className="p-1">
            {filteredItems.length === 0 ? (
              <div className="py-3 px-2 text-center">
                <p className="text-sm text-muted-foreground mb-2">{emptyMessage}</p>
                {onCreateNew && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-dashed"
                    onClick={handleCreateNew}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {createNewLabel}{searchTerm ? ` "${searchTerm}"` : ""}
                  </Button>
                )}
              </div>
            ) : (
              <>
                {filteredItems.map((item) => (
                  <div
                    key={item.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value === item.value && "bg-accent"
                    )}
                    onClick={() => {
                      onValueChange(item.value)
                      setOpen(false)
                      setSearchTerm("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </div>
                ))}
                {onCreateNew && searchTerm && (
                  <div className="border-t mt-1 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs justify-start text-muted-foreground hover:text-foreground"
                      onClick={handleCreateNew}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {createNewLabel} "{searchTerm}"
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
