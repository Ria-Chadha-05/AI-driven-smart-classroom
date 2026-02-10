import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DataTable({ data, columns, searchKey, loading = false, onEdit, onDelete, onView }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  const filteredData = data.filter((item) => {
    if (!searchTerm || !searchKey) return true
    const value = item[searchKey]
    return String(value).toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSort = (column) => {
    if (sortColumn === column) setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = String(a[sortColumn] || "")
    const bValue = String(b[sortColumn] || "")
    return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-slate-200 animate-pulse rounded-lg border border-slate-200" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg border border-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          {/* Swapped cyan for slate-400 */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Changed bg-slate-800 to white/slate and focus to blue-900
            className="pl-12 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 rounded-lg transition-all"
          />
        </div>
        <Button
          variant="outline"
          className="h-12 px-6 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-900 rounded-lg transition-all"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50 border-b border-slate-200">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  // Changed text-cyan-300 to text-slate-900 (Navy feel)
                  className={`text-slate-900 font-bold py-4 px-6 uppercase text-xs tracking-wider ${
                    column.sortable ? "cursor-pointer hover:text-blue-900 transition-colors" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-blue-900 font-bold">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableHead className="w-[100px] text-slate-900 font-bold py-4 px-6 uppercase text-xs tracking-wider text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-20 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-10 h-10 text-slate-200" />
                    <p className="text-lg font-medium">No results found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b border-slate-100 hover:bg-slate-50/80 transition-all group"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className="py-4 px-6 text-slate-600 text-sm font-medium"
                    >
                      {column.render ? column.render(item) : String(item[column.key] || "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white border-slate-200 text-slate-700 shadow-xl rounded-md w-40"
                        >
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer">
                              View Details
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                              Edit Entry
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          Entries: <span className="text-slate-900">{sortedData.length}</span> / {data.length}
        </div>
      </div>
    </div>
  )
}