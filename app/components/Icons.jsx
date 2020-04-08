import React from 'react'

export function MapPin ({ className, label }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`map-pin ${className}`}
      viewBox="0 0 128 128"
    >
      <path d="M64 128a6.9 6.9 0 01-4.89-2L26.23 93.12A55.05 55.05 0 0110 53.69a53.29 53.29 0 0115.87-38.11 54.56 54.56 0 0176.26 0A53.29 53.29 0 01118 53.69a55.05 55.05 0 01-16.23 39.43l-32.88 32.82A6.9 6.9 0 0164 128z"></path>
      {label
        ? <text x="64" y="64">{label}</text>
        : <path d="M64 81.41a27.25 27.25 0 1119.3-8 27.23 27.23 0 01-19.3 8z"></path>}
    </svg>
  )
}
