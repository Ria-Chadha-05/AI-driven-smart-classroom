import React, { useEffect, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2,
  Sparkles,
  Download,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Calendar as CalendarIconLucide,
  LayoutDashboard,
  BookOpen,
  Users as UsersIcon,
  Home as HomeIcon,
  Bell,
  Eye,
  CheckCircle2
} from "lucide-react"

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
})

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const TIME_SLOTS = [
  "09:00-10:00", "10:00-11:00", "11:15-12:15", "12:15-13:15",
  "14:15-15:15", "15:15-16:15", "16:30-17:30",
]

function TimetableGrid({ timetable, courses, faculty, rooms }) {
  const getEntry = (day, slot) => {
    if (!timetable || !timetable.schedule) return null
    return timetable.schedule.find(
      (e) => e.day.toLowerCase() === day.toLowerCase() && `${e.startTime}-${e.endTime}` === slot
    ) || null
  }

  const findCourse = (id) => courses.find((c) => c._id === id) || null
  const findFaculty = (id) => faculty.find((f) => f._id === id) || null
  const findRoom = (id) => rooms.find((r) => r._id === id) || null

  const typeStyles = (t) => {
    switch (t) {
      case "lecture": return "bg-blue-50 text-blue-900 border-blue-200"
      case "lab": return "bg-slate-100 text-slate-900 border-slate-200"
      case "tutorial": return "bg-indigo-50 text-indigo-900 border-indigo-200"
      default: return "bg-white text-slate-700 border-slate-200"
    }
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">{timetable.name}</CardTitle>
            <CardDescription className="text-slate-500">
              {timetable.department} • Semester {timetable.semester} • {timetable.year}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={timetable.status === "published" ? "bg-blue-900" : "bg-slate-200 text-slate-700 hover:bg-slate-200"}>
              {timetable.status.toUpperCase()}
            </Badge>
            {timetable.conflicts?.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {timetable.conflicts.length} CONFLICTS
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-[1000px]">
            <div className="bg-slate-900 text-white p-3 rounded-md text-center font-semibold text-sm">Time Slot</div>
            {DAYS.map((d) => (
              <div key={d} className="bg-slate-100 text-slate-800 p-3 rounded-md text-center font-semibold text-sm border border-slate-200">
                {d}
              </div>
            ))}

            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="contents">
                <div className="flex items-center justify-center p-3 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-md">
                  <Clock className="h-3 w-3 mr-1" /> {slot}
                </div>

                {DAYS.map((day) => {
                  const entry = getEntry(day, slot)
                  if (!entry) return <div key={`${day}-${slot}`} className="bg-slate-50/30 border border-dashed border-slate-200 rounded-md min-h-[100px]" />

                  const course = findCourse(entry.courseId)
                  const prof = findFaculty(entry.facultyId)
                  const room = findRoom(entry.roomId)

                  return (
                    <div key={`${day}-${slot}`} className={`p-3 rounded-md border shadow-sm transition-all hover:shadow-md ${typeStyles(course?.type)}`}>
                      <div className="font-bold text-sm leading-tight mb-2 line-clamp-2">
                        {course ? course.name : "Unknown Course"}
                      </div>
                      <div className="space-y-1 text-[11px] font-medium opacity-80">
                        <div className="flex items-center gap-1"><User className="h-3 w-3" /> {prof?.name}</div>
                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {room?.name}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {timetable.conflicts?.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="font-bold text-red-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" /> Resolve Scheduling Conflicts
            </h4>
            {timetable.conflicts.map((c, i) => (
              <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-md flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold text-red-900 text-sm">{(c.type || "ERROR").replace("_", " ")}</div>
                  <p className="text-xs text-red-700 mt-1">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TimetablePage() {
  const [timetables, setTimetables] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState(null)
  const [activeNavItem] = useState("timetables")
  const [form, setForm] = useState({
    department: "Computer Science",
    semester: "1",
    academicYear: 2026,
    constraintsText: "",
  })

  useEffect(() => {
    fetchTimetables()
    fetchSupportingData()
  }, [])

  async function fetchTimetables() {
    setLoadingList(true)
    try {
      const response = await api.get("/timetables")
      setTimetables(Array.isArray(response.data) ? response.data : [])
    } catch (err) { setError("Failed to load records from database.") }
    finally { setLoadingList(false) }
  }

  async function fetchSupportingData() {
    try {
      const [c, f, r] = await Promise.all([api.get("/courses"), api.get("/faculty"), api.get("/rooms")])
      setCourses(c.data); setFaculty(f.data); setRooms(r.data);
    } catch (err) { console.error(err) }
  }

  async function viewTimetable(id) {
    setLoadingDetail(true)
    try {
      const response = await api.get(`/timetables/${id}`)
      setSelected(response.data)
    } catch (err) { setError("Error fetching timetable details.") }
    finally { setLoadingDetail(false) }
  }

  async function generateTimetable(e) {
    e.preventDefault()
    setGenerating(true)
    try {
      const payload = { ...form, semester: Number(form.semester), academicYear: Number(form.academicYear) }
      const res = await api.post("/timetables/generate", payload)
      await fetchTimetables()
      await viewTimetable(res.data._id)
    } catch (err) { setError("Generation failed. Check constraints.") }
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
    if (!confirm("Delete this record permanently?")) return
    try {
      await api.delete(`/timetables/${t._id}`)
      fetchTimetables()
      if (selected?._id === t._id) setSelected(null)
    } catch (err) { console.error(err) }
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: UsersIcon, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: HomeIcon, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: CalendarIconLucide, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col fixed h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-900 rounded-md flex items-center justify-center">
            <CalendarIconLucide className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Scheduler</h2>
            <p className="text-xs text-slate-400">Institutional OS</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.id} to={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${activeNavItem === item.id ? "bg-blue-900 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900">Academic Timetables</h1>
            <p className="text-slate-500">Automated scheduling and conflict management system.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & List */}
            <div className="xl:col-span-5 space-y-8">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-900" /> New Generation Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={generateTimetable} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Department</label>
                        <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required className="border-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Semester</label>
                        <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                          <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Constraints & Notes</label>
                      <Textarea 
                        value={form.constraintsText} 
                        onChange={(e) => setForm({ ...form, constraintsText: e.target.value })}
                        placeholder="e.g. No labs on Mondays, Prefer morning slots for Math" 
                        rows={3} 
                        className="border-slate-300"
                      />
                    </div>
                    <Button type="submit" disabled={generating} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-6">
                      {generating ? "PROCESSING ALGORITHM..." : "EXECUTE AI GENERATOR"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-slate-800">History Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingList ? (
                    <div className="p-10 text-center text-slate-400">Loading directory...</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {timetables.map((t) => (
                        <div key={t._id} className={`p-4 flex items-center justify-between transition-colors ${selected?._id === t._id ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                            <div className="text-[11px] text-slate-500 uppercase font-bold mt-0.5">{t.department} • SEM {t.semester}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => viewTimetable(t._id)} className="h-8 w-8 text-blue-900"><Eye className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => togglePublish(t)} className={`h-8 w-8 ${t.status === "published" ? "text-green-600" : "text-slate-400"}`}><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteTimetable(t)} className="h-8 w-8 text-red-600"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Grid Preview */}
            <div className="xl:col-span-7">
              {loadingDetail ? (
                <div className="h-[600px] bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-medium">
                  Reconstructing Grid View...
                </div>
              ) : selected ? (
                <TimetableGrid timetable={selected} courses={courses} faculty={faculty} rooms={rooms} />
              ) : (
                <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-center p-10">
                  <CalendarIconLucide className="h-12 w-12 mb-4 opacity-20" />
                  <div className="font-bold text-slate-900">No Selection</div>
                  <p className="text-sm mt-1">Select an item from the history log to preview the full academic grid.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}