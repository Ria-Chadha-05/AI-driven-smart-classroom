<div align="center">

# 🎓IntelliSched: AI-Driven Smart Classroom Timetable Generator

**An intelligent full-stack web application that automates university timetable creation using AI.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-4+-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [How It Works](#-how-the-ai-works) · [Architecture](#-architecture) · [Roadmap](#-roadmap)

</div>

---

## 📌 Overview

Creating university timetables manually is a time-consuming and error-prone process. Administrators must juggle dozens of constraints — faculty availability, room capacities, course requirements, and break periods — often resulting in conflicts, poor resource utilization, and significant administrative overhead.

**The AI-Driven Smart Classroom Timetable Generator** eliminates these challenges by combining a modern full-stack web application with an AI model to automatically produce **conflict-free, optimized weekly timetables** in seconds.

Administrators can manage all academic data through an intuitive dashboard, click a single button, and receive a complete, validated schedule — ready to use.

---

## ✨ Features

### 🤖 AI-Powered Timetable Generation
- Automatically generates complete weekly timetables using a large language model (Google Gemini / Groq / OpenAI)
- Matches courses to faculty based on **specialization**
- Ensures **zero conflicts** for faculty, rooms, and time slots
- Respects break periods and institutional constraints

### 📊 Admin Dashboard
- Live statistics: total courses, faculty, rooms, and timetable entries
- Clean, real-time data visualization powered by MongoDB

### 📚 Course Management
- Add, edit, and delete courses
- Configure credits, department, semester, weekly hours, and course type (lecture / lab / seminar)

### 👨‍🏫 Faculty Management
- Manage instructors with their specializations
- Set maximum weekly hours and course assignments

### 🏫 Room Management
- Track classrooms and labs
- Configure capacity, type, and available equipment

### 🔔 Notifications System
- Real-time alerts for timetable generation success or failure
- System event tracking and data validation warnings

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, ShadCN UI, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI Integration** | Groq |
| **Dev Tools** | Git, GitHub |

---

## 🏗 Architecture

The project follows a clean **three-layer full-stack architecture**:

```
AI-driven-smart-classroom/
│
├── backend/
│   ├── controllers/
│   │   └── timetableGenerator.js   # AI integration & generation logic
│   ├── models/                     # Mongoose schemas
│   ├── routes/                     # Express API routes
│   ├── utils/                      # Helper functions
│   ├── server.js                   # Entry point
│   └── .env                        # Environment variables (not committed)
│
├── frontend/
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── pages/                  # Dashboard, Courses, Faculty, Rooms
│       ├── App.jsx
│       └── main.jsx
│
└── package.json                    # Root scripts (runs both frontend + backend)
```

**Data Flow:**
```
React Frontend  ←→  Express REST API  ←→  MongoDB
                          ↕
                        Groq AI
```

---

## 🤖 How the AI Works

The timetable generation follows a structured pipeline:

```
1. Backend fetches all Courses, Faculty, and Rooms from MongoDB
        ↓
2. A detailed prompt is constructed containing:
   - Department & semester info
   - Available days & time slots
   - Mandatory break periods
   - Faculty specializations
   - Room capacities & types
        ↓
3. Prompt is sent to the AI model (Gemini / Groq / OpenAI)
        ↓
4. AI returns a structured JSON schedule
        ↓
5. Backend validates the output and enriches it with
   course names, faculty names, and room names
        ↓
6. Final timetable is saved to MongoDB and displayed on the dashboard
```

### Constraint Rules Enforced by AI

| Constraint | Description |
|---|---|
| Faculty Specialization | Faculty only assigned to courses matching their expertise |
| No Double-Booking | Faculty cannot teach two classes simultaneously |
| Room Availability | Rooms cannot host more than one class at a time |
| Weekly Session Requirements | Each course receives its required weekly sessions |
| Time Slot Restrictions | Classes scheduled only within predefined time slots |
| Break Periods | No classes scheduled during mandatory break hours |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v8 or higher
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- An AI API key (Google Gemini, Groq, or OpenAI)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-driven-smart-classroom.git
cd AI-driven-smart-classroom
```

---

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 3. Configure Environment Variables

Inside the `backend/` folder, create a `.env` file:

```bash
touch backend/.env
```

Add the following variables:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_ai_api_key
```

**Example:**

```env
PORT=5001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartclassroom
GOOGLE_API_KEY=your_gemini_api_key
```

---

### 4. Set Up the Database

In your [MongoDB Atlas](https://cloud.mongodb.com/) cluster, ensure the following collections exist:

```
courses
faculties
rooms
timetables
notifications
```

You can insert data manually using MongoDB Atlas or through the application UI.

⸻

🔒 Security Note

The .env file is not included in the repository to protect sensitive credentials.

Never commit:

.env
API keys
database passwords

Ensure .env is listed in .gitignore.

⸻

🚀 Example Workflow
	1.	Add courses in the Courses page
	2.	Add faculty and their specialization
	3.	Add rooms and facilities
	4.	Click Generate Timetable
	5.	AI produces a conflict-free schedule
	6.	Timetable is saved and displayed

⸻

🔮 Future Improvements
	•	Multi-department scheduling
	•	Advanced constraint optimization
	•	Faculty preference weighting
	•	Drag-and-drop timetable editor
	•	Export timetable as PDF
	•	Authentication system for administrators

⸻

🚀 Demo 



https://github.com/user-attachments/assets/98624e58-1e6b-4252-a47b-6134bb673773

