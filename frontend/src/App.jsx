import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthContext } from './context/AuthContext';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TouristPlaces } from './pages/TouristPlaces';
import { Hotels } from './pages/Hotels';
import { HotelDetails } from './pages/HotelDetails';

// Dashboard / Protected Pages
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { TouristDashboard } from './pages/TouristDashboard';
import { MyBookings } from './pages/MyBookings';
import { Favorites } from './pages/Favorites';
import { AITripPlanner } from './pages/AITripPlanner';
import { HotelOwnerDashboard } from './pages/HotelOwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Booking } from './pages/Booking';
import { PlaceDetails } from './pages/PlaceDetails';

const DashboardSelector = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "tourist") return <TouristDashboard />;
  if (user.role === "hotel_owner") return <HotelOwnerDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/places" element={<TouristPlaces />} />
        <Route path="/places/:id" element={<PlaceDetails />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path='/hotel/dash' element={<HotelOwnerDashboard />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Role-based Dashboard Index */}
        <Route element={<ProtectedRoute allowedRoles={['tourist', 'hotel_owner', 'admin']} />}>
          <Route index element={<DashboardSelector />} />
        </Route>

        {/* Tourist Routes */}
        <Route element={<ProtectedRoute allowedRoles={['tourist']} />}>
          <Route path="bookings" element={<MyBookings />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>

        {/* Hotel Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={['hotel_owner']} />}>
          <Route path="my-hotels" element={<HotelOwnerDashboard />} />
          <Route path="hotel-bookings" element={<HotelOwnerDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          {/* Admin index is handled by selector, additional admin pages can go here */}
        </Route>

        {/* Common Dashboard Routes */}
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* AI Planner Route */}
      {/* <Route path="/planner" element={
        <ProtectedRoute allowedRoles={['tourist']}>
          <MainLayout>
            <AITripPlanner />
          </MainLayout>
        </ProtectedRoute>
      } /> */}


      <Route element={<ProtectedRoute allowedRoles={['tourist']} />}>
        <Route path="/planner" element={<AITripPlanner />} />
      </Route>
      {/* Booking Route */}
      {/* <Route path="/book/:hotelId" element={

        <Booking />

      } /> */}
      <Route element={<ProtectedRoute allowedRoles={['tourist']} />}>
        <Route path="/book/:hotelId/:roomId" element={<Booking />} />
      </Route>


    </Routes>
  );
}

export default App;
