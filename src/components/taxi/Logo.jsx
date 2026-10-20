import React from "react";

export default function Logo({ theme = "light", className = "" }) {
  const src = theme === "dark" ? "/logo-white.png" : "/logo-black.png";
  return <img src={src} alt="UNICAB" className={`taxi-logo ${className}`.trim()} />;
}
