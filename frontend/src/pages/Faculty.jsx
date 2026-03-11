import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FacultyForm } from "@/components/Faculty-Form"
import { DataTable } from "@/components/Data-table"
import { Plus, Users, Mail, Clock, Calendar, LayoutDashboard, BookOpen, Home, Bell } from "lucide-react"
import { Link } from "react-router-dom"

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("faculty")
  const [editingFaculty, setEditingFaculty] = useState(null)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const fetchFaculty = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/api/faculty")
      setFaculty(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error(error)
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculty()
  }, [])

  const handleCreateFaculty = async (data) => {
    setFormLoading(true)
    try {
      if (editingFaculty) {
        await axios.put(`http://localhost:5000/api/faculty/${editingFaculty._id}`, data)
      } else {
        await axios.post("http://localhost:5000/api/faculty", data)
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

  const handleDelete = async (facultyMember) => {
    try {
      await axios.delete(`http://localhost:5000/api/faculty/${facultyMember._id}`)
      if (editingFaculty && editingFaculty._id === facultyMember._id) {
        setEditingFaculty(null)
        setShowForm(false)
      }
      fetchFaculty()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (f) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{f.name}</div>
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <Mail className="h-3 w-3 text-blue-800" /> {f.email}
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (f) => <div className="text-slate-700">{f.department}</div>,
    },
    {
      key: "designation",
      label: "Designation",
      render: (f) => <div className="text-slate-700">{f.designation || "N/A"}</div>,
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (f) => (
        <div className="flex flex-wrap gap-1">
          {f.specialization?.slice(0, 2).map((s) => (
            <Badge key={s} className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
              {s}
            </Badge>
          ))}
          {f.specialization?.length > 2 && (
            <Badge className="bg-slate-200 text-slate-800 border-slate-300">
              +{f.specialization.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "maxHoursPerWeek",
      label: "Max Hours/Week",
      render: (f) => (
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Clock className="h-3 w-3 text-blue-900" /> {f.maxHoursPerWeek}h
        </div>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      render: (f) => (
        <div className="flex flex-col gap-1 text-sm">
          {Object.entries(f.availability || {}).map(([day, slots]) =>
            slots.length ? (
              <div key={day} className="text-slate-600">
                <span className="text-blue-900 font-semibold">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>{" "}
                {slots.map((s) => `${s.start}-${s.end}`).join(", ")}
              </div>
            ) : null,
          )}
        </div>
      ),
    },
    {
      key: "preferences",
      label: "Preferences",
      render: (f) => (
        <div className="flex flex-col gap-1 text-sm">
          {f.preferences?.preferredTimeSlots?.length > 0 && (
            <div className="text-slate-600">
              <span className="text-green-800 font-semibold">Preferred:</span>{" "}
              {f.preferences.preferredTimeSlots.join(", ")}
            </div>
          )}
          {f.preferences?.avoidTimeSlots?.length > 0 && (
            <div className="text-slate-600">
              <span className="text-red-800 font-semibold">Avoid:</span> {f.preferences.avoidTimeSlots.join(", ")}
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
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            onClick={() => {
              setEditingFaculty(f)
              setShowForm(true)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 bg-white hover:bg-red-50 text-red-700"
            onClick={() => handleDelete(f)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-900/20 border-t-blue-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading faculty records...</p>
        </div>
      </div>
    )

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 relative z-10">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-md flex items-center justify-center border border-slate-700">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Scheduler</h2>
              <p className="text-xs text-slate-400">Smart Classroom</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeNavItem === item.id
              return (
                <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-blue-900 text-white border-l-4 border-blue-600 shadow-md"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">Faculty Management</h1>
            <p className="text-slate-500">
              Manage academic staff, specialization areas, and weekly availability.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingFaculty(null)
              setShowForm(!showForm)
            }}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 shadow-sm transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Faculty Member
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-xl font-semibold text-slate-800">
                {editingFaculty ? "Edit Faculty Profile" : "Register New Faculty"}
              </CardTitle>
              <CardDescription className="text-slate-500">
                Please provide accurate contact and availability information.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <FacultyForm initialData={editingFaculty} onSubmit={handleCreateFaculty} loading={formLoading} />
            </CardContent>
          </Card>
        )}

        {/* Faculty List */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
                  <Users className="h-5 w-5 text-blue-900" />
                  Staff Directory
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Currently overseeing {faculty.length} faculty members.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-md border border-slate-200">
              <DataTable data={faculty} columns={columns} searchKey="name" loading={loading} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}