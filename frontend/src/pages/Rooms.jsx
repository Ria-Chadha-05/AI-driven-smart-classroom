import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/Data-table"
import {
  Plus, Building, Users, Calendar, LayoutDashboard, BookOpen,
  Home, Bell, Edit, X, Clock, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function RoomPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("rooms")
  const [editingRoom, setEditingRoom] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState("asc")
  const [typeFilter, setTypeFilter] = useState("all")
  const [hoveredRow, setHoveredRow] = useState(null)

  const [formData, setFormData] = useState({
    name: "", building: "", floor: "", capacity: "", type: "", equipment: "",
    availability: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
  })
  const [newTimeSlot, setNewTimeSlot] = useState({ day: "monday", start: "", end: "" })

  const navigationItems = [
    { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard, path: "/" },
    { id: "courses",       label: "Courses",       icon: BookOpen,        path: "/courses" },
    { id: "faculty",       label: "Faculty",       icon: Users,           path: "/faculty" },
    { id: "rooms",         label: "Rooms",         icon: Home,            path: "/rooms" },
    { id: "timetables",    label: "Timetables",    icon: Calendar,        path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell,            path: "/notifications" },
  ]

  const roomTypes = [
    { value: "lecture_hall", label: "Lecture Hall" },
    { value: "lab",          label: "Laboratory" },
    { value: "seminar_room", label: "Seminar Room" },
    { value: "auditorium",   label: "Auditorium" },
  ]

  const typeColors = {
    lecture_hall: { bg: "#dbeafe", color: "#1e3a8a", border: "#bfdbfe" },
    lab:          { bg: "#dcfce7", color: "#14532d", border: "#bbf7d0" },
    seminar_room: { bg: "#ede9fe", color: "#4c1d95", border: "#ddd6fe" },
    auditorium:   { bg: "#fef3c7", color: "#78350f", border: "#fde68a" },
  }

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const resetForm = () => {
    setFormData({
      name: "", building: "", floor: "", capacity: "", type: "", equipment: "",
      availability: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
    })
    setEditingRoom(null)
  }

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5001/api/rooms")
      setRooms(res.data)
    } catch (error) { console.error("Error fetching rooms:", error) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRooms() }, [])

  const handleEditRoom = (room) => {
    setFormData({
      name: room.name || "", building: room.building || "",
      floor: room.floor?.toString() || "", capacity: room.capacity?.toString() || "",
      type: room.type || "", equipment: room.equipment?.join(", ") || "",
      availability: room.availability || { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
    })
    setEditingRoom(room)
    setShowForm(true)
  }

  const handleSubmitRoom = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        floor: Number(formData.floor),
        equipment: formData.equipment ? formData.equipment.split(",").map((e) => e.trim()).filter(Boolean) : [],
      }
      if (editingRoom) {
        await axios.put(`http://localhost:5001/api/rooms/${editingRoom._id}`, payload)
      } else {
        await axios.post("http://localhost:5001/api/rooms", payload)
      }
      resetForm(); setShowForm(false); fetchRooms()
    } catch (error) { console.error("Error saving room:", error) }
    finally { setFormLoading(false) }
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return
    try {
      await axios.delete(`http://localhost:5001/api/rooms/${id}`)
      fetchRooms()
    } catch (error) { console.error("Error deleting room:", error) }
  }

  const addTimeSlot = () => {
    if (!newTimeSlot.start || !newTimeSlot.end) return
    setFormData((prev) => ({
      ...prev,
      availability: { ...prev.availability, [newTimeSlot.day]: [...prev.availability[newTimeSlot.day], { start: newTimeSlot.start, end: newTimeSlot.end }] },
    }))
    setNewTimeSlot({ day: newTimeSlot.day, start: "", end: "" })
  }

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => ({
      ...prev,
      availability: { ...prev.availability, [day]: prev.availability[day].filter((_, i) => i !== index) },
    }))
  }

  // Sort + filter
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  const processedRooms = [...rooms]
    .filter((r) => typeFilter === "all" || r.type === typeFilter)
    .sort((a, b) => {
      if (!sortKey) return 0
      const va = (a[sortKey] || "").toString().toLowerCase()
      const vb = (b[sortKey] || "").toString().toLowerCase()
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const sortableFields = [
    { key: "name",     label: "Room Name" },
    { key: "building", label: "Building" },
    { key: "capacity", label: "Capacity" },
  ]

  const columns = [
    {
      key: "name",
      label: "Room Details",
      render: (room) => (
        <div className="space-y-0.5">
          <div className="font-medium text-sm" style={{ color: "#2c1810" }}>{room.name}</div>
          <div className="text-xs" style={{ color: "#7a5c50" }}>{room.building}, Floor {room.floor}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (room) => {
        const c = typeColors[room.type] || { bg: "#f5ede8", color: "#7a5c50", border: "#eeddd6" }
        return (
          <span className="px-2 py-1 rounded-md text-xs font-medium" style={{ background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}>
            {room.type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        )
      },
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (room) => (
        <div className="flex items-center gap-1.5">
          <Users style={{ width: 12, height: 12, color: "#bf8b5e" }} />
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#ffedd5", color: "#7c2d12" }}>
            {room.capacity}
          </span>
        </div>
      ),
    },
    {
      key: "equipment",
      label: "Equipment",
      render: (room) => (
        <div className="flex flex-wrap gap-1 max-w-36">
          {room.equipment?.slice(0, 2).map((eq, i) => (
            <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: "#ccfbf1", color: "#134e4a", border: "0.5px solid #99f6e4" }}>
              {eq}
            </span>
          ))}
          {room.equipment?.length > 2 && (
            <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#f5ede8", color: "#7a5c50" }}>
              +{room.equipment.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (room) => (
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "#fff", border: "0.5px solid #d9c4ba", color: "#bf8b5e", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            onClick={() => handleEditRoom(room)}
          >
            <Edit style={{ width: 11, height: 11 }} /> Edit
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "#fff", border: "0.5px solid #fecdd3", color: "#881337", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe4e6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            onClick={() => handleDeleteRoom(room._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  if (loading && rooms.length === 0) {
    return (
      <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>
        <div style={{ width: 240, background: "#3d2c2c", minHeight: "100vh" }}>
          <div className="p-4 space-y-3">
            {[...Array(7)].map((_, i) => <div key={i} className="h-10 rounded animate-pulse" style={{ background: "#5a3d3d" }} />)}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full animate-spin mx-auto" style={{ border: "3px solid #eeddd6", borderTopColor: "#bf8b5e" }} />
            <p className="text-sm" style={{ color: "#7a5c50" }}>Loading facilities…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>

        {/* ── SIDEBAR ── */}
        <div
          className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{ width: isSidebarCollapsed ? "60px" : "240px", background: "#3d2c2c", minHeight: "100vh" }}
        >
          <div className="flex items-center gap-3 px-3 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", minHeight: "58px" }}>
            <div className="flex-shrink-0 flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: "#bf8b5e" }}>
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
              style={{ width: 26, height: 26, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, flexShrink: 0, marginLeft: isSidebarCollapsed ? "auto" : undefined }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {isSidebarCollapsed
                ? <ChevronRight style={{ width: 16, height: 16, color: "rgba(245,237,232,0.5)" }} />
                : <ChevronLeft  style={{ width: 16, height: 16, color: "rgba(245,237,232,0.5)" }} />}
            </button>
          </div>
          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeNavItem === item.id
              return (
                <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)} style={{ textDecoration: "none" }}>
                  <div
                    className="flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer"
                    style={{ padding: isSidebarCollapsed ? "9px 0" : "9px 10px", justifyContent: isSidebarCollapsed ? "center" : undefined, background: isActive ? "#bf8b5e" : "transparent", marginBottom: "2px" }}
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

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-medium" style={{ color: "#2c1810" }}>Room Management</h1>
                <p className="text-sm mt-1" style={{ color: "#7a5c50" }}>Configure classrooms, laboratories, and equipment availability.</p>
              </div>
              <button
                onClick={() => { resetForm(); setShowForm(!showForm) }}
                className="flex items-center gap-2 text-sm rounded-lg px-4 py-2 text-white"
                style={{ background: "#bf8b5e", border: "none", cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Plus style={{ width: 15, height: 15 }} /> Add New Room
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Rooms",   value: rooms.length,                                              bg: "#dbeafe", lc: "#1e40af", vc: "#1e3a8a" },
                { label: "Lecture Halls", value: rooms.filter((r) => r.type === "lecture_hall").length,     bg: "#dbeafe", lc: "#1e40af", vc: "#1e3a8a" },
                { label: "Labs",          value: rooms.filter((r) => r.type === "lab").length,              bg: "#dcfce7", lc: "#166534", vc: "#14532d" },
                { label: "Avg Capacity",  value: rooms.length ? Math.round(rooms.reduce((a, r) => a + (r.capacity || 0), 0) / rooms.length) : 0, bg: "#fef3c7", lc: "#92400e", vc: "#78350f" },
              ].map(({ label, value, bg, lc, vc }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: bg }}>
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: lc }}>{label}</p>
                  <p className="text-2xl font-medium" style={{ color: vc }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Sort + filter bar */}
            <div className="rounded-xl p-3 flex flex-wrap items-center gap-4" style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: "#7a5c50" }}>Sort:</span>
                {sortableFields.map(({ key, label }) => {
                  const isActive = sortKey === key
                  return (
                    <button
                      key={key}
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: isActive ? "#bf8b5e" : "#fdfaf8", color: isActive ? "#fff" : "#6b3d2e", border: isActive ? "none" : "0.5px solid #eeddd6", cursor: "pointer", fontWeight: isActive ? 500 : 400 }}
                    >
                      {label}
                      {isActive
                        ? sortDir === "asc" ? <ArrowUp style={{ width: 11, height: 11 }} /> : <ArrowDown style={{ width: 11, height: 11 }} />
                        : <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.4 }} />}
                    </button>
                  )
                })}
                {sortKey && (
                  <button onClick={() => { setSortKey(null); setSortDir("asc") }} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: "#ffe4e6", color: "#881337", border: "none", cursor: "pointer" }}>
                    Clear
                  </button>
                )}
              </div>
              <div style={{ width: 1, height: 24, background: "#eeddd6" }} />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium" style={{ color: "#7a5c50" }}>Type:</span>
                {["all", ...roomTypes.map((r) => r.value)].map((t) => {
                  const isActive = typeFilter === t
                  const c = typeColors[t]
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className="text-xs px-3 py-1.5 rounded-lg capitalize"
                      style={{
                        background: isActive ? (c ? c.bg : "#3d2c2c") : "#fdfaf8",
                        color: isActive ? (c ? c.color : "#f5ede8") : "#6b3d2e",
                        border: isActive ? (c ? `0.5px solid ${c.border}` : "none") : "0.5px solid #eeddd6",
                        fontWeight: isActive ? 500 : 400, cursor: "pointer",
                      }}
                    >
                      {t === "all" ? "All Types" : t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid #e5d5cb", animation: "slideDown 0.22s ease-out" }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                  <div>
                    <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>{editingRoom ? "Update Facility Details" : "Register New Facility"}</h2>
                    <p className="text-xs mt-0.5" style={{ color: "#7a5c50" }}>Define spatial capacity and equipment specifications.</p>
                  </div>
                  <button onClick={() => { resetForm(); setShowForm(false) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a5c50" }}>
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <div className="p-5">
                  <form onSubmit={handleSubmitRoom} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Room Designation *</Label>
                        <Input placeholder="e.g. Room A101" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ borderColor: "#d9c4ba", fontSize: 13 }} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Building / Wing *</Label>
                        <Input placeholder="e.g. Science Block" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} required style={{ borderColor: "#d9c4ba", fontSize: 13 }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Floor Level *</Label>
                        <Input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} required style={{ borderColor: "#d9c4ba", fontSize: 13 }} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Seating Capacity *</Label>
                        <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required style={{ borderColor: "#d9c4ba", fontSize: 13 }} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Facility Type *</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                          <SelectTrigger style={{ borderColor: "#d9c4ba", fontSize: 13 }}><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Inventory & Equipment</Label>
                      <Textarea placeholder="e.g. Projector, Smart Board, Workstations" rows={2} value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} style={{ borderColor: "#d9c4ba", fontSize: 13 }} />
                    </div>

                    {/* Availability */}
                    <div className="pt-3" style={{ borderTop: "1px solid #f5ede8" }}>
                      <p className="text-xs font-medium mb-3" style={{ color: "#7a5c50" }}>Scheduling Availability</p>
                      <div className="rounded-lg p-3 mb-3" style={{ background: "#fdfaf8", border: "0.5px solid #eeddd6" }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div className="space-y-1">
                            <Label className="text-xs" style={{ color: "#7a5c50" }}>Day</Label>
                            <Select value={newTimeSlot.day} onValueChange={(v) => setNewTimeSlot({ ...newTimeSlot, day: v })}>
                              <SelectTrigger style={{ borderColor: "#d9c4ba", fontSize: 13, background: "#fff" }}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {weekDays.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs" style={{ color: "#7a5c50" }}>Start</Label>
                            <Input type="time" value={newTimeSlot.start} onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })} style={{ borderColor: "#d9c4ba", fontSize: 13, background: "#fff" }} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs" style={{ color: "#7a5c50" }}>End</Label>
                            <Input type="time" value={newTimeSlot.end} onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })} style={{ borderColor: "#d9c4ba", fontSize: 13, background: "#fff" }} />
                          </div>
                          <button type="button" onClick={addTimeSlot} className="text-sm rounded-lg py-2 text-white" style={{ background: "#bf8b5e", border: "none", cursor: "pointer" }}>
                            Add Slot
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {weekDays.map((day) => formData.availability[day]?.length > 0 && (
                          <div key={day} className="flex items-center gap-3 p-2 rounded-md" style={{ background: "#fdfaf8", border: "0.5px solid #eeddd6" }}>
                            <span className="w-24 text-xs font-medium capitalize" style={{ color: "#bf8b5e" }}>{day}:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.availability[day].map((slot, i) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: "#dbeafe", color: "#1e3a8a", border: "0.5px solid #bfdbfe" }}>
                                  <Clock style={{ width: 10, height: 10 }} /> {slot.start}–{slot.end}
                                  <button type="button" onClick={() => removeTimeSlot(day, i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#881337", display: "flex", alignItems: "center" }}>
                                    <X style={{ width: 10, height: 10 }} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={formLoading} className="text-sm px-6 py-2 rounded-lg text-white" style={{ background: formLoading ? "#d9a47c" : "#bf8b5e", border: "none", cursor: formLoading ? "not-allowed" : "pointer", fontWeight: 500 }}>
                        {formLoading ? "Saving…" : editingRoom ? "Update Room" : "Save Room"}
                      </button>
                      <button type="button" onClick={() => { resetForm(); setShowForm(false) }} className="text-sm px-4 py-2 rounded-lg" style={{ background: "#fdfaf8", border: "0.5px solid #eeddd6", color: "#7a5c50", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: "#ccfbf1" }}>
                  <Building style={{ width: 15, height: 15, color: "#115e59" }} />
                </div>
                <div>
                  <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>Campus Facilities</h2>
                  <p className="text-xs" style={{ color: "#7a5c50" }}>
                    Showing {processedRooms.length} of {rooms.length} rooms
                    {typeFilter !== "all" && <span> — <strong style={{ color: "#bf8b5e" }}>{typeFilter.replace("_", " ")}</strong></span>}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "0.5px solid #eeddd6", background: "#fdfaf8" }}>
                      {columns.map((col) => (
                        <th key={col.key} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "#7a5c50" }}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processedRooms.length === 0 ? (
                      <tr><td colSpan={columns.length} className="text-center py-12 text-sm" style={{ color: "#7a5c50" }}>No rooms match the current filter.</td></tr>
                    ) : processedRooms.map((room, idx) => (
                      <tr
                        key={room._id || idx}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom: "0.5px solid #f5ede8", background: hoveredRow === idx ? "#fdfaf8" : "#fff", transition: "background 0.12s" }}
                      >
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-3 align-middle">{col.render(room)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
