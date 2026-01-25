import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// import AppLayout from "@/components/sidebar/AppLayout";
import HomePage from "@/pages/Index";
// import Auth from "@/pages/public/Auth";
// import Dashboard from "@/pages/client/Dashboard/Dashboard";
// import Facilities from "@/pages/client/Facilities/Facilities";
// import FacilityDetail from "@/pages/client/Facilities/FacilityDetail";
// import Profile from "@/pages/client/Profile/Profile"
// import Courses from "@/pages/client/Courses/Courses"
// import CourseDetail from "@/pages/client/Courses/CourseDetail"
// import ChildrensProfiles from "@/pages/client/Profile/ChildrensProfiles"
// import AdminDashboard from "@/pages/admin/AdminDashboard";
// import AdminFacilities from "@/pages/admin/AdminFacilities";
// import AdminSchedules from "@/pages/admin/reservationsAdmin/AdminSchedules"
// import AdminReservations from "@/pages/admin/reservationsAdmin/AdminReservations"
// import AdminCourses from "@/pages/admin/coursesAdmin/AdminCourses"
// import AdminInstructors from "@/pages/admin/coursesAdmin/AdminInstructors"
// import CourseSlots from "@/pages/admin/coursesAdmin/AdminCourseSlots"
// import NotFound from "@/pages/public/NotFound";

// import ProtectedRoute from "./protected.route";
// import AdminRoute from "./admin.route";
import { RefreshCw } from "lucide-react";

const AppRoutes = () => {
  const { session, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route
        path="/auth"
        element={
          session
            ? (console.log("Tienes acceso desde routes"),
              (<Navigate to="/dashboard" replace />))
            : (console.log("No tienes acceso desde routes"), (<Auth />))
        }
      /> */}
      {/* Rutas protegidas con sidebar */}
      {/* <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:type/:id" element={<FacilityDetail/>} />
        <Route path="/courses" element={<Courses/>} />
        <Route path="/courses/:id" element={<CourseDetail/>} />
        <Route path="/enrolments" element={<h1>Manejar inscripciones</h1>} />
        <Route path="/profile/childrens" element={<ChildrensProfiles/>} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/facilities"
          element={
            <AdminRoute>
              <AdminFacilities />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <AdminRoute>
              <AdminSchedules/>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <AdminRoute>
              <AdminReservations/>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <AdminCourses/>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses/:id"
          element={
            <AdminRoute>
              <CourseSlots/>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/enrolments"
          element={
            <AdminRoute>
              <h1>Admin inscripciones</h1>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/instructors"
          element={
            <AdminRoute>
              <AdminInstructors/>
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

export default AppRoutes;
