# HappyDent Dental Clinic

Welcome to the HappyDent Dental Clinic project! This repository contains both the backend and frontend components of the application. 

The project is built using a modern web development stack:
- **Backend:** Django (Python) and Django REST Framework
- **Frontend:** React (JavaScript)

## 📁 File Structure

Here is a high-level overview of the project structure:

```text
HappyDent Dental Clinic/
├── backend/                  # Django backend application
│   ├── assets/               # Static assets for backend
│   ├── happydentApi/         # Django app containing API views and logic
│   ├── happydentback/        # Core Django project settings and routing
│   ├── templates/            # HTML templates for Django (if any)
│   ├── manage.py             # Django command-line utility
│   └── requirements.txt      # Python dependencies for the backend
│
└── frontend/                 # React frontend application
    └── happydentfront/       # Main React project directory
        ├── public/           # Public static files (index.html, icons, etc.)
        ├── src/              # React source code (components, pages, styles)
        └── package.json      # Node.js dependencies and scripts
```

## 🚀 Installation & Setup Guide

Follow the instructions below to get the project up and running on your local machine.

### Prerequisites

Make sure you have the following installed on your system:
- **Python** (version 3.10 or higher recommended)
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

---

### 1. Setting up the Backend (Django)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the backend development server:**
   ```bash
   python manage.py runserver
   ```
   *The backend will typically be accessible at `http://127.0.0.1:8000/`*

---

### 2. Setting up the Frontend (React)

1. **Open a new terminal window** (keep the backend server running in the first one).

2. **Navigate to the frontend project directory:**
   ```bash
   cd frontend/happydentfront
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

4. **Start the frontend development server:**
   ```bash
   npm start
   ```
   *The frontend will typically open in your browser automatically at `http://localhost:3000/`*

## 🛠️ Usage

Once both servers are running:
- The React application (Frontend) will serve as the user interface.
- It will automatically communicate with the Django REST API (Backend) to fetch and save data.

## 🤝 Need Help?
If you encounter any issues during setup, ensure that you are in the correct directory when running commands, and verify that both Python and Node.js are correctly added to your system's PATH.
