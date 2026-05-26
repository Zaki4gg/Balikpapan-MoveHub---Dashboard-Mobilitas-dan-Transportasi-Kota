<template>
  <div class="h-[28rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Transit Map</p>
        <h3 class="mt-1 font-bold text-slate-950">Rute dan Posisi Bacitra</h3>
      </div>

      <div class="absolute bottom-4 right-4 z-10 max-w-56 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <h3 class="mb-3 text-sm font-bold text-slate-950">Rute Aktif</h3>
        <div class="space-y-2 text-sm text-slate-600">
          <div v-for="route in transitRoutes" :key="route.id" class="flex items-center gap-2">
            <span :style="{ background: route.color }" class="h-3.5 w-3.5 rounded-full"></span>
            <span>{{ route.shortName }}</span>
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
import { activeBuses, transitRoutes } from '../../shared/data/mobilityData'

const mapContainer = ref(null)
let map

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

const createBusMarker = (bus) => {
  const marker = document.createElement('div')
  marker.className = bus.status.startsWith('Delayed') ? 'transit-bus-marker transit-bus-marker--delayed' : 'transit-bus-marker'
  marker.textContent = 'B'
  return marker
}

const addRouteLayer = (route) => {
  const sourceId = `transit-route-${route.id}`
  const layerId = `transit-route-layer-${route.id}`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        name: route.name
      },
      geometry: {
        type: 'LineString',
        coordinates: route.path
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
      'line-color': route.color,
      'line-width': 6,
      'line-opacity': route.status === 'active' ? 0.82 : 0.55
    }
  })
}

const addBusMarker = (bus) => {
  new maplibregl.Marker({
    element: createBusMarker(bus),
    anchor: 'bottom'
  })
    .setLngLat(bus.coordinates)
    .setPopup(
      new maplibregl.Popup({ offset: 26 }).setHTML(`
        <div class="smart-map-popup">
          <strong>${bus.number}</strong>
          <p>${bus.route} - ${bus.location}</p>
          <p>${bus.passengers}/${bus.capacity} penumpang - ETA ${bus.eta}</p>
          <p>Status: ${bus.status}</p>
        </div>
      `)
    )
    .addTo(map)
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.835, -1.254],
    zoom: 12.3,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', () => {
    transitRoutes.forEach(addRouteLayer)
    activeBuses.forEach(addBusMarker)
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.transit-bus-marker {
  align-items: center;
  background: #0ea5e9;
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: flex;
  font-size: 13px;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.transit-bus-marker--delayed {
  background: #f97316;
}
</style>
