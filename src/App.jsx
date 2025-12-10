import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import Vehicles from "./pages/Vehicles";
import Drivers from "./pages/Drivers";
import Reviews from "./pages/Reviews";
import Membership from "./pages/Membership";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/membership" element={<Membership />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
