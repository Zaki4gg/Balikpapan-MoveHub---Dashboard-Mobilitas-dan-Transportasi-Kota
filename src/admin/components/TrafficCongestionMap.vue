<template>
  <div class="h-[26rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Traffic Map</p>
        <h3 class="mt-1 font-bold text-slate-950">Jalur Kemacetan</h3>
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
import { trafficLocations } from '../../shared/data/mobilityData'

const mapContainer = ref(null)
let map

const legendItems = [
  { label: 'Kemacetan Berat', color: '#ef4444' },
  { label: 'Kemacetan Sedang', color: '#f59e0b' },
  { label: 'Lancar', color: '#10b981' }
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

const createMarkerElement = (location) => {
  const marker = document.createElement('div')
  marker.className = 'traffic-line-marker'
  marker.style.background = location.color
  marker.textContent = `${location.density}%`
  return marker
}

const addTrafficLayer = (location) => {
  const sourceId = `traffic-route-${location.id}`
  const layerId = `traffic-route-layer-${location.id}`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        name: location.name
      },
      geometry: {
        type: 'LineString',
        coordinates: location.segment
      }
    }
  })

  map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': location.color,
      'line-width': 8,
      'line-opacity': 0.82
    }
  })

  new maplibregl.Marker({
    element: createMarkerElement(location),
    anchor: 'bottom'
  })
    .setLngLat(location.coordinates)
    .setPopup(
      new maplibregl.Popup({ offset: 24 }).setHTML(`
        <div class="smart-map-popup">
          <strong>${location.name}</strong>
          <p>${location.description}</p>
          <p>Kepadatan ${location.density}% - ${location.avgSpeed} km/h</p>
        </div>
      `)
    )
    .addTo(map)
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.8333, -1.254],
    zoom: 12.5,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', () => {
    trafficLocations.forEach(addTrafficLayer)
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.traffic-line-marker {
  align-items: center;
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: flex;
  font-size: 11px;
  font-weight: 800;
  height: 38px;
  justify-content: center;
  width: 38px;
}
</style>
