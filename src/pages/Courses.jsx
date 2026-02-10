import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseForm } from "@/components/CourseForm"
import { DataTable } from "@/components/Data-table"
import { Plus, BookOpen, Users, Calendar, LayoutDashboard, Home, Bell } from "lucide-react"
import { Link } from "react-router-dom"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("courses")
  const [editingCourse, setEditingCourse] = useState(null)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    {
      id: "timetables",
      label: "Timetables",
      icon: Calendar,
      path: "/timetables",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
  ]

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/courses/")
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
      await axios.post("http://localhost:5000/api/courses/", courseData)
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
      await axios.put(`http://localhost:5000/api/courses/${id}`, courseData)
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
      await axios.delete(`http://localhost:5000/api/courses/${id}`)
      if (editingCourse && editingCourse._id === id) {
        setEditingCourse(null)
        setShowForm(false)
      }
      fetchCourses()
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  const columns = [
    {
      key: "code",
      label: "Course Code",
      sortable: true,
      render: (course) => (
        <div className="font-mono font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
          {course.code}
        </div>
      ),
    },
    {
      key: "name",
      label: "Course Name",
      sortable: true,
      render: (course) => <div className="font-medium text-slate-900">{course.name}</div>,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (course) => <div className="text-slate-600">{course.department}</div>,
    },
    {
      key: "credits",
      label: "Credits",
      render: (course) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
          {course.credits}
        </Badge>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (course) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
          {course.type}
        </Badge>
      ),
    },
    {
      key: "hoursPerWeek",
      label: "Hours per Week",
      render: (course) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
          {course.hoursPerWeek}
        </Badge>
      ),
    },
    {
      key: "semester",
      label: "Semester",
      render: (course) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
          Sem {course.semester}
        </Badge>
      ),
    },
    {
      key: "year",
      label: "Year",
      render: (course) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
          {course.year}
        </Badge>
      ),
    },
    {
      key: "prerequisites",
      label: "Prerequisites",
      render: (course) => (
        <div className="flex flex-wrap gap-1 max-w-32">
          {course.prerequisites?.length > 0 ? (
            course.prerequisites.map((prereq, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-white text-slate-600 border-slate-300"
              >
                {prereq}
              </Badge>
            ))
          ) : (
            <span className="text-slate-400 text-sm">None</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            onClick={() => {
              setEditingCourse(course)
              setShowForm(true)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 bg-white hover:bg-red-50 text-red-700"
            onClick={() => handleDeleteCourse(course._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
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
                        ? "bg-blue-900 text-white border-l-4 border-blue-600"
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

      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
              <p className="text-slate-500 mt-2">
                Manage academic courses and their details.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCourse(null)
                setShowForm(!showForm)
              }}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Course
            </Button>
          </div>

          {showForm && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-slate-800">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Fill in the course details below
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <BookOpen className="h-5 w-5 text-blue-900" />
                All Courses
              </CardTitle>
              <CardDescription className="text-slate-500">
                {courses.length} courses registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={courses} columns={columns} searchKey="name" loading={loading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}