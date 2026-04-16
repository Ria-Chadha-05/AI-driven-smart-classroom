import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FacultyForm } from "@/components/Faculty-Form"
import { DataTable } from "@/components/Data-table"
import {
  Plus, Users, Mail, Clock, Calendar,
  LayoutDashboard, BookOpen, Home, Bell,
  ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("faculty")
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Sort & filter state
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState("asc")
  const [deptFilter, setDeptFilter] = useState("all")
  const [hoveredRow, setHoveredRow] = useState(null)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses",   label: "Courses",   icon: BookOpen,       path: "/courses" },
    { id: "faculty",   label: "Faculty",   icon: Users,          path: "/faculty" },
    { id: "rooms",     label: "Rooms",     icon: Home,           path: "/rooms" },
    { id: "timetables",label: "Timetables",icon: Calendar,       path: "/timetables" },
    { id: "notifications",label:"Notifications",icon:Bell,       path: "/notifications" },
  ]

  const fetchFaculty = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/api/faculty")
      setFaculty(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error(error)
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFaculty() }, [])

  const handleCreateFaculty = async (data) => {
    setFormLoading(true)
    try {
      if (editingFaculty) {
        await axios.put(`/api/faculty/${editingFaculty._id}`, data)
      } else {
        await axios.post("/api/faculty", data)
      }
      setShowForm(false)
      setEditingFaculty(null)
      fetchFaculty()
    } catch (error) {
      console.error(error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (f) => {
    try {
      await axios.delete(`/api/faculty/${f._id}`)
      if (editingFaculty && editingFaculty._id === f._id) {
        setEditingFaculty(null)
        setShowForm(false)
      }
      fetchFaculty()
    } catch (error) {
      console.error(error)
    }
  }

  // ── Derived data ──
  const departments = ["all", ...Array.from(new Set(faculty.map((f) => f.department).filter(Boolean)))]

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  const processedFaculty = [...faculty]
    .filter((f) => deptFilter === "all" || f.department === deptFilter)
    .sort((a, b) => {
      if (!sortKey) return 0
      const va = (a[sortKey] || "").toString().toLowerCase()
      const vb = (b[sortKey] || "").toString().toLowerCase()
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const sortableFields = [
    { key: "name",        label: "Name" },
    { key: "department",  label: "Department" },
    { key: "designation", label: "Designation" },
  ]

  // dept → color map for pills
  const deptColors = [
    { bg: "#dbeafe", color: "#1e3a8a", border: "#bfdbfe" },
    { bg: "#dcfce7", color: "#14532d", border: "#bbf7d0" },
    { bg: "#ede9fe", color: "#4c1d95", border: "#ddd6fe" },
    { bg: "#fef3c7", color: "#78350f", border: "#fde68a" },
    { bg: "#ccfbf1", color: "#134e4a", border: "#99f6e4" },
    { bg: "#ffe4e6", color: "#881337", border: "#fecdd3" },
    { bg: "#ffedd5", color: "#7c2d12", border: "#fed7aa" },
  ]
  const deptColorMap = {}
  Array.from(new Set(faculty.map((f) => f.department).filter(Boolean))).forEach((d, i) => {
    deptColorMap[d] = deptColors[i % deptColors.length]
  })

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (f) => (
        <div className="space-y-1">
          <div className="font-medium" style={{ color: "#2c1810", fontSize: 13 }}>{f.name}</div>
          <div className="flex items-center gap-1.5" style={{ color: "#7a5c50", fontSize: 11 }}>
            <Mail style={{ width: 11, height: 11 }} />
            {f.email}
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (f) => {
        const c = deptColorMap[f.department] || deptColors[0]
        return (
          <span
            className="px-2 py-1 rounded-md text-xs font-medium"
            style={{ background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}
          >
            {f.department}
          </span>
        )
      },
    },
    {
      key: "designation",
      label: "Designation",
      render: (f) => (
        <span
          className="px-2 py-1 rounded-md text-xs font-medium"
          style={{ background: "#fef3c7", color: "#78350f", border: "0.5px solid #fde68a" }}
        >
          {f.designation || "N/A"}
        </span>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (f) => (
        <div className="flex flex-wrap gap-1">
          {f.specialization?.slice(0, 2).map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: "#ccfbf1", color: "#134e4a", border: "0.5px solid #99f6e4" }}
            >
              {s}
            </span>
          ))}
          {f.specialization?.length > 2 && (
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: "#f5ede8", color: "#7a5c50", border: "0.5px solid #eeddd6" }}
            >
              +{f.specialization.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "maxHoursPerWeek",
      label: "Max Hrs/Week",
      render: (f) => (
        <div className="flex items-center gap-1.5">
          <Clock style={{ width: 12, height: 12, color: "#bf8b5e" }} />
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: "#ffedd5", color: "#7c2d12" }}
          >
            {f.maxHoursPerWeek}h
          </span>
        </div>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      render: (f) => (
        <div className="flex flex-col gap-0.5" style={{ fontSize: 11 }}>
          {Object.entries(f.availability || {}).map(([day, slots]) =>
            slots.length ? (
              <div key={day} style={{ color: "#7a5c50" }}>
                <span style={{ color: "#bf8b5e", fontWeight: 500 }}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}:
                </span>{" "}
                {slots.map((s) => `${s.start}–${s.end}`).join(", ")}
              </div>
            ) : null
          )}
        </div>
      ),
    },
    {
      key: "preferences",
      label: "Preferences",
      render: (f) => (
        <div className="flex flex-col gap-0.5" style={{ fontSize: 11 }}>
          {f.preferences?.preferredTimeSlots?.length > 0 && (
            <div style={{ color: "#7a5c50" }}>
              <span style={{ color: "#166534", fontWeight: 500 }}>Preferred: </span>
              {f.preferences.preferredTimeSlots.join(", ")}
            </div>
          )}
          {f.preferences?.avoidTimeSlots?.length > 0 && (
            <div style={{ color: "#7a5c50" }}>
              <span style={{ color: "#881337", fontWeight: 500 }}>Avoid: </span>
              {f.preferences.avoidTimeSlots.join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (f) => (
        <div className="flex gap-2">
          <button
            className="text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "#fff", border: "0.5px solid #d9c4ba", color: "#bf8b5e", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            onClick={() => { setEditingFaculty(f); setShowForm(true) }}
          >
            Edit
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "#fff", border: "0.5px solid #fecdd3", color: "#881337", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe4e6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            onClick={() => handleDelete(f)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>
        <div style={{ width: 240, background: "#3d2c2c", minHeight: "100vh" }}>
          <div className="p-4 space-y-3">
            <div className="h-8 rounded animate-pulse" style={{ background: "#5a3d3d" }} />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded animate-pulse" style={{ background: "#5a3d3d" }} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div
              className="w-12 h-12 rounded-full animate-spin mx-auto"
              style={{ border: "3px solid #eeddd6", borderTopColor: "#bf8b5e" }}
            />
            <p className="text-sm font-medium" style={{ color: "#7a5c50" }}>
              Loading faculty records…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>

      {/* ── SIDEBAR ── */}
      <div
        className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{ width: isSidebarCollapsed ? "60px" : "240px", background: "#3d2c2c", minHeight: "100vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-3 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", minHeight: "58px" }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 30, height: 30, background: "#bf8b5e" }}
          >
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>S</span>
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: "#f5ede8" }}>Smart Scheduler</p>
              <p className="text-xs truncate" style={{ color: "rgba(245,237,232,0.45)" }}>Academic Admin</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex-shrink-0 flex items-center justify-center rounded-md"
            style={{
              width: 26, height: 26,
              background: "transparent", border: "none", cursor: "pointer",
              marginLeft: isSidebarCollapsed ? "auto" : undefined,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {isSidebarCollapsed
              ? <ChevronRight style={{ width: 16, height: 16, color: "rgba(245,237,232,0.5)" }} />
              : <ChevronLeft  style={{ width: 16, height: 16, color: "rgba(245,237,232,0.5)" }} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNavItem === item.id
            return (
              <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)} style={{ textDecoration: "none" }}>
                <div
                  className="flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer"
                  style={{
                    padding: isSidebarCollapsed ? "9px 0" : "9px 10px",
                    justifyContent: isSidebarCollapsed ? "center" : undefined,
                    background: isActive ? "#bf8b5e" : "transparent",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)" }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon style={{ width: 16, height: 16, flexShrink: 0, color: isActive ? "#fff" : "rgba(245,237,232,0.55)" }} />
                  {!isSidebarCollapsed && (
                    <span className="text-sm truncate" style={{ color: isActive ? "#fff" : "rgba(245,237,232,0.7)", fontWeight: isActive ? 500 : 400 }}>
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── MAIN ── */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-5">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium" style={{ color: "#2c1810" }}>Faculty Management</h1>
              <p className="text-sm mt-1" style={{ color: "#7a5c50" }}>
                Manage academic staff, specializations, and weekly availability.
              </p>
            </div>
            <button
              onClick={() => { setEditingFaculty(null); setShowForm(!showForm) }}
              className="flex items-center gap-2 text-sm rounded-lg px-4 py-2 text-white"
              style={{ background: "#bf8b5e", border: "none", cursor: "pointer", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add Faculty
            </button>
          </div>

          {/* ── STAT MINI CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl p-4" style={{ background: "#dcfce7" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#166534" }}>Total Faculty</p>
              <p className="text-2xl font-medium" style={{ color: "#14532d" }}>{faculty.length}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#dbeafe" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#1e40af" }}>Departments</p>
              <p className="text-2xl font-medium" style={{ color: "#1e3a8a" }}>
                {new Set(faculty.map((f) => f.department).filter(Boolean)).size}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#fef3c7" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#92400e" }}>Avg Hrs/Week</p>
              <p className="text-2xl font-medium" style={{ color: "#78350f" }}>
                {faculty.length
                  ? Math.round(faculty.reduce((a, f) => a + (f.maxHoursPerWeek || 0), 0) / faculty.length)
                  : 0}h
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#ede9fe" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#5b21b6" }}>Showing</p>
              <p className="text-2xl font-medium" style={{ color: "#4c1d95" }}>{processedFaculty.length}</p>
            </div>
          </div>

          {/* ── SORT + FILTER BAR ── */}
          <div
            className="rounded-xl p-3 flex flex-wrap items-center gap-4"
            style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}
          >
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: "#7a5c50" }}>Sort:</span>
              {sortableFields.map(({ key, label }) => {
                const isActive = sortKey === key
                return (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: isActive ? "#bf8b5e" : "#fdfaf8",
                      color: isActive ? "#fff" : "#6b3d2e",
                      border: isActive ? "none" : "0.5px solid #eeddd6",
                      cursor: "pointer",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {label}
                    {isActive
                      ? sortDir === "asc"
                        ? <ArrowUp style={{ width: 11, height: 11 }} />
                        : <ArrowDown style={{ width: 11, height: 11 }} />
                      : <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.4 }} />}
                  </button>
                )
              })}
              {sortKey && (
                <button
                  onClick={() => { setSortKey(null); setSortDir("asc") }}
                  className="text-xs px-2.5 py-1.5 rounded-lg"
                  style={{ background: "#ffe4e6", color: "#881337", border: "none", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: "#eeddd6" }} />

            {/* Department filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium" style={{ color: "#7a5c50" }}>Dept:</span>
              {departments.map((dept) => {
                const isActive = deptFilter === dept
                const c = dept === "all" ? null : deptColorMap[dept]
                return (
                  <button
                    key={dept}
                    onClick={() => setDeptFilter(dept)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all capitalize"
                    style={{
                      background: isActive
                        ? (c ? c.bg : "#3d2c2c")
                        : "#fdfaf8",
                      color: isActive
                        ? (c ? c.color : "#f5ede8")
                        : "#6b3d2e",
                      border: isActive
                        ? (c ? `0.5px solid ${c.border}` : "none")
                        : "0.5px solid #eeddd6",
                      fontWeight: isActive ? 500 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {dept === "all" ? "All Depts" : dept}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── FORM ── */}
          {showForm && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#fff",
                border: "0.5px solid #e5d5cb",
                animation: "slideDown 0.2s ease-out",
              }}
            >
              <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>
                  {editingFaculty ? "Edit Faculty Profile" : "Register New Faculty"}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#7a5c50" }}>
                  Provide accurate contact and availability information.
                </p>
              </div>
              <div className="p-5">
                <FacultyForm initialData={editingFaculty} onSubmit={handleCreateFaculty} loading={formLoading} />
              </div>
            </div>
          )}

          {/* ── TABLE ── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}
            >
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 30, height: 30, background: "#dcfce7" }}
              >
                <Users style={{ width: 15, height: 15, color: "#166534" }} />
              </div>
              <div>
                <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>Staff Directory</h2>
                <p className="text-xs" style={{ color: "#7a5c50" }}>
                  Showing {processedFaculty.length} of {faculty.length} faculty members
                  {deptFilter !== "all" && (
                    <span> — filtered by <strong style={{ color: "#bf8b5e" }}>{deptFilter}</strong></span>
                  )}
                </p>
              </div>
            </div>

            {/* Table with hover row effect */}
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid #eeddd6", background: "#fdfaf8" }}>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{ color: "#7a5c50", letterSpacing: "0.05em" }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedFaculty.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-12" style={{ color: "#7a5c50", fontSize: 13 }}>
                        No faculty members match the current filters.
                      </td>
                    </tr>
                  ) : (
                    processedFaculty.map((f, idx) => (
                      <tr
                        key={f._id || idx}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: "0.5px solid #f5ede8",
                          background: hoveredRow === idx ? "#fdfaf8" : "#fff",
                          transition: "background 0.12s ease",
                        }}
                      >
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-3 align-top">
                            {col.render(f)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
