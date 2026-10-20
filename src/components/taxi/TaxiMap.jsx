import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAPE_TOWN_CENTER } from "../../taxi/mockData";

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

function pinIcon(label, kind) {
  return L.divIcon({
    className: "taxi-marker",
    html: `<div class="taxi-pin taxi-pin-${kind}"><span class="taxi-pin-label">${escapeHtml(label)}</span><span class="taxi-pin-dot"></span></div>`,
    iconSize: [168, 48],
    iconAnchor: [84, 44],
  });
}

function carIcon(bearing) {
  return L.divIcon({
    className: "taxi-marker",
    html: `<div class="taxi-marker-car" style="transform:rotate(${bearing}deg)"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="9" y="5" width="14" height="22" rx="5" fill="#141414" stroke="#C9A86A" stroke-width="1.6"/><rect x="12" y="8.5" width="8" height="6" rx="1.4" fill="#C9A86A"/><rect x="12" y="18" width="8" height="3.2" rx="1" fill="#F6F3EC"/></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

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
        paddingTopLeft: wide ? [460, 96] : [36, 88],
        paddingBottomRight: wide ? [56, 56] : [36, 340],
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
  pickupLabel,
  dropoffLabel,
  driverPos,
  bearing = 0,
  route = [],
  fitRoute = false,
  theme = "light",
}) {
  const routeLatLngs = route.map((point) => [point.lat, point.lng]);
  const line = theme === "dark" ? "#C9A86A" : "#7A6430";
  const snapped = Math.round(bearing / 15) * 15;
  const car = useMemo(() => carIcon(snapped), [snapped]);
  const pickupMarker = useMemo(
    () => (pickup ? pinIcon(pickupLabel || "Pickup", "pickup") : null),
    [pickup, pickupLabel]
  );
  const dropoffMarker = useMemo(
    () => (dropoff ? pinIcon(dropoffLabel || "Drop-off", "dropoff") : null),
    [dropoff, dropoffLabel]
  );

  return (
    <div className="taxi-map-wrap">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="taxi-map"
        zoomControl={false}
        attributionControl
        aria-label="Map of Cape Town"
      >
        <TileLayer
          key={theme}
          attribution={CARTO_ATTRIBUTION}
          url={TILES[theme] || TILES.light}
          subdomains="abcd"
        />
        <MapResizeFix />
        {fitRoute && route.length > 0 && <FitBounds points={route} />}
        {pickup && pickupMarker && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupMarker} alt={pickupLabel || "Pickup"} />
        )}
        {dropoff && dropoffMarker && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffMarker} alt={dropoffLabel || "Drop-off"} />
        )}
        {driverPos && (
          <Marker position={[driverPos.lat, driverPos.lng]} icon={car} alt="UNICAB partner" />
        )}
        {routeLatLngs.length > 1 && (
          <Polyline positions={routeLatLngs} pathOptions={{ color: line, weight: 5, opacity: 0.95 }} />
        )}
      </MapContainer>
    </div>
  );
}
