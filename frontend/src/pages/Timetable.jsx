import React, { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2, Sparkles, AlertTriangle, Clock, User, MapPin,
  Calendar as CalendarIcon, LayoutDashboard, BookOpen,
  Users as UsersIcon, Home as HomeIcon, Bell,
  Eye, CheckCircle2, ChevronLeft, ChevronRight, X,
} from "lucide-react"

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const TIME_SLOTS = [
  "09:00-10:00", "10:00-11:00", "11:15-12:15", "12:15-13:15",
  "14:15-15:15", "15:15-16:15", "16:30-17:30",
]

// Color per course type
const TYPE_CELL = {
  lecture:  { bg: "#dbeafe", border: "#bfdbfe", title: "#1e3a8a", meta: "#1e40af" },
  lab:      { bg: "#dcfce7", border: "#bbf7d0", title: "#14532d", meta: "#166534" },
  tutorial: { bg: "#ede9fe", border: "#ddd6fe", title: "#4c1d95", meta: "#5b21b6" },
  default:  { bg: "#fef3c7", border: "#fde68a", title: "#78350f", meta: "#92400e" },
}

function TimetableGrid({ timetable, courses, faculty, rooms }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  const getEntry = (day, slot) => {
    if (!timetable?.schedule) return null
    return timetable.schedule.find(
      (e) => e.day.toLowerCase() === day.toLowerCase() && `${e.startTime}-${e.endTime}` === slot
    ) || null
  }

  const findCourse  = (id) => courses.find((c) => c._id === id) || null
  const findFaculty = (id) => faculty.find((f) => f._id === id) || null
  const findRoom    = (id) => rooms.find((r)   => r._id === id) || null

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}>
      {/* Card header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
        <div>
          <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>{timetable.name}</h2>
          <p className="text-xs mt-0.5" style={{ color: "#7a5c50" }}>
            {timetable.department} • Semester {timetable.semester} • {timetable.year}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={
              timetable.status === "published"
                ? { background: "#dcfce7", color: "#14532d" }
                : { background: "#f5ede8", color: "#7a5c50" }
            }
          >
            {timetable.status.toUpperCase()}
          </span>
          {timetable.conflicts?.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#ffe4e6", color: "#881337" }}>
              {timetable.conflicts.length} conflicts
            </span>
          )}
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${DAYS.length}, 1fr)`, gap: 6, minWidth: 900 }}>
          {/* Header row */}
          <div className="rounded-lg p-3 text-center text-xs font-medium" style={{ background: "#3d2c2c", color: "#f5ede8" }}>
            Time Slot
          </div>
          {DAYS.map((d) => (
            <div key={d} className="rounded-lg p-3 text-center text-xs font-medium" style={{ background: "#f5ede8", color: "#2c1810" }}>
              {d}
            </div>
          ))}

          {/* Rows */}
          {TIME_SLOTS.map((slot) => (
            <React.Fragment key={slot}>
              <div className="flex items-center justify-center p-2 rounded-lg text-xs font-medium" style={{ background: "#fdfaf8", border: "0.5px solid #eeddd6", color: "#7a5c50" }}>
                <Clock style={{ width: 10, height: 10, marginRight: 4 }} />{slot}
              </div>
              {DAYS.map((day) => {
                const entry   = getEntry(day, slot)
                const cellKey = `${day}-${slot}`
                if (!entry) {
                  return (
                    <div
                      key={cellKey}
                      style={{ minHeight: 90, borderRadius: 8, border: "1px dashed #eeddd6", background: "#fdfaf8" }}
                    />
                  )
                }
                const course  = findCourse(entry.courseId)
                const prof    = findFaculty(entry.facultyId)
                const room    = findRoom(entry.roomId)
                const c       = TYPE_CELL[course?.type] || TYPE_CELL.default
                const isHover = hoveredCell === cellKey
                return (
                  <div
                    key={cellKey}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      minHeight: 90, borderRadius: 8, padding: "10px 10px",
                      background: c.bg, border: `0.5px solid ${isHover ? c.meta : c.border}`,
                      transition: "border-color 0.15s, transform 0.15s",
                      transform: isHover ? "scale(1.01)" : "scale(1)",
                      cursor: "default",
                    }}
                  >
                    <div className="font-medium text-xs leading-tight mb-2 line-clamp-2" style={{ color: c.title }}>
                      {course ? course.name : "Unknown Course"}
                    </div>
                    <div className="space-y-0.5" style={{ fontSize: 10 }}>
                      <div className="flex items-center gap-1" style={{ color: c.meta }}>
                        <User style={{ width: 9, height: 9 }} />{prof?.name || "—"}
                      </div>
                      <div className="flex items-center gap-1" style={{ color: c.meta }}>
                        <MapPin style={{ width: 9, height: 9 }} />{room?.name || "—"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Conflicts */}
        {timetable.conflicts?.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#881337" }}>
              Scheduling Conflicts
            </p>
            {timetable.conflicts.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "#ffe4e6", border: "0.5px solid #fecdd3" }}>
                <AlertTriangle style={{ width: 14, height: 14, color: "#881337", marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: "#881337" }}>{(c.type || "ERROR").replace("_", " ")}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9f1239" }}>{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TimetablePage() {
  const [timetables, setTimetables]     = useState([])
  const [selected, setSelected]         = useState(null)
  const [loadingList, setLoadingList]   = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [generating, setGenerating]     = useState(false)
  const [courses, setCourses]           = useState([])
  const [faculty, setFaculty]           = useState([])
  const [rooms, setRooms]               = useState([])
  const [error, setError]               = useState(null)
  const [activeNavItem]                 = useState("timetables")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [form, setForm] = useState({ department: "Computer Science", semester: "1", academicYear: 2026, constraintsText: "" })

  const navigationItems = [
    { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard, path: "/" },
    { id: "courses",       label: "Courses",       icon: BookOpen,        path: "/courses" },
    { id: "faculty",       label: "Faculty",       icon: UsersIcon,       path: "/faculty" },
    { id: "rooms",         label: "Rooms",         icon: HomeIcon,        path: "/rooms" },
    { id: "timetables",    label: "Timetables",    icon: CalendarIcon,    path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell,            path: "/notifications" },
  ]

  useEffect(() => { fetchTimetables(); fetchSupportingData() }, [])

  async function fetchTimetables() {
    setLoadingList(true)
    try {
      const res = await api.get("/timetables")
      setTimetables(Array.isArray(res.data) ? res.data : [])
    } catch { setError("Failed to load records from database.") }
    finally { setLoadingList(false) }
  }

  async function fetchSupportingData() {
    try {
      const [c, f, r] = await Promise.all([api.get("/courses"), api.get("/faculty"), api.get("/rooms")])
      setCourses(c.data); setFaculty(f.data); setRooms(r.data)
    } catch (err) { console.error(err) }
  }

  async function viewTimetable(id) {
    setLoadingDetail(true)
    try {
      const res = await api.get(`/timetables/${id}`)
      setSelected(res.data)
    } catch { setError("Error fetching timetable details.") }
    finally { setLoadingDetail(false) }
  }

  async function generateTimetable(e) {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    try {
      const payload = { ...form, semester: Number(form.semester), academicYear: Number(form.academicYear) }
      const res = await api.post("/timetables/generate", payload)
      await fetchTimetables()
      await viewTimetable(res.data._id)
    } catch { setError("Generation failed. Check constraints and try again.") }
    finally { setGenerating(false) }
  }

  async function togglePublish(t) {
    try {
      const status = t.status === "published" ? "draft" : "published"
      await api.put(`/timetables/${t._id}`, { ...t, status })
      fetchTimetables()
      if (selected?._id === t._id) viewTimetable(t._id)
    } catch (err) { console.error(err) }
  }

  async function deleteTimetable(t) {
    if (!confirm("Delete this timetable permanently?")) return
    try {
      await api.delete(`/timetables/${t._id}`)
      fetchTimetables()
      if (selected?._id === t._id) setSelected(null)
    } catch (err) { console.error(err) }
  }

  return (
    <>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>

        {/* ── SIDEBAR ── */}
        <div
          className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{ width: isSidebarCollapsed ? "60px" : "240px", background: "#3d2c2c", minHeight: "100vh", position: "sticky", top: 0, height: "100vh" }}
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
                <Link key={item.id} to={item.path} style={{ textDecoration: "none" }}>
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
          <div className="p-6 space-y-5 max-w-7xl mx-auto">

            {/* Header */}
            <div>
              <h1 className="text-xl font-medium" style={{ color: "#2c1810" }}>Academic Timetables</h1>
              <p className="text-sm mt-1" style={{ color: "#7a5c50" }}>Automated scheduling and conflict management system.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ background: "#ffe4e6", border: "0.5px solid #fecdd3", color: "#881337" }}>
                <AlertTriangle style={{ width: 15, height: 15 }} /> {error}
                <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#881337" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total",     value: timetables.length,                                              bg: "#dbeafe", lc: "#1e40af", vc: "#1e3a8a" },
                { label: "Published", value: timetables.filter((t) => t.status === "published").length,      bg: "#dcfce7", lc: "#166534", vc: "#14532d" },
                { label: "Drafts",    value: timetables.filter((t) => t.status !== "published").length,      bg: "#fef3c7", lc: "#92400e", vc: "#78350f" },
                { label: "Conflicts", value: timetables.reduce((a, t) => a + (t.conflicts?.length || 0), 0), bg: "#ffe4e6", lc: "#9f1239", vc: "#881337" },
              ].map(({ label, value, bg, lc, vc }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: bg }}>
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: lc }}>{label}</p>
                  <p className="text-2xl font-medium" style={{ color: vc }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

              {/* ── LEFT COLUMN ── */}
              <div className="xl:col-span-4 space-y-5">

                {/* Generate form */}
                <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}>
                  <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: "#ede9fe" }}>
                      <Sparkles style={{ width: 14, height: 14, color: "#5b21b6" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>New Generation Request</h2>
                      <p className="text-xs" style={{ color: "#7a5c50" }}>AI-powered scheduling engine</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <form onSubmit={generateTimetable} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Department</label>
                          <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required style={{ borderColor: "#d9c4ba", fontSize: 13 }} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Semester</label>
                          <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                            <SelectTrigger style={{ borderColor: "#d9c4ba", fontSize: 13 }}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Constraints & Notes</label>
                        <Textarea
                          value={form.constraintsText}
                          onChange={(e) => setForm({ ...form, constraintsText: e.target.value })}
                          placeholder="e.g. No labs on Mondays, prefer morning slots for Math"
                          rows={3}
                          style={{ borderColor: "#d9c4ba", fontSize: 13 }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={generating}
                        className="w-full text-sm rounded-lg py-2.5 text-white font-medium flex items-center justify-center gap-2"
                        style={{ background: generating ? "#d9a47c" : "#bf8b5e", border: "none", cursor: generating ? "not-allowed" : "pointer" }}
                      >
                        <Sparkles style={{ width: 14, height: 14 }} />
                        {generating ? "Processing…" : "Execute AI Generator"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* History log */}
                <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}>
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                    <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>History Log</h2>
                    <p className="text-xs" style={{ color: "#7a5c50" }}>{timetables.length} timetable{timetables.length !== 1 ? "s" : ""} generated</p>
                  </div>
                  {loadingList ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-8 h-8 rounded-full animate-spin mx-auto" style={{ border: "3px solid #eeddd6", borderTopColor: "#bf8b5e" }} />
                      <p className="text-xs" style={{ color: "#7a5c50" }}>Loading…</p>
                    </div>
                  ) : timetables.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-sm" style={{ color: "#7a5c50" }}>No timetables yet. Generate one above.</p>
                    </div>
                  ) : (
                    <div>
                      {timetables.map((t, idx) => (
                        <div
                          key={t._id}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom: idx < timetables.length - 1 ? "0.5px solid #f5ede8" : "none",
                            background: selected?._id === t._id ? "#fdfaf8" : "#fff",
                            borderLeft: selected?._id === t._id ? "3px solid #bf8b5e" : "3px solid transparent",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) => { if (selected?._id !== t._id) e.currentTarget.style.background = "#fdfaf8" }}
                          onMouseLeave={(e) => { if (selected?._id !== t._id) e.currentTarget.style.background = "#fff" }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#2c1810" }}>{t.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#7a5c50" }}>
                              {t.department} • Sem {t.semester}
                              {t.conflicts?.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: "#ffe4e6", color: "#881337" }}>
                                  {t.conflicts.length} conflict{t.conflicts.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => viewTimetable(t._id)}
                              className="flex items-center justify-center rounded-lg"
                              style={{ width: 28, height: 28, background: "#dbeafe", border: "none", cursor: "pointer" }}
                              title="View"
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#bfdbfe")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#dbeafe")}
                            >
                              <Eye style={{ width: 13, height: 13, color: "#1e3a8a" }} />
                            </button>
                            <button
                              onClick={() => togglePublish(t)}
                              className="flex items-center justify-center rounded-lg"
                              style={{ width: 28, height: 28, background: t.status === "published" ? "#dcfce7" : "#f5ede8", border: "none", cursor: "pointer" }}
                              title={t.status === "published" ? "Unpublish" : "Publish"}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              <CheckCircle2 style={{ width: 13, height: 13, color: t.status === "published" ? "#14532d" : "#7a5c50" }} />
                            </button>
                            <button
                              onClick={() => deleteTimetable(t)}
                              className="flex items-center justify-center rounded-lg"
                              style={{ width: 28, height: 28, background: "#ffe4e6", border: "none", cursor: "pointer" }}
                              title="Delete"
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#fecdd3")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffe4e6")}
                            >
                              <Trash2 style={{ width: 13, height: 13, color: "#881337" }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN: Grid ── */}
              <div className="xl:col-span-8">
                {loadingDetail ? (
                  <div className="rounded-xl flex flex-col items-center justify-center" style={{ height: 560, background: "#fff", border: "0.5px solid #e5d5cb" }}>
                    <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: "3px solid #eeddd6", borderTopColor: "#bf8b5e" }} />
                    <p className="text-sm" style={{ color: "#7a5c50" }}>Reconstructing grid view…</p>
                  </div>
                ) : selected ? (
                  <TimetableGrid timetable={selected} courses={courses} faculty={faculty} rooms={rooms} />
                ) : (
                  <div
                    className="rounded-xl flex flex-col items-center justify-center text-center"
                    style={{ height: 560, border: "2px dashed #eeddd6", background: "#fdfaf8", padding: 40 }}
                  >
                    <div className="flex items-center justify-center rounded-full mb-4" style={{ width: 60, height: 60, background: "#f5ede8" }}>
                      <CalendarIcon style={{ width: 26, height: 26, color: "#bf8b5e" }} />
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: "#2c1810" }}>No timetable selected</p>
                    <p className="text-xs" style={{ color: "#7a5c50" }}>
                      Select an entry from the history log to preview the full academic grid.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
