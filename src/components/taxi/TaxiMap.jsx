import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAPE_TOWN_CENTER } from "../../taxi/mockData";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const pickupIcon = L.divIcon({
  className: "taxi-marker",
  html: '<div class="taxi-marker-pickup"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffIcon = L.divIcon({
  className: "taxi-marker",
  html: '<div class="taxi-marker-dropoff"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const driverIcon = L.divIcon({
  className: "taxi-marker",
  html: '<div class="taxi-marker-driver"><span>U</span></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 120);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return undefined;
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    const apply = () => {
      const wide = window.innerWidth >= 960;
      map.fitBounds(bounds, {
        paddingTopLeft: wide ? [460, 88] : [28, 78],
        paddingBottomRight: wide ? [48, 48] : [28, 320],
        maxZoom: 15,
        animate: false,
      });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [map, points]);
  return null;
}

export default function TaxiMap({
  center = CAPE_TOWN_CENTER,
  zoom = 13,
  pickup,
  dropoff,
  driverPos,
  route = [],
  fitRoute = false,
  theme = "light",
}) {
  const routeLatLngs = route.map((point) => [point.lat, point.lng]);
  const line = theme === "dark" ? "#C9A86A" : "#7A6430";

  return (
    <div className="taxi-map-wrap">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="taxi-map"
        zoomControl={false}
        attributionControl
        aria-label="Sample map of Cape Town"
      >
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        {fitRoute && route.length > 0 && <FitBounds points={route} />}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} alt="Pickup" />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} alt="Drop-off" />}
        {driverPos && (
          <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon} alt="Sample partner" />
        )}
        {routeLatLngs.length > 1 && (
          <Polyline positions={routeLatLngs} pathOptions={{ color: line, weight: 5, opacity: 0.95 }} />
        )}
      </MapContainer>
    </div>
  );
}
