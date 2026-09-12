import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAPE_TOWN_CENTER } from "../../taxi/mockData";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = L.divIcon({
  className: "taxi-driver-marker",
  html: '<div class="taxi-driver-marker-inner"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const pickupIcon = L.divIcon({
  className: "taxi-pickup-marker",
  html: '<div class="taxi-pickup-marker-inner"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
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
}) {
  const routeLatLngs = route.map((p) => [p.lat, p.lng]);

  return (
    <div className="taxi-map-wrap">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="taxi-map"
        zoomControl={false}
      >
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        {fitRoute && route.length > 0 && <FitBounds points={route} />}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
        )}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={defaultIcon} />
        )}
        {driverPos && (
          <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon} />
        )}
        {routeLatLngs.length > 1 && (
          <Polyline positions={routeLatLngs} pathOptions={{ color: "#1a1a1a", weight: 5, opacity: 0.85 }} />
        )}
      </MapContainer>
    </div>
  );
}
