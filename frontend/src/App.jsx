import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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

function App() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/places" element={<TouristPlaces />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Tourist Routes */}
        <Route element={<ProtectedRoute allowedRoles={['tourist']} />}>
          <Route index element={<TouristDashboard />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>

        {/* Hotel Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={['hotel_owner']} />}>
          <Route index element={<HotelOwnerDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route index element={<AdminDashboard />} />
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
