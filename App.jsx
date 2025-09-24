import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import Forgot from "./pages/Forgot";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardMentor from "./pages/DashboardMentor";
import DashboardAdmin from "./pages/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import AddTest from "./pages/AddTest";
import ViewResult from "./pages/ViewResult";
import ViewReport from "./pages/ViewReport";
import ViewStudent from "./pages/ViewStudent";
import MyTests from "./pages/MyTests";
import MyScores from "./pages/MyScores";
import Achievements from "./pages/Achievements";
import TakeTest from "./pages/TakeTest";
import CreateTest from "./pages/CreateTest";
import Assignments from "./pages/Assignments";
import MentorAssignments from "./pages/MentorAssignments";
import MentorNotifications from "./pages/MentorNotifications";
import Dashboard from "./pages/Dashboard";
import ResultsPage from "./pages/ResultsPage";
import { validateTokenOnStartup } from './utils/tokenCleanup';




export default function App() {
  // Validate token on app startup
  useEffect(() => {
    validateTokenOnStartup();
  }, []);
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/admin-login" element={<AdminLogin />} />


        <Route path="/dashboard" element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        }/>

        <Route path="/dashboard/student" element={
          <ProtectedRoute roles={['student']}>
            <DashboardStudent />
          </ProtectedRoute>
        }/>

        <Route path="/dashboard/mentor" element={
          <ProtectedRoute roles={['mentor']}>
            <DashboardMentor />
          </ProtectedRoute>
        }/>

        <Route path="/dashboard/admin" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        }/>

          {/* Mentor-specific pages */}
  <Route path="/add-test" element={
    <ProtectedRoute roles={['mentor']}>
      <AddTest />
    </ProtectedRoute>
  }/>
  <Route path="/view-result" element={
    <ProtectedRoute roles={['mentor']}>
      <ViewResult />
    </ProtectedRoute>
  }/>
  <Route path="/view-report" element={
    <ProtectedRoute roles={['mentor']}>
      <ViewReport />
    </ProtectedRoute>
  }/>
  <Route path="/view-student" element={
    <ProtectedRoute roles={['mentor']}>
      <ViewStudent />
    </ProtectedRoute>
  }/>
  <Route path="/mentor/assignments" element={
    <ProtectedRoute roles={['mentor']}>
      <MentorAssignments />
    </ProtectedRoute>
  }/>
  <Route path="/mentor/notifications" element={
    <ProtectedRoute roles={['mentor']}>
      <MentorNotifications />
    </ProtectedRoute>
  }/>
  <Route path="/mentor/results" element={
    <ProtectedRoute roles={['mentor']}>
      <ResultsPage />
    </ProtectedRoute>
  }/>

  {/* student-specific pages */}

   <Route path="/my-tests" element={
    <ProtectedRoute roles={['student']}>
      <MyTests />
    </ProtectedRoute>
  } />
        <Route path="/my-scores" element={
    <ProtectedRoute roles={['student']}>
      <MyScores />
    </ProtectedRoute>
  } />
        <Route path="/achievements" element={
    <ProtectedRoute roles={['student']}>
      <Achievements />
    </ProtectedRoute>
  } />
        <Route path="/assignments" element={
    <ProtectedRoute roles={['student']}>
      <Assignments />
    </ProtectedRoute>
  } />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/take-test/:id" element={<TakeTest />} />
      </Routes>
    </>
  );
}
