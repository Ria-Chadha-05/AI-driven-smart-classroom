import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus, Users, Calendar, LayoutDashboard, BookOpen, Home, Bell,
  Trash2, AlertTriangle, CheckCircle, Info, Check, Megaphone,
  ChevronLeft, ChevronRight, X,
} from "lucide-react"
import { Link } from "react-router-dom"

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

// Per-type config
const TYPE_CONFIG = {
  error:   { bg: "#ffe4e6", border: "#fecdd3", accent: "#c0392b", iconBg: "#fecdd3", iconColor: "#881337", label: "Error" },
  warning: { bg: "#fef3c7", border: "#fde68a", accent: "#f59e0b", iconBg: "#fde68a", iconColor: "#78350f", label: "Warning" },
  success: { bg: "#dcfce7", border: "#bbf7d0", accent: "#22c55e", iconBg: "#bbf7d0", iconColor: "#14532d", label: "Success" },
  info:    { bg: "#dbeafe", border: "#bfdbfe", accent: "#3b82f6", iconBg: "#bfdbfe", iconColor: "#1e3a8a", label: "Info" },
}

const PRIORITY_CONFIG = {
  high:   { bg: "#ffe4e6", color: "#881337", label: "Urgent" },
  medium: { bg: "#fef3c7", color: "#78350f", label: "Medium" },
  low:    { bg: "#dcfce7", color: "#14532d", label: "Low" },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem] = useState("notifications")
  const [notificationToDelete, setNotificationToDelete] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [justRead, setJustRead] = useState(new Set())   // IDs that were just marked read — for fade animation

  const [formData, setFormData] = useState({ title: "", message: "", type: "info", priority: "low" })
  const resetForm = () => setFormData({ title: "", message: "", type: "info", priority: "low" })

  const navigationItems = [
    { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard, path: "/" },
    { id: "courses",       label: "Courses",       icon: BookOpen,        path: "/courses" },
    { id: "faculty",       label: "Faculty",       icon: Users,           path: "/faculty" },
    { id: "rooms",         label: "Rooms",         icon: Home,            path: "/rooms" },
    { id: "timetables",    label: "Timetables",    icon: Calendar,        path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell,            path: "/notifications" },
  ]

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get("/notifications")
      setNotifications(
        Array.isArray(res.data)
          ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : []
      )
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleSubmitNotification = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await api.post("/notifications", formData)
      resetForm(); setShowForm(false); fetchNotifications()
    } catch (error) { console.error(error) }
    finally { setFormLoading(false) }
  }

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return
    try {
      await api.delete(`/notifications/${notificationToDelete._id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== notificationToDelete._id))
    } catch (error) { console.error(error) }
    finally { setNotificationToDelete(null) }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setJustRead((prev) => new Set([...prev, id]))
      setTimeout(() => {
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
        setJustRead((prev) => { const s = new Set(prev); s.delete(id); return s })
      }, 400)
    } catch (error) { console.error(error) }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id)
    try {
      await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}/read`)))
      fetchNotifications()
    } catch (error) { console.error(error) }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filtered = notifications.filter((n) => filterType === "all" || n.type === filterType)

  const typeTabCounts = ["all", "info", "success", "warning", "error"].map((t) => ({
    type: t,
    count: t === "all" ? notifications.length : notifications.filter((n) => n.type === t).length,
  }))

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0; transform:translateX(10px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        .notif-row { transition: background 0.15s ease, box-shadow 0.15s ease; }
        .notif-row:hover { background: #fdfaf8 !important; }
        .notif-row:hover .row-actions { opacity: 1 !important; }
        .row-actions { opacity: 0; transition: opacity 0.15s ease; }
        .fade-reading { opacity: 0.3; transition: opacity 0.4s ease; }
      `}</style>

      <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>

        {/* ── SIDEBAR ── */}
        <div
          className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{ width: isSidebarCollapsed ? "60px" : "240px", background: "#3d2c2c", minHeight: "100vh", position: "sticky", top: 0, height: "100vh" }}
        >
          <div
            className="flex items-center gap-3 px-3 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", minHeight: "58px" }}
          >
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
                    style={{
                      padding: isSidebarCollapsed ? "9px 0" : "9px 10px",
                      justifyContent: isSidebarCollapsed ? "center" : undefined,
                      background: isActive ? "#bf8b5e" : "transparent",
                      marginBottom: "2px",
                      position: "relative",
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
                    {/* Unread dot on collapsed notification icon */}
                    {item.id === "notifications" && isSidebarCollapsed && unreadCount > 0 && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#c0392b",
                        animation: "pulse-dot 1.8s ease-in-out infinite",
                      }} />
                    )}
                    {item.id === "notifications" && !isSidebarCollapsed && unreadCount > 0 && (
                      <span className="ml-auto text-white text-xs font-medium rounded-full flex-shrink-0"
                        style={{ background: "#c0392b", padding: "1px 6px", fontSize: "10px" }}>
                        {unreadCount}
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
          <div className="p-6 space-y-5 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-medium" style={{ color: "#2c1810" }}>Communication Center</h1>
                <p className="text-sm mt-1" style={{ color: "#7a5c50" }}>
                  Dispatch system-wide alerts and manage institutional notices.
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 text-sm rounded-lg px-4 py-2 text-white"
                style={{ background: "#bf8b5e", border: "none", cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Plus style={{ width: 15, height: 15 }} />
                New Announcement
              </button>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total",   value: notifications.length,                                   bg: "#dbeafe", labelC: "#1e40af", valC: "#1e3a8a" },
                { label: "Unread",  value: unreadCount,                                            bg: "#ffe4e6", labelC: "#9f1239", valC: "#881337" },
                { label: "Success", value: notifications.filter((n) => n.type === "success").length, bg: "#dcfce7", labelC: "#166534", valC: "#14532d" },
                { label: "Urgent",  value: notifications.filter((n) => n.priority === "high").length, bg: "#fef3c7", labelC: "#92400e", valC: "#78350f" },
              ].map(({ label, value, bg, labelC, valC }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: bg }}>
                  <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: labelC }}>{label}</p>
                  <p className="text-2xl font-medium" style={{ color: valC }}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── FORM ── */}
            {showForm && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#fff", border: "0.5px solid #e5d5cb", animation: "slideDown 0.22s ease-out" }}
              >
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: "#ffedd5" }}>
                      <Megaphone style={{ width: 14, height: 14, color: "#9a3412" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>Create System Announcement</h2>
                      <p className="text-xs" style={{ color: "#7a5c50" }}>Broadcast to all staff and faculty</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a5c50" }}>
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <div className="p-5">
                  <form onSubmit={handleSubmitNotification} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Alert Type</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                          <SelectTrigger style={{ borderColor: "#d9c4ba", fontSize: 13 }}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="success">Success / Milestone</SelectItem>
                            <SelectItem value="warning">Warning / Maintenance</SelectItem>
                            <SelectItem value="error">Critical Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Urgency Level</Label>
                        <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                          <SelectTrigger style={{ borderColor: "#d9c4ba", fontSize: 13 }}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Subject Heading</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="e.g. Server Maintenance Schedule"
                        style={{ borderColor: "#d9c4ba", fontSize: 13 }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" style={{ color: "#7a5c50" }}>Detailed Message</Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={3}
                        placeholder="Provide clear details for the staff and faculty..."
                        style={{ borderColor: "#d9c4ba", fontSize: 13 }}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="text-sm px-4 py-2 rounded-lg"
                        style={{ background: "#fdfaf8", border: "0.5px solid #eeddd6", color: "#7a5c50", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="text-sm px-5 py-2 rounded-lg text-white"
                        style={{ background: formLoading ? "#d9a47c" : "#bf8b5e", border: "none", cursor: formLoading ? "not-allowed" : "pointer", fontWeight: 500, minWidth: 130 }}
                      >
                        {formLoading ? "Dispatching…" : "Broadcast Now"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── TYPE FILTER TABS ── */}
            <div
              className="flex items-center gap-2 p-3 rounded-xl flex-wrap"
              style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}
            >
              <span className="text-xs font-medium mr-1" style={{ color: "#7a5c50" }}>Filter:</span>
              {typeTabCounts.map(({ type, count }) => {
                const isActive = filterType === type
                const cfg = type !== "all" ? TYPE_CONFIG[type] : null
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg capitalize transition-all"
                    style={{
                      background: isActive ? (cfg ? cfg.bg : "#3d2c2c") : "#fdfaf8",
                      color: isActive ? (cfg ? cfg.iconColor : "#f5ede8") : "#6b3d2e",
                      border: isActive ? (cfg ? `0.5px solid ${cfg.border}` : "none") : "0.5px solid #eeddd6",
                      fontWeight: isActive ? 500 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {type === "all" ? "All" : type}
                    <span
                      className="rounded-full px-1.5 text-xs"
                      style={{
                        background: isActive ? "rgba(0,0,0,0.1)" : "#f0ebe6",
                        color: isActive ? "inherit" : "#7a5c50",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="ml-auto text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: "#dcfce7", color: "#14532d", border: "none", cursor: "pointer", fontWeight: 500 }}
                >
                  <Check style={{ width: 11, height: 11 }} />
                  Mark all read
                </button>
              )}
            </div>

            {/* ── NOTIFICATION LIST ── */}
            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}>

              {/* List header */}
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: "#fef3c7" }}>
                  <Bell style={{ width: 15, height: 15, color: "#92400e" }} />
                </div>
                <div>
                  <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>Live Feed</h2>
                  <p className="text-xs" style={{ color: "#7a5c50" }}>
                    {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
                    {filterType !== "all" && <span> — filtered by <strong style={{ color: "#bf8b5e" }}>{filterType}</strong></span>}
                  </p>
                </div>
              </div>

              {/* Items */}
              {loading ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-10 h-10 rounded-full animate-spin mx-auto" style={{ border: "3px solid #eeddd6", borderTopColor: "#bf8b5e" }} />
                  <p className="text-sm" style={{ color: "#7a5c50" }}>Synchronising feed…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#f5ede8" }}>
                    <CheckCircle style={{ width: 28, height: 28, color: "#bf8b5e" }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "#2c1810" }}>No notifications here</p>
                  <p className="text-xs" style={{ color: "#7a5c50" }}>The feed is clear for this filter.</p>
                </div>
              ) : (
                <div>
                  {filtered.map((n, idx) => {
                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                    const priCfg = PRIORITY_CONFIG[n.priority]
                    const isJustRead = justRead.has(n._id)
                    return (
                      <div
                        key={n._id}
                        className="notif-row"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          padding: "14px 20px",
                          borderBottom: idx < filtered.length - 1 ? "0.5px solid #f5ede8" : "none",
                          background: n.isRead ? "#fff" : cfg.bg,
                          borderLeft: `3px solid ${n.isRead ? "#eeddd6" : cfg.accent}`,
                          opacity: isJustRead ? 0.3 : 1,
                          transition: "opacity 0.4s ease, background 0.15s ease",
                          animation: `fadeIn 0.2s ease-out ${idx * 0.04}s both`,
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
                          style={{ width: 34, height: 34, background: n.isRead ? "#f5ede8" : cfg.iconBg }}
                        >
                          {n.type === "error" || n.type === "warning"
                            ? <AlertTriangle style={{ width: 15, height: 15, color: n.isRead ? "#b0917e" : cfg.iconColor }} />
                            : n.type === "success"
                            ? <CheckCircle  style={{ width: 15, height: 15, color: n.isRead ? "#b0917e" : cfg.iconColor }} />
                            : <Info         style={{ width: 15, height: 15, color: n.isRead ? "#b0917e" : cfg.iconColor }} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: n.isRead ? "#7a5c50" : "#2c1810" }}>
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span
                                className="rounded-full"
                                style={{ width: 7, height: 7, background: cfg.accent, display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }}
                              />
                            )}
                            {n.priority === "high" && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: priCfg.bg, color: priCfg.color }}>
                                Urgent
                              </span>
                            )}
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: n.isRead ? "#f5ede8" : cfg.iconBg, color: n.isRead ? "#7a5c50" : cfg.iconColor }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: n.isRead ? "#9a7a6a" : "#5c3d2e" }}>
                            {n.message}
                          </p>
                          <p className="text-xs" style={{ color: "#b0917e" }}>
                            {new Date(n.createdAt).toLocaleDateString()} •{" "}
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        {/* Actions — revealed on hover via CSS */}
                        <div className="row-actions flex gap-1 flex-shrink-0">
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n._id)}
                              className="flex items-center justify-center rounded-lg transition-colors"
                              style={{ width: 30, height: 30, background: "#dcfce7", border: "none", cursor: "pointer" }}
                              title="Mark as read"
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#bbf7d0")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#dcfce7")}
                            >
                              <Check style={{ width: 13, height: 13, color: "#14532d" }} />
                            </button>
                          )}
                          <button
                            onClick={() => setNotificationToDelete(n)}
                            className="flex items-center justify-center rounded-lg transition-colors"
                            style={{ width: 30, height: 30, background: "#ffe4e6", border: "none", cursor: "pointer" }}
                            title="Delete"
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fecdd3")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffe4e6")}
                          >
                            <Trash2 style={{ width: 13, height: 13, color: "#881337" }} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {notificationToDelete && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(61,44,44,0.45)",
            padding: 16,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            className="rounded-xl overflow-hidden w-full max-w-md"
            style={{ background: "#fff", border: "0.5px solid #e5d5cb", animation: "slideDown 0.2s ease-out" }}
          >
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, background: "#ffe4e6" }}>
                  <AlertTriangle style={{ width: 14, height: 14, color: "#881337" }} />
                </div>
                <h3 className="text-sm font-medium" style={{ color: "#2c1810" }}>Remove Announcement?</h3>
              </div>
              <p className="text-xs mt-2" style={{ color: "#7a5c50" }}>
                This will permanently delete <strong style={{ color: "#2c1810" }}>"{notificationToDelete.title}"</strong> from the system feed for all users.
              </p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-2" style={{ background: "#fdfaf8" }}>
              <button
                onClick={() => setNotificationToDelete(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ background: "#fff", border: "0.5px solid #eeddd6", color: "#7a5c50", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNotification}
                className="text-sm px-4 py-2 rounded-lg text-white font-medium"
                style={{ background: "#c0392b", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#9b1c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c0392b")}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
