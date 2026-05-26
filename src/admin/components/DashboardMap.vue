<template>
  <div class="h-[30rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">MapLibre</p>
        <h3 class="mt-1 font-bold text-slate-950">Balikpapan</h3>
      </div>

      <div class="absolute bottom-4 right-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <h3 class="mb-3 text-sm font-bold text-slate-950">Legenda</h3>
        <div class="space-y-2 text-sm text-slate-600">
          <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-2">
            <span :style="{ background: item.color }" class="h-3.5 w-3.5 rounded-full"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const mapContainer = ref(null)
let map

const legendItems = [
  { label: 'Kemacetan Berat', color: '#f43f5e' },
  { label: 'Kemacetan Sedang', color: '#f59e0b' },
  { label: 'Lancar', color: '#10b981' },
  { label: 'Armada Bacitra', color: '#0ea5e9' }
]

const trafficMarkers = [
  {
    coordinates: [116.8333, -1.2667],
    title: 'MT Haryono Simpang Wika',
    description: 'Kemacetan Berat (85%)',
    label: 'K',
    color: '#f43f5e'
  },
  {
    coordinates: [116.85, -1.25],
    title: 'Jl. Soekarno Hatta',
    description: 'Kemacetan Sedang (65%)',
    label: 'S',
    color: '#f59e0b'
  },
  {
    coordinates: [116.82, -1.24],
    title: 'Jl. Ahmad Yani',
    description: 'Lancar (35%)',
    label: 'L',
    color: '#10b981'
  }
]

const fleetMarkers = [
  { coordinates: [116.8334, -1.2666], title: 'BLK-001', description: 'Bacitra Route 1 - Terminal Pusat' },
  { coordinates: [116.845, -1.255], title: 'BLK-002', description: 'Bacitra Route 1 - Grand City' },
  { coordinates: [116.825, -1.245], title: 'BLK-003', description: 'Bacitra Route 3 - Rumah Sakit' },
  { coordinates: [116.84, -1.238], title: 'BLK-004', description: 'Bacitra Route 4 - Stasiun' }
]

const mapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
}

const createMarkerElement = ({ color, label }) => {
  const marker = document.createElement('div')
  marker.className = 'smart-map-marker'
  marker.style.background = color
  marker.textContent = label
  return marker
}

const addMarker = ({ marker, color = '#0ea5e9', label = 'B' }) => {
  new maplibregl.Marker({
    element: createMarkerElement({ color, label }),
    anchor: 'bottom'
  })
    .setLngLat(marker.coordinates)
    .setPopup(
      new maplibregl.Popup({ offset: 28 }).setHTML(`
        <div class="smart-map-popup">
          <strong>${marker.title}</strong>
          <p>${marker.description}</p>
        </div>
      `)
    )
    .addTo(map)
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.8333, -1.2667],
    zoom: 12,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  trafficMarkers.forEach((marker) => {
    addMarker({ marker, color: marker.color, label: marker.label })
  })

  fleetMarkers.forEach((marker) => {
    addMarker({ marker })
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.smart-map-marker {
  align-items: center;
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: flex;
  font-size: 12px;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.smart-map-popup {
  color: #0f172a;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  min-width: 180px;
}

.smart-map-popup p {
  color: #475569;
  margin: 6px 0 0;
}
</style>
