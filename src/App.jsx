import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import TourBooking from "./pages/TourBooking";
import DriverSelection from "./pages/DriverSelection";
import TourTransaction from "./pages/TourTransaction";
import TourCheckout from "./pages/TourCheckout";
import TourConfirmation from "./pages/TourConfirmation";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Reviews from "./pages/Reviews";
import ReviewThankYou from "./pages/ReviewThankYou";
import Membership from "./pages/Membership";
import MembershipComparison from "./pages/MembershipComparison";
import MembershipTransaction from "./pages/MembershipTransaction";
import MembershipSuccess from "./pages/MembershipSuccess";
import Login from "./pages/Login";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/tours/:id/booking" element={<TourBooking />} />
        <Route path="/tours/:id/drivers" element={<DriverSelection />} />
        <Route path="/tours/:id/transaction" element={<TourTransaction />} />
        <Route path="/tours/:id/checkout" element={<TourCheckout />} />
        <Route path="/tours/:id/confirmation" element={<TourConfirmation />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/review/thank-you" element={<ReviewThankYou />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/membership/comparison" element={<MembershipComparison />} />
        <Route path="/membership/transaction/:planId" element={<MembershipTransaction />} />
        <Route path="/membership/success" element={<MembershipSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/driver/dashboard" 
          element={
            <ProtectedRoute requiredRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
