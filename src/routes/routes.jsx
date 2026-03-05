import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// import AppLayout from "@/components/sidebar/AppLayout";
import HomePage from "@/pages/Index";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/sidebar/AppLayout";
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
import MyReservations from "@/pages/user/MyReservations";
import MyProfile from "@/pages/user/MyProfile";
import FamilyMembers from "@/pages/user/FamilyMembers";
import CoursesCatalog from "@/pages/user/CoursesCatalog";
import MyEnrolments from "@/pages/user/MyEnrolments";
// import AdminSchedules from "@/pages/admin/reservationsAdmin/AdminSchedules"
// import AdminReservations from "@/pages/admin/reservationsAdmin/AdminReservations"
import AdminCourses from "@/pages/admin/coursesAdmin/AdminCourses"
import AdminCourseSlots from "@/pages/admin/coursesAdmin/AdminCourseSlots"
// import AdminInstructors from "@/pages/admin/coursesAdmin/AdminInstructors"
// import CourseSlots from "@/pages/admin/coursesAdmin/AdminCourseSlots"
// import NotFound from "@/pages/public/NotFound";

// import ProtectedRoute from "./protected.route";
// import AdminRoute from "./admin.route";
import { RefreshCw } from "lucide-react";
import UsersManagement from "@/pages/admin/UsersManagement";
import AdminFacilities from "@/pages/admin/AdminFacilities";
import MembershipsManager from "@/components/admin/memberships/MembershipsManager";
import ReservationsManagement from "@/pages/admin/ReservationsManagement";
import PaymentsManagement from "@/pages/admin/PaymentsManagement";
import SubscriptionsManagement from "@/pages/admin/SubscriptionsManagement";
import AdminEnrolments from "@/pages/admin/AdminEnrolments";
import AdminDashboard from "@/pages/admin/AdminDashboard";

import MembershipsPage from "@/pages/user/MembershipsPage";

const AppRoutes = () => {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/auth/login"
        element={session ? <Navigate to="/" replace /> : <LoginForm />}
      />
      <Route
        path="/auth/register"
        element={session ? <Navigate to="/" replace /> : <SignupForm />}
      />
      {/* Rutas protegidas con sidebar */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<>gfdgfd</>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/facilities" element={<AdminFacilities />} />
          <Route path="/admin/memberships" element={<MembershipsManager />} />
          <Route path="/admin/reservations" element={<ReservationsManagement />} />
          <Route path="/admin/payments" element={<PaymentsManagement />} />
          <Route path="/admin/subscriptions" element={<SubscriptionsManagement />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/courses/:id/slots" element={<AdminCourseSlots />} />
          <Route path="/admin/enrolments" element={<AdminEnrolments />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/profile/family" element={<FamilyMembers />} />
          <Route path="/dashboard/courses" element={<CoursesCatalog />} />
          <Route path="/dashboard/enrolments" element={<MyEnrolments />} />
          {/* <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:type/:id" element={<FacilityDetail/>} />
        <Route path="/courses" element={<Courses/>} />
        <Route path="/courses/:id" element={<CourseDetail/>} />
        <Route path="/enrolments" element={<h1>Manejar inscripciones</h1>} />
        <Route path="/profile/childrens" element={<ChildrensProfiles/>} /> */}
          {/* <Route
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
        /> */}
        </Route>
      </Route>
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
};

export default AppRoutes;
