# Smart Test Center (STC) - Enhanced Version

A comprehensive online testing platform with advanced features for students, mentors, and administrators.

## 🚀 Features

### For Students
- **Dashboard**: Track test progress, attempted tests, and average scores
- **Test Taking**: Enhanced test interface with proper question display and navigation
- **Assignments**: View and download PDF assignments from mentors
- **Notifications**: Receive and react to notifications from mentors
- **Profile Management**: Update personal information and profile picture
- **Test Results**: View detailed test scores and performance analytics

### For Mentors
- **Enhanced Dashboard**: Comprehensive tracking of tests, students, assignments, and notifications
- **Test Creation**: Create tests with MCQ, coding, and long answer questions
- **Assignment Management**: Upload and manage PDF assignments for students
- **Notification System**: Send targeted notifications to students with priority levels
- **Student Results**: View detailed student performance with search and filtering
- **Analytics**: Track engagement through read rates and reaction statistics

### For Administrators
- **User Management**: Manage students and mentors
- **System Analytics**: Overall platform statistics and insights

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with modern hooks
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons
- **Tailwind CSS** for styling

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **npm** or **yarn** package manager

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd STC
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/stc-database
JWT_SECRET=your-secret-key-here
JWT_EXPIRES=7d
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Create Upload Directories
```bash
# From backend directory
mkdir -p uploads/assignments
mkdir -p uploads
```

## 🚀 Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
# or
npm start
```
The backend server will run on `http://localhost:5000`

### Start the Frontend
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## 📊 Database Setup

### Create Admin User
Run the seed script to create an admin user:
```bash
cd backend
node seedAdmin.js
```

Default admin credentials:
- **Email**: admin@stc.com
- **Password**: admin123

### Sample Data
The application will work with empty data, but you can create:
1. Register mentor and student accounts
2. Create tests as a mentor
3. Take tests as a student
4. Upload assignments and send notifications

## 🌟 New Features Added

### 1. Assignment System
- **PDF Upload**: Mentors can upload PDF assignments
- **Student Access**: Students can view and download assignments
- **Due Date Tracking**: Visual indicators for upcoming and overdue assignments

### 2. Notification System
- **Rich Notifications**: Support for different types and priority levels
- **Student Reactions**: Students can react with emoji responses
- **Read Tracking**: Monitor notification engagement
- **Expiration Dates**: Set automatic expiration for time-sensitive notifications

### 3. Enhanced Dashboards
- **Student Dashboard**: 
  - Test tracking (total, attempted, average score)
  - Quick access to assignments and notifications
  - Improved profile editing
- **Mentor Dashboard**:
  - Comprehensive analytics (tests, students, assignments, notifications)
  - Quick action buttons for all mentor functions

### 4. Improved Test Taking
- **Better Question Display**: Fixed question rendering issues
- **Enhanced Navigation**: Improved question navigation and progress tracking
- **Proper Authentication**: Secure test access with proper user validation

### 5. Advanced Result Management
- **Search & Filter**: Find specific student results by name or test
- **Performance Analytics**: Visual indicators and grade calculations
- **Export Functionality**: Download results as CSV
- **Detailed View**: Modal with comprehensive submission details

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Tests
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create new test
- `GET /api/tests/:id` - Get test by ID

### Assignments
- `GET /api/assignments/student` - Get student assignments
- `GET /api/assignments/mentor` - Get mentor assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/download/:id` - Download assignment PDF

### Notifications
- `GET /api/notifications/student` - Get student notifications
- `GET /api/notifications/mentor` - Get mentor notifications
- `POST /api/notifications` - Send notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/:id/reaction` - Add reaction

### Submissions
- `POST /api/submissions/:testId/submit` - Submit test
- `GET /api/submissions/mentor` - Get mentor's test submissions

## 🎨 UI/UX Improvements

- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Smooth Animations**: Framer Motion for enhanced user experience
- **Visual Feedback**: Progress indicators, status badges, and color-coded elements
- **Mobile Responsive**: Works seamlessly on all device sizes

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Protected routes based on user roles
- **File Upload Security**: PDF-only uploads with size limits
- **Input Validation**: Comprehensive data validation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGO_URI in .env file

2. **File Upload Issues**
   - Verify upload directories exist
   - Check file permissions

3. **Authentication Problems**
   - Clear browser localStorage
   - Check JWT_SECRET in .env

4. **CORS Errors**
   - Ensure frontend URL is correct in backend CORS config

## 📝 Usage Guide

### For Students
1. **Register/Login** with student role
2. **View Dashboard** to see available tests and assignments
3. **Take Tests** by clicking on available tests
4. **Check Results** in the My Scores section
5. **View Assignments** in the Assignments tab
6. **Read Notifications** and react to them

### For Mentors
1. **Register/Login** with mentor role
2. **Create Tests** using the enhanced test creation interface
3. **Upload Assignments** with PDF files and due dates
4. **Send Notifications** to students with different priority levels
5. **View Results** with advanced filtering and search
6. **Track Analytics** on the dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions, please create an issue in the repository or contact the development team.

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Developer**: STC Development Team