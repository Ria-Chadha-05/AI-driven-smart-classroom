import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseForm } from "@/components/CourseForm"
import { DataTable } from "@/components/Data-table"
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  LayoutDashboard,
  Home,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("courses")
  const [editingCourse, setEditingCourse] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Sorting state
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState("asc")

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5001/api/courses/")
      setCourses(res.data)
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreateCourse = async (courseData) => {
    try {
      setFormLoading(true)
      await axios.post("http://localhost:5001/api/courses/", courseData)
      setShowForm(false)
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      console.error("Failed to create course:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateCourse = async (id, courseData) => {
    try {
      setFormLoading(true)
      await axios.put(`http://localhost:5001/api/courses/${id}`, courseData)
      setEditingCourse(null)
      setShowForm(false)
      fetchCourses()
    } catch (error) {
      console.error("Failed to update course:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/courses/${id}`)
      if (editingCourse && editingCourse._id === id) {
        setEditingCourse(null)
        setShowForm(false)
      }
      fetchCourses()
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  // ── Sorting logic ──
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortedCourses = [...courses].sort((a, b) => {
    if (!sortKey) return 0
    const valA = (a[sortKey] || "").toString().toLowerCase()
    const valB = (b[sortKey] || "").toString().toLowerCase()
    if (valA < valB) return sortDir === "asc" ? -1 : 1
    if (valA > valB) return sortDir === "asc" ? 1 : -1
    return 0
  })

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown style={{ width: 13, height: 13, opacity: 0.4 }} />
    return sortDir === "asc"
      ? <ArrowUp style={{ width: 13, height: 13, color: "#bf8b5e" }} />
      : <ArrowDown style={{ width: 13, height: 13, color: "#bf8b5e" }} />
  }

  const sortableFields = [
    { key: "code", label: "Course Code" },
    { key: "name", label: "Course Name" },
    { key: "department", label: "Department" },
  ]

  const columns = [
    {
      key: "code",
      label: "Course Code",
      sortable: true,
      render: (course) => (
        <div
          className="font-mono font-semibold px-2 py-1 rounded-md inline-block"
          style={{ background: "#dbeafe", color: "#1e3a8a", border: "0.5px solid #bfdbfe", fontSize: "12px" }}
        >
          {course.code}
        </div>
      ),
    },
    {
      key: "name",
      label: "Course Name",
      sortable: true,
      render: (course) => (
        <div className="font-medium" style={{ color: "#2c1810" }}>{course.name}</div>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (course) => (
        <div
          className="px-2 py-1 rounded-md inline-block text-xs font-medium"
          style={{ background: "#ede9fe", color: "#4c1d95", border: "0.5px solid #ddd6fe" }}
        >
          {course.department}
        </div>
      ),
    },
    {
      key: "credits",
      label: "Credits",
      render: (course) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "#ccfbf1", color: "#134e4a" }}
        >
          {course.credits}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (course) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "#fef3c7", color: "#78350f" }}
        >
          {course.type}
        </span>
      ),
    },
    {
      key: "hoursPerWeek",
      label: "Hrs/Week",
      render: (course) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "#ffedd5", color: "#7c2d12" }}
        >
          {course.hoursPerWeek}h
        </span>
      ),
    },
    {
      key: "semester",
      label: "Semester",
      render: (course) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "#ede9fe", color: "#4c1d95" }}
        >
          Sem {course.semester}
        </span>
      ),
    },
    {
      key: "year",
      label: "Year",
      render: (course) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "#dcfce7", color: "#14532d" }}
        >
          {course.year}
        </span>
      ),
    },
    {
      key: "prerequisites",
      label: "Prerequisites",
      render: (course) => (
        <div className="flex flex-wrap gap-1 max-w-32">
          {course.prerequisites?.length > 0 ? (
            course.prerequisites.map((prereq, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded text-xs"
                style={{ background: "#f5ede8", color: "#7a5c50", border: "0.5px solid #eeddd6" }}
              >
                {prereq}
              </span>
            ))
          ) : (
            <span className="text-xs" style={{ color: "#b0917e" }}>None</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex gap-2">
          <button
            className="text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "#fff", border: "0.5px solid #d9c4ba", color: "#bf8b5e", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            onClick={() => { setEditingCourse(course); setShowForm(true) }}
          >
            Edit
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "#fff", border: "0.5px solid #fecdd3", color: "#881337", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe4e6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            onClick={() => handleDeleteCourse(course._id)}
          >
            Delete
          </button>
        </div>
      ),
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
              : <ChevronLeft style={{ width: 16, height: 16, color: "rgba(245,237,232,0.5)" }} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
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
                  <IconComponent
                    style={{
                      width: 16, height: 16, flexShrink: 0,
                      color: isActive ? "#fff" : "rgba(245,237,232,0.55)",
                    }}
                  />
                  {!isSidebarCollapsed && (
                    <span
                      className="text-sm truncate"
                      style={{
                        color: isActive ? "#fff" : "rgba(245,237,232,0.7)",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
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
        <div className="p-6 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium" style={{ color: "#2c1810" }}>Courses</h1>
              <p className="text-sm mt-1" style={{ color: "#7a5c50" }}>
                Manage academic courses and their details.
              </p>
            </div>
            <button
              onClick={() => { setEditingCourse(null); setShowForm(!showForm) }}
              className="flex items-center gap-2 text-sm rounded-lg px-4 py-2 text-white transition-opacity"
              style={{ background: "#bf8b5e", border: "none", cursor: "pointer", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add Course
            </button>
          </div>

          {/* Sort bar */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}
          >
            <span className="text-xs font-medium" style={{ color: "#7a5c50" }}>Sort by:</span>
            <div className="flex gap-2">
              {sortableFields.map(({ key, label }) => {
                const isActive = sortKey === key
                return (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: isActive ? "#bf8b5e" : "#fdfaf8",
                      color: isActive ? "#fff" : "#6b3d2e",
                      border: isActive ? "none" : "0.5px solid #eeddd6",
                      cursor: "pointer",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {label}
                    {isActive ? (
                      sortDir === "asc"
                        ? <ArrowUp style={{ width: 11, height: 11 }} />
                        : <ArrowDown style={{ width: 11, height: 11 }} />
                    ) : (
                      <ArrowUpDown style={{ width: 11, height: 11, opacity: 0.5 }} />
                    )}
                  </button>
                )
              })}
              {sortKey && (
                <button
                  onClick={() => { setSortKey(null); setSortDir("asc") }}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "#ffe4e6", color: "#881337", border: "none", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            {sortKey && (
              <span className="text-xs ml-auto" style={{ color: "#7a5c50" }}>
                Sorted by <strong style={{ color: "#bf8b5e" }}>
                  {sortableFields.find(f => f.key === sortKey)?.label}
                </strong> ({sortDir === "asc" ? "A → Z" : "Z → A"})
              </span>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#fff", border: "0.5px solid #e5d5cb" }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid #f5ede8", background: "#fdfaf8" }}
              >
                <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#7a5c50" }}>
                  Fill in the course details below
                </p>
              </div>
              <div className="p-5">
                <CourseForm
                  initialData={editingCourse}
                  onSubmit={(data) => {
                    if (editingCourse) {
                      handleUpdateCourse(editingCourse._id, data)
                    } else {
                      handleCreateCourse(data)
                    }
                  }}
                  loading={formLoading}
                />
              </div>
            </div>
          )}

          {/* Table card */}
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
                style={{ width: 30, height: 30, background: "#dbeafe" }}
              >
                <BookOpen style={{ width: 15, height: 15, color: "#1e40af" }} />
              </div>
              <div>
                <h2 className="text-sm font-medium" style={{ color: "#2c1810" }}>All Courses</h2>
                <p className="text-xs" style={{ color: "#7a5c50" }}>
                  {courses.length} courses registered in the system
                </p>
              </div>
            </div>
            <div className="p-0">
              <DataTable
                data={sortedCourses}
                columns={columns}
                searchKey="name"
                loading={loading}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
