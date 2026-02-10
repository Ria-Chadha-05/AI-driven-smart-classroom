import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Users,
  Calendar,
  LayoutDashboard,
  BookOpen,
  Home,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Check,
  Megaphone,
} from "lucide-react"
import { Link } from "react-router-dom"

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
})

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem] = useState("notifications")
  const [notificationToDelete, setNotificationToDelete] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "low",
  })

  const resetForm = () => setFormData({ title: "", message: "", type: "info", priority: "low" })

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get("/notifications")
      setNotifications(Array.isArray(res.data) ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
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
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (error) { console.error(error) }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id)
    try {
      await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}/read`)))
      fetchNotifications()
    } catch (error) { console.error(error) }
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const getNotificationIcon = (type) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case "success": return <CheckCircle className="h-5 w-5 text-emerald-600" />
      default: return <Info className="h-5 w-5 text-blue-700" />
    }
  }

  const getNotificationStyles = (type, isRead) => {
    if (isRead) return "bg-white border-slate-200 opacity-75"
    switch (type) {
      case "error": return "bg-white border-slate-200 border-l-4 border-l-red-600 shadow-sm"
      case "warning": return "bg-white border-slate-200 border-l-4 border-l-amber-500 shadow-sm"
      case "success": return "bg-white border-slate-200 border-l-4 border-l-emerald-500 shadow-sm"
      default: return "bg-white border-slate-200 border-l-4 border-l-blue-800 shadow-sm"
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-900 rounded-md flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900">Communication Center</h1>
              <p className="text-slate-500">Dispatch system-wide alerts and manage institutional notices.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-blue-900 hover:bg-blue-800 text-white font-semibold gap-2">
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          </div>

          {showForm && (
            <Card className="bg-white border-slate-200 shadow-lg animate-in fade-in slide-in-from-top-4">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-900" /> Create System Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitNotification} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Alert Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Information</SelectItem>
                          <SelectItem value="success">Success / Milestone</SelectItem>
                          <SelectItem value="warning">Warning / Maintenance</SelectItem>
                          <SelectItem value="error">Critical Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Urgency Level</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                        <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Subject Heading</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="border-slate-300" placeholder="e.g. Server Maintenance Schedule" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Detailed Message</Label>
                    <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required className="border-slate-300" rows={4} placeholder="Provide clear details for the staff and faculty..." />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={formLoading} className="bg-blue-900 hover:bg-blue-800 min-w-[140px]">
                      {formLoading ? "Dispatching..." : "Broadcast Now"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-800">Live Feed</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {unreadCount} New
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="text-xs h-8 border-slate-300">
                  Dismiss All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-slate-400 animate-pulse">Synchronizing feed...</div>
              ) : notifications.length === 0 ? (
                <div className="p-20 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-slate-300" />
                  </div>
                  <div className="text-slate-900 font-bold">No Active Alerts</div>
                  <p className="text-sm text-slate-500">The notification feed is currently clear.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div key={n._id} className={`p-5 flex items-start justify-between gap-4 transition-all ${getNotificationStyles(n.type, n.isRead)}`}>
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-slate-50 p-2 rounded-md border border-slate-100">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${n.isRead ? "text-slate-500" : "text-slate-900"}`}>{n.title}</span>
                            {n.priority === 'high' && <Badge className="bg-red-100 text-red-700 text-[10px] h-4 hover:bg-red-100 uppercase">Urgent</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                              {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleMarkAsRead(n._id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => setNotificationToDelete(n)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirmation Modal */}
      {notificationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Remove Announcement?
              </CardTitle>
              <CardDescription>
                This will permanently delete the notice from the system feed for all users.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3 bg-slate-50 p-4">
              <Button variant="ghost" onClick={() => setNotificationToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteNotification} className="bg-red-600 hover:bg-red-700">
                Confirm Deletion
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}