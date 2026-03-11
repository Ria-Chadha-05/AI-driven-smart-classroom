import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/Data-table"
import { Plus, Building, Users, Calendar, LayoutDashboard, BookOpen, Home, Bell, Edit, X, Clock } from "lucide-react"
import { Link } from "react-router-dom"

export default function RoomPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("rooms")
  const [editingRoom, setEditingRoom] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    building: "",
    floor: "",
    capacity: "",
    type: "",
    equipment: "",
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  })

  const [newTimeSlot, setNewTimeSlot] = useState({
    day: "monday",
    start: "",
    end: "",
  })

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "faculty", label: "Faculty", icon: Users, path: "/faculty" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const roomTypes = [
    { value: "lecture_hall", label: "Lecture Hall" },
    { value: "lab", label: "Laboratory" },
    { value: "seminar_room", label: "Seminar Room" },
    { value: "auditorium", label: "Auditorium" },
  ]

  const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const resetForm = () => {
    setFormData({
      name: "",
      building: "",
      floor: "",
      capacity: "",
      type: "",
      equipment: "",
      availability: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
    })
    setEditingRoom(null)
  }

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/api/rooms")
      setRooms(res.data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const handleEditRoom = (room) => {
    setFormData({
      name: room.name || "",
      building: room.building || "",
      floor: room.floor?.toString() || "",
      capacity: room.capacity?.toString() || "",
      type: room.type || "",
      equipment: room.equipment?.join(", ") || "",
      availability: room.availability || {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
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
        equipment: formData.equipment
          ? formData.equipment.split(",").map((e) => e.trim()).filter((e) => e)
          : [],
      }
      if (editingRoom) {
        await axios.put(`http://localhost:5000/api/rooms/${editingRoom._id}`, payload)
      } else {
        await axios.post("http://localhost:5000/api/rooms", payload)
      }
      resetForm()
      setShowForm(false)
      fetchRooms()
    } catch (error) {
      console.error("Error saving room:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`)
      fetchRooms()
    } catch (error) {
      console.error("Error deleting room:", error)
    }
  }

  const addTimeSlot = () => {
    if (!newTimeSlot.start || !newTimeSlot.end) return
    const timeSlot = { start: newTimeSlot.start, end: newTimeSlot.end }
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [newTimeSlot.day]: [...prev.availability[newTimeSlot.day], timeSlot],
      },
    }))
    setNewTimeSlot({ day: newTimeSlot.day, start: "", end: "" })
  }

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].filter((_, i) => i !== index),
      },
    }))
  }

  const columns = [
    {
      key: "name",
      label: "Room Details",
      render: (room) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{room.name}</div>
          <div className="text-sm text-slate-500">
            {room.building}, Floor {room.floor}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (room) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
          {room.type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (room) => (
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Users className="h-3 w-3 text-blue-900" />
          {room.capacity}
        </div>
      ),
    },
    {
      key: "equipment",
      label: "Equipment",
      render: (room) => (
        <div className="flex flex-wrap gap-1 max-w-32">
          {room.equipment?.slice(0, 2).map((eq, index) => (
            <Badge key={index} className="bg-blue-50 text-blue-900 border-blue-100 text-xs">
              {eq}
            </Badge>
          ))}
          {room.equipment?.length > 2 && (
            <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
              +{room.equipment.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (room) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => handleEditRoom(room)}
          >
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteRoom(room._id)}
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
        <div className="text-center text-slate-600 font-medium">Loading facilities...</div>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive ? "bg-blue-900 text-white border-l-4 border-blue-600 shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
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
            <h1 className="text-3xl font-bold text-slate-900">Room Management</h1>
            <p className="text-slate-500">
              Configure classrooms, laboratories, and equipment availability.
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 shadow-sm transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" /> Add New Room
          </Button>
        </div>

        {/* Add/Edit Room Form */}
        {showForm && (
          <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-xl font-semibold text-slate-800">
                {editingRoom ? "Update Facility Details" : "Register New Facility"}
              </CardTitle>
              <CardDescription className="text-slate-500">
                Define spatial capacity and equipment specifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitRoom} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-semibold">Room Designation *</Label>
                    <Input
                      className="mt-1 border-slate-300 focus:border-blue-900 focus:ring-blue-900/10 placeholder:text-slate-400"
                      placeholder="e.g., Room A101"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold">Building / Wing *</Label>
                    <Input
                      className="mt-1 border-slate-300 focus:border-blue-900 focus:ring-blue-900/10"
                      placeholder="e.g., Science Block"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-700 font-semibold">Floor Level *</Label>
                    <Input
                      type="number"
                      className="mt-1 border-slate-300"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold">Seating Capacity *</Label>
                    <Input
                      type="number"
                      className="mt-1 border-slate-300"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-semibold">Facility Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="mt-1 border-slate-300">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-semibold">Inventory & Equipment</Label>
                  <Textarea
                    className="mt-1 border-slate-300 focus:border-blue-900"
                    placeholder="e.g., Projector, Smart Board, Workstations"
                    rows={2}
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  />
                </div>

                {/* Availability Section */}
                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-slate-800 font-bold mb-4 block">Scheduling Availability</Label>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500 uppercase">Day</Label>
                        <Select value={newTimeSlot.day} onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, day: value })}>
                          <SelectTrigger className="bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {weekDays.map((day) => (
                              <SelectItem key={day} value={day} className="capitalize">{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500 uppercase">Start Time</Label>
                        <Input type="time" className="bg-white border-slate-300" value={newTimeSlot.start} onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-500 uppercase">End Time</Label>
                        <Input type="time" className="bg-white border-slate-300" value={newTimeSlot.end} onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })} />
                      </div>
                      <Button type="button" onClick={addTimeSlot} className="bg-blue-900 hover:bg-blue-800 text-white">
                        Add Interval
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {weekDays.map((day) => formData.availability[day]?.length > 0 && (
                      <div key={day} className="flex items-center gap-4 p-2 bg-white border border-slate-100 rounded-md">
                        <span className="w-24 font-semibold text-blue-900 capitalize">{day}:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.availability[day].map((slot, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-700 border-slate-200">
                              <Clock className="h-3 w-3" /> {slot.start} - {slot.end}
                              <button type="button" onClick={() => removeTimeSlot(day, index)} className="ml-1 text-slate-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="submit" disabled={formLoading} className="bg-blue-900 text-white px-8">
                    {formLoading ? "Saving..." : editingRoom ? "Update Room" : "Save Room"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { resetForm(); setShowForm(false); }} className="text-slate-500">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Rooms List */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
                  <Building className="h-5 w-5 text-blue-900" />
                  Campus Facilities
                </CardTitle>
                <CardDescription className="text-slate-500">
                  {rooms.length} locations currently indexed in the system.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-md border border-slate-200">
              <DataTable data={rooms} columns={columns} searchKey="name" loading={loading} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}