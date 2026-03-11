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

  // --- State for Chatbot ---
  const [isChatOpen, setIsChatOpen] = useState(false)
  // -------------------------

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
          axios.get("http://localhost:5000/api/courses"),
          axios.get("http://localhost:5000/api/faculty"),
          axios.get("http://localhost:5000/api/rooms"),
          axios.get("http://localhost:5000/api/timetables"),
          axios.get("http://localhost:5000/api/notifications"),
        ])

        setCourses(coursesRes.data)
        setFaculty(facultyRes.data)
        setRooms(roomsRes.data)
        setTimetables(timetablesRes.data)
        setNotifications(notificationsRes.data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // --- Loading State with enhanced animations ---
  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Sidebar Loading */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 shadow-sm relative z-10">
          <div className="p-6 space-y-6">
            <div className="h-8 bg-slate-800 animate-pulse rounded w-32" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Loading */}
        <div className="flex-1 p-8 relative z-10 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="h-12 bg-slate-200 animate-pulse rounded w-80" />
            <div className="h-6 bg-slate-200 animate-pulse rounded w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 bg-white animate-pulse rounded shadow border border-slate-200" />
              ))}
            </div>
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

  // --- Prepare simplified context for the chatbot ---
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
  // ----------------------------------------------------

  const recentTimetables = timetables.slice(0, 3)
  const recentNotifications = notifications.slice(0, 3)

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-slate-800",
      bgColor: "bg-slate-100",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      borderColor: "border-slate-200",
    },
    {
      title: "Total Faculty",
      value: stats.totalFaculty,
      icon: Users,
      color: "text-slate-800",
      bgColor: "bg-slate-100",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      borderColor: "border-slate-200",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: Home,
      color: "text-slate-800",
      bgColor: "bg-slate-100",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      borderColor: "border-slate-200",
    },
    {
      title: "Total Timetables",
      value: stats.totalTimetables,
      icon: Calendar,
      color: "text-blue-900",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
      borderColor: "border-blue-100",
    },
    {
      title: "Active Conflicts",
      value: stats.activeConflicts,
      icon: AlertTriangle,
      color: "text-red-700",
      bgColor: "bg-red-50",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-100",
    },
    {
      title: "Completed Schedules",
      value: stats.completedSchedules,
      icon: CheckCircle,
      color: "text-green-700",
      bgColor: "bg-green-50",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-100",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Bell,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background elements removed for cleaner look */}
      <div className="absolute inset-0 bg-slate-50"></div>

      <div className="w-64 bg-slate-900 border-r border-slate-800 shadow-xl relative z-10">
        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Smart Scheduler</h2>
                <p className="text-xs text-slate-400">Academic Administration</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeNavItem === item.id
              return (
                <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-blue-900 text-white border-l-4 border-blue-500"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-transform duration-200 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"}`}
                    />
                    <span className={`font-medium text-sm transition-colors duration-200 ${isActive ? "text-white" : ""}`}>
                      {item.label}
                    </span>
                    {item.id === "notifications" && stats.pendingTasks > 0 && (
                      <div className="ml-auto">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                            isActive ? "bg-white/20 text-white" : "bg-red-600 text-white"
                          }`}
                        >
                          {stats.pendingTasks}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="absolute bottom-6 left-6 right-6"></div>
      </div>

      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                Dashboard
              </h1>
              <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
                Welcome to your Smart Classroom Scheduler. Manage courses, faculty, and generate optimal timetables.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/timetables">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white shadow-sm transition-all duration-200 px-6 py-2 rounded-md">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Timetables
                </Button>
              </Link>
              <Link to="/timetables/generate">
                <Button
                  variant="outline"
                  className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm transition-all duration-200 px-6 py-2 rounded-md"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card
                  key={index}
                  className={`bg-white border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-md ${stat.iconBg} border border-slate-100`}>
                        <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{stat.title}</p>
                        <p
                          className={`text-2xl font-bold ${stat.color}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className={`h-1 rounded-full ${stat.bgColor} w-full`} />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-slate-800">Recent Timetables</CardTitle>
                      <CardDescription className="text-slate-500 text-sm">
                        Latest generated schedules and their status
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-all duration-200 text-xs"
                    >
                      <Link to="/timetables">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentTimetables.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-slate-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-slate-200">
                        <Calendar className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-800">No Timetables Yet</h3>
                      <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
                        Create your first timetable to get started with scheduling your classes and resources.
                      </p>
                      <Link to="/timetables/generate">
                        <Button className="bg-blue-900 hover:bg-blue-800 text-white shadow-sm transition-all duration-200">
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Timetable
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentTimetables.map((t) => (
                        <div
                          key={t._id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-all duration-200"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-slate-800 text-base">{t.name}</h4>
                              <Badge
                                variant={t.status === "published" ? "default" : "secondary"}
                                className={
                                  t.status === "published"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }
                              >
                                {t.status}
                              </Badge>
                              {t.conflicts?.length > 0 && (
                                <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                                  {t.conflicts.length} conflicts
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {t.department} • Semester {t.semester} • {t.schedule?.length || 0} classes scheduled
                            </p>
                          </div>
                          <Link to={`/timetables/`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-all duration-200 text-xs"
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

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold text-slate-800">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-500 text-sm">Frequently used operations</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-3 flex flex-col">
                  <Link to="/courses">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white hover:bg-slate-50 border-slate-300 text-slate-700 transition-all duration-200 h-10"
                    >
                      <Plus className="h-4 w-4 mr-3 text-slate-400" />
                      Add Course
                    </Button>
                  </Link>
                  <Link to="/faculty">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white hover:bg-slate-50 border-slate-300 text-slate-700 transition-all duration-200 h-10"
                    >
                      <Plus className="h-4 w-4 mr-3 text-slate-400" />
                      Add Faculty
                    </Button>
                  </Link>
                  <Link to="/rooms">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white hover:bg-slate-50 border-slate-300 text-slate-700 transition-all duration-200 h-10"
                    >
                      <Plus className="h-4 w-4 mr-3 text-slate-400" />
                      Add Room
                    </Button>
                  </Link>
                  <Link to="/timetables/generate">
                    <Button className="w-full justify-start bg-blue-900 hover:bg-blue-800 text-white shadow-sm transition-all duration-200 h-10">
                      <Sparkles className="h-4 w-4 mr-3" />
                      Generate Timetable
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-slate-800">Notifications</CardTitle>
                      <CardDescription className="text-slate-500 text-sm">Recent system alerts</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-all duration-200 text-xs"
                    >
                      <Link to="/notifications">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentNotifications.map((n) => (
                        <div
                          key={n._id}
                          className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-all duration-200"
                        >
                          <div
                            className={`p-1.5 rounded-md flex-shrink-0 ${
                              n.type === "error"
                                ? "bg-red-50 text-red-600"
                                : n.type === "warning"
                                  ? "bg-amber-50 text-amber-600"
                                  : n.type === "success"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {["error", "warning"].includes(n.type) ? (
                              <AlertTriangle
                                className="h-3.5 w-3.5"
                              />
                            ) : (
                              <TrendingUp
                                className="h-3.5 w-3.5"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 mb-0.5">{n.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
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

      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-900 text-white shadow-lg hover:bg-blue-800 hover:scale-105 transition-all duration-200"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} context={chatContext} />
    </div>
  )
}