import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface NoiseDataItem {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  date: string;
  morning: number;
  afternoon: number;
  evening: number;
}

interface NoiseMapProps {
  data: NoiseDataItem[]
  threshold: number
  onMarkerClick: (place: NoiseDataItem) => void
}

const PALGHAR_CENTER = [19.6967, 72.7699] // Approximate center of Palghar

export default function NoiseMap({ data, threshold, onMarkerClick }: NoiseMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(PALGHAR_CENTER, 11)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add new markers
    const markers = data.map((item) => {
      const avgNoise = (item.morning + item.afternoon + item.evening) / 3
      const color = avgNoise > threshold ? 'red' : 'green'
      const marker = L.circleMarker([item.lat, item.lng], {
        radius: 8,
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)

      marker.bindPopup(`
        <strong>${item.name}</strong><br>
        Type: ${item.type}<br>
        Date: ${item.date}<br>
        Avg. Noise: ${avgNoise.toFixed(2)} dB
      `)

      marker.on('click', () => {
        onMarkerClick(item)
      })

      return marker
    })

    // Fit the map to the markers
    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }

  }, [data, threshold, onMarkerClick])

  return (
    <div id="map" style={{ height: '100%', width: '100%' }}>
      {data.length === 0 && (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
          No data available for the selected criteria
        </div>
      )}
    </div>
  )
}

