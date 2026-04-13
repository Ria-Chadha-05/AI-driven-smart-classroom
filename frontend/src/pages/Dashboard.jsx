"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  Sparkles,
  Users,
  BookOpen,
  Home,
  CheckCircle,
  Bell,
  LayoutDashboard,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Chatbot } from "@/components/Chatbot"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [timetables, setTimetables] = useState([])
  const [notifications, setNotifications] = useState([])
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, facultyRes, roomsRes, timetablesRes, notificationsRes] = await Promise.all([
          axios.get("http://localhost:5001/api/courses"),
          axios.get("http://localhost:5001/api/faculty"),
          axios.get("http://localhost:5001/api/rooms"),
          axios.get("http://localhost:5001/api/timetables"),
          axios.get("http://localhost:5001/api/notifications"),
        ])
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
        setFaculty(Array.isArray(facultyRes.data) ? facultyRes.data : [])
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : [])
        setTimetables(Array.isArray(timetablesRes.data) ? timetablesRes.data : [])
        setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : [])
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>
        <div
          className="w-60 flex-shrink-0"
          style={{ background: "#3d2c2c" }}
        >
          <div className="p-6 space-y-4">
            <div className="h-8 rounded animate-pulse" style={{ background: "#5a3d3d" }} />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded animate-pulse" style={{ background: "#5a3d3d" }} />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8 space-y-6">
          <div className="h-10 rounded animate-pulse w-72" style={{ background: "#e5d5cb" }} />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "#e5d5cb" }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    totalCourses: courses.length,
    totalFaculty: faculty.length,
    totalRooms: rooms.length,
    totalTimetables: timetables.length,
    activeConflicts: timetables.reduce((acc, t) => acc + (t.conflicts?.length || 0), 0),
    completedSchedules: timetables.filter((t) => t.status === "published").length,
    utilizationRate: timetables.length
      ? Math.round((timetables.filter((t) => t.schedule?.length).length / timetables.length) * 100)
      : 0,
    pendingTasks: notifications.filter((n) => !n.isRead).length,
  }

  const chatContext = {
    timetables: timetables.map((tt) => ({
      name: tt.name,
      department: tt.department,
      semester: tt.semester,
      status: tt.status,
      schedule:
        tt.schedule?.map((s) => ({
          day: s.day,
          time: s.timeSlot,
          course: courses.find((c) => c._id === s.courseId)?.name,
          faculty: faculty.find((f) => f._id === s.facultyId)?.name,
          room: rooms.find((r) => r._id === s.roomId)?.name,
        })) || [],
    })),
    totalCourses: courses.length,
    totalFaculty: faculty.length,
  }

  const recentTimetables = timetables.slice(0, 3)
  const recentNotifications = notifications.slice(0, 3)

  // Each card has its own color scheme: { bg, iconBg, iconColor, labelColor, valueColor }
  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      bg: "#dbeafe",
      iconBg: "#bfdbfe",
      iconStroke: "#1e40af",
      labelColor: "#1e40af",
      valueColor: "#1e3a8a",
    },
    {
      title: "Total Faculty",
      value: stats.totalFaculty,
      icon: Users,
      bg: "#dcfce7",
      iconBg: "#bbf7d0",
      iconStroke: "#166534",
      labelColor: "#166534",
      valueColor: "#14532d",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: Home,
      bg: "#ccfbf1",
      iconBg: "#99f6e4",
      iconStroke: "#115e59",
      labelColor: "#115e59",
      valueColor: "#134e4a",
    },
    {
      title: "Total Timetables",
      value: stats.totalTimetables,
      icon: Calendar,
      bg: "#ede9fe",
      iconBg: "#ddd6fe",
      iconStroke: "#5b21b6",
      labelColor: "#5b21b6",
      valueColor: "#4c1d95",
    },
    {
      title: "Active Conflicts",
      value: stats.activeConflicts,
      icon: AlertTriangle,
      bg: "#ffe4e6",
      iconBg: "#fecdd3",
      iconStroke: "#9f1239",
      labelColor: "#9f1239",
      valueColor: "#881337",
    },
    {
      title: "Completed",
      value: stats.completedSchedules,
      icon: CheckCircle,
      bg: "#dcfce7",
      iconBg: "#bbf7d0",
      iconStroke: "#166534",
      labelColor: "#166534",
      valueColor: "#14532d",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Bell,
      bg: "#fef3c7",
      iconBg: "#fde68a",
      iconStroke: "#92400e",
      labelColor: "#92400e",
      valueColor: "#78350f",
    },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: "#f7f3f0" }}>

      {/* ── SIDEBAR ── */}
      <div
        className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{
          width: isSidebarCollapsed ? "60px" : "240px",
          background: "#3d2c2c",
          minHeight: "100vh",
        }}
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
            <span className="text-white font-medium text-sm">S</span>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: "#f5ede8" }}>
                Smart Scheduler
              </p>
              <p className="text-xs truncate" style={{ color: "rgba(245,237,232,0.45)" }}>
                Academic Admin
              </p>
            </div>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex-shrink-0 flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 26,
              height: 26,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginLeft: isSidebarCollapsed ? "auto" : undefined,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" style={{ color: "rgba(245,237,232,0.5)" }} />
            ) : (
              <ChevronLeft className="w-4 h-4" style={{ color: "rgba(245,237,232,0.5)" }} />
            )}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeNavItem === item.id
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActiveNavItem(item.id)}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer relative"
                  style={{
                    padding: isSidebarCollapsed ? "9px 0" : "9px 10px",
                    justifyContent: isSidebarCollapsed ? "center" : undefined,
                    background: isActive ? "#bf8b5e" : "transparent",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)"
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent"
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <IconComponent
                    className="flex-shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      color: isActive ? "#fff" : "rgba(245,237,232,0.55)",
                    }}
                  />
                  {!isSidebarCollapsed && (
                    <>
                      <span
                        className="text-sm truncate flex-1"
                        style={{
                          color: isActive ? "#fff" : "rgba(245,237,232,0.7)",
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                      {item.id === "notifications" && stats.pendingTasks > 0 && (
                        <span
                          className="ml-auto text-white text-xs font-medium rounded-full flex-shrink-0"
                          style={{
                            background: "#c0392b",
                            padding: "1px 6px",
                            fontSize: "10px",
                          }}
                        >
                          {stats.pendingTasks}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl font-medium" style={{ color: "#2c1810" }}>
                Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: "#7a5c50" }}>
                Manage courses, faculty, and generate optimal timetables
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/timetables">
                <Button
                  className="text-white text-sm px-5 py-2 rounded-lg"
                  style={{ background: "#bf8b5e", border: "none" }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Timetables
                </Button>
              </Link>
              <Link to="/timetables/generate">
                <Button
                  variant="outline"
                  className="text-sm px-5 py-2 rounded-lg"
                  style={{ borderColor: "#d9c4ba", color: "#6b3d2e", background: "#fff" }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
              </Link>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={index}
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: stat.bg }}
                >
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{ width: 32, height: 32, background: stat.iconBg }}
                  >
                    <IconComponent style={{ width: 15, height: 15, color: stat.iconStroke }} />
                  </div>
                  <p
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: stat.labelColor, letterSpacing: "0.04em" }}
                  >
                    {stat.title}
                  </p>
                  <p className="text-2xl font-medium" style={{ color: stat.valueColor }}>
                    {stat.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* ── CONTENT GRID ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Recent Timetables */}
            <div className="xl:col-span-2">
              <Card style={{ background: "#fff", border: "0.5px solid #e5d5cb", borderRadius: "10px" }}>
                <CardHeader
                  className="flex flex-row items-center justify-between p-4"
                  style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}
                >
                  <div>
                    <CardTitle className="text-sm font-medium" style={{ color: "#2c1810" }}>
                      Recent Timetables
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5" style={{ color: "#7a5c50" }}>
                      Latest generated schedules and their status
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-md"
                    style={{ borderColor: "#d9c4ba", color: "#bf8b5e", background: "#fff" }}
                  >
                    <Link to="/timetables">View All</Link>
                  </Button>
                </CardHeader>

                <CardContent className="p-4">
                  {recentTimetables.length === 0 ? (
                    <div className="text-center py-12">
                      <div
                        className="rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "#f5ede8" }}
                      >
                        <Calendar className="h-7 w-7" style={{ color: "#bf8b5e" }} />
                      </div>
                      <h3 className="text-sm font-medium mb-2" style={{ color: "#2c1810" }}>
                        No Timetables Yet
                      </h3>
                      <p className="text-xs mb-5" style={{ color: "#7a5c50" }}>
                        Create your first timetable to get started.
                      </p>
                      <Link to="/timetables/generate">
                        <Button
                          className="text-white text-sm rounded-lg"
                          style={{ background: "#bf8b5e", border: "none" }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Timetable
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTimetables.map((t) => (
                        <div
                          key={t._id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ border: "0.5px solid #eeddd6", background: "#fdfaf8" }}
                        >
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium" style={{ color: "#2c1810" }}>
                                {t.name}
                              </h4>
                              <Badge
                                className="text-xs px-2 py-0 rounded-full border-0"
                                style={
                                  t.status === "published"
                                    ? { background: "#dcfce7", color: "#14532d" }
                                    : { background: "#fef3c7", color: "#78350f" }
                                }
                              >
                                {t.status}
                              </Badge>
                              {t.conflicts?.length > 0 && (
                                <Badge
                                  className="text-xs px-2 py-0 rounded-full border-0"
                                  style={{ background: "#ffe4e6", color: "#881337" }}
                                >
                                  {t.conflicts.length} conflicts
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: "#7a5c50" }}>
                              {t.department} • Semester {t.semester} • {t.schedule?.length || 0} classes
                            </p>
                          </div>
                          <Link to="/timetables/">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs rounded-md"
                              style={{ borderColor: "#d9c4ba", color: "#bf8b5e", background: "#fff" }}
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar cards */}
            <div className="space-y-6">

              {/* Quick Actions */}
              <Card style={{ background: "#fff", border: "0.5px solid #e5d5cb", borderRadius: "10px" }}>
                <CardHeader
                  className="p-4"
                  style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}
                >
                  <CardTitle className="text-sm font-medium" style={{ color: "#2c1810" }}>
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-xs" style={{ color: "#7a5c50" }}>
                    Frequently used operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {[
                    { to: "/courses", label: "Add Course", dot: "#1e40af" },
                    { to: "/faculty", label: "Add Faculty", dot: "#166534" },
                    { to: "/rooms", label: "Add Room", dot: "#115e59" },
                  ].map(({ to, label, dot }) => (
                    <Link key={to} to={to}>
                      <button
                        className="w-full flex items-center gap-3 rounded-lg text-sm transition-colors"
                        style={{
                          padding: "9px 12px",
                          background: "#fdfaf8",
                          border: "0.5px solid #eeddd6",
                          color: "#2c1810",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ede8")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fdfaf8")}
                      >
                        <span
                          className="rounded-full flex-shrink-0"
                          style={{ width: 7, height: 7, background: dot, display: "inline-block" }}
                        />
                        {label}
                      </button>
                    </Link>
                  ))}
                  <Link to="/timetables/generate">
                    <button
                      className="w-full flex items-center gap-3 rounded-lg text-sm text-white"
                      style={{
                        padding: "9px 12px",
                        background: "#bf8b5e",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: 500,
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Timetable
                    </button>
                  </Link>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card style={{ background: "#fff", border: "0.5px solid #e5d5cb", borderRadius: "10px" }}>
                <CardHeader
                  className="flex flex-row items-center justify-between p-4"
                  style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}
                >
                  <div>
                    <CardTitle className="text-sm font-medium" style={{ color: "#2c1810" }}>
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-xs" style={{ color: "#7a5c50" }}>
                      Recent system alerts
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-md"
                    style={{ borderColor: "#d9c4ba", color: "#bf8b5e", background: "#fff" }}
                  >
                    <Link to="/notifications">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  {recentNotifications.length === 0 ? (
                    <p className="text-center text-xs py-6" style={{ color: "#7a5c50" }}>
                      No notifications yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recentNotifications.map((n) => (
                        <div
                          key={n._id}
                          className="flex items-start gap-3 p-3 rounded-md"
                          style={{ border: "0.5px solid #eeddd6", background: "#fdfaf8" }}
                        >
                          <div
                            className="rounded-md flex-shrink-0 flex items-center justify-center"
                            style={{
                              width: 26,
                              height: 26,
                              background:
                                n.type === "error"
                                  ? "#ffe4e6"
                                  : n.type === "warning"
                                  ? "#fef3c7"
                                  : n.type === "success"
                                  ? "#dcfce7"
                                  : "#dbeafe",
                            }}
                          >
                            {["error", "warning"].includes(n.type) ? (
                              <AlertTriangle
                                className="h-3.5 w-3.5"
                                style={{
                                  color: n.type === "error" ? "#9f1239" : "#92400e",
                                }}
                              />
                            ) : (
                              <TrendingUp
                                className="h-3.5 w-3.5"
                                style={{
                                  color: n.type === "success" ? "#166534" : "#1e40af",
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium mb-0.5" style={{ color: "#2c1810" }}>
                              {n.title}
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: "#7a5c50" }}>
                              {n.message}
                            </p>
                          </div>
                          {!n.isRead && (
                            <div
                              className="rounded-full flex-shrink-0 mt-1"
                              style={{ width: 6, height: 6, background: "#1e40af" }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHAT FAB ── */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center justify-center rounded-full transition-transform hover:scale-105"
          style={{
            width: 48,
            height: 48,
            background: "#bf8b5e",
            border: "none",
            cursor: "pointer",
          }}
        >
          <MessageSquare className="h-5 w-5 text-white" />
        </button>
      </div>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} context={chatContext} />
    </div>
  )
}
