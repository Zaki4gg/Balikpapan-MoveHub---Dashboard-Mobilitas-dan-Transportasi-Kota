<template>
  <div class="card h-[28rem] overflow-hidden">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Transit Map</p>
        <h3 class="mt-1 font-bold text-slate-950">Rute dan Posisi Bacitra</h3>
        <p class="mt-1 text-xs font-semibold text-slate-500">OSRM/OSM GeoJSON lokal</p>
      </div>

      <div class="absolute bottom-4 right-4 z-10 max-w-56 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <h3 class="mb-3 text-sm font-bold text-slate-950">Rute Aktif</h3>
        <div class="space-y-2 text-sm text-slate-600">
          <div v-for="route in routes" :key="route.id" class="flex items-center gap-2">
            <span :style="{ background: route.color }" class="h-3.5 w-3.5 rounded-full"></span>
            <span>{{ route.shortName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { activeBuses, transitRoutes } from '../../shared/data/mobilityData'
import { emptyTransitNetwork } from '../../shared/data/roadNetworkData.js'

const props = defineProps({
  routes: {
    type: Array,
    default: () => transitRoutes
  },
  buses: {
    type: Array,
    default: () => activeBuses
  },
  transitNetwork: {
    type: Object,
    default: () => emptyTransitNetwork
  }
})

const mapContainer = ref(null)
let map
let busMarkers = []
let routeLayers = []

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

const routeFeatureByRouteId = () => new Map(
  (props.transitNetwork?.features || []).map((feature) => [feature.properties?.routeId, feature])
)

const routeGeometry = (route) => {
  const feature = routeFeatureByRouteId().get(route.id)
  return feature?.geometry?.coordinates?.length ? feature.geometry.coordinates : route.path || []
}

const nearestRouteCoordinate = (bus) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? routeGeometry(route) : []

  if (!path.length) {
    return bus.coordinates
  }

  return path.reduce((nearest, coordinate) => {
    const distance = Math.hypot(coordinate[0] - bus.coordinates[0], coordinate[1] - bus.coordinates[1])
    return distance < nearest.distance ? { coordinate, distance } : nearest
  }, { coordinate: path[0], distance: Infinity }).coordinate
}

const createBusMarker = (bus) => {
  const marker = document.createElement('button')
  marker.className = bus.status.startsWith('Delayed') ? 'transit-bus-marker transit-bus-marker--delayed' : 'transit-bus-marker'
  marker.textContent = 'B'
  marker.type = 'button'
  marker.setAttribute('aria-label', `${bus.number}, ${bus.route}, ${bus.status}`)
  return marker
}

const clearMapLayers = () => {
  busMarkers.forEach((marker) => marker.remove())
  busMarkers = []

  routeLayers.forEach(({ layerIds, sourceId }) => {
    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  })
  routeLayers = []
}

const fitBounds = () => {
  const bounds = new maplibregl.LngLatBounds()

  props.routes.forEach((route) => {
    routeGeometry(route).forEach((coordinate) => bounds.extend(coordinate))
  })

  props.buses.forEach((bus) => bounds.extend(nearestRouteCoordinate(bus)))

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 70, right: 110, bottom: 70, left: 110 },
      maxZoom: 14.5,
      duration: 700
    })
  }
}

const addRouteLayer = (route) => {
  const path = routeGeometry(route)

  if (!path.length) {
    return
  }

  const sourceId = `transit-route-${route.id}`
  const casingLayerId = `transit-route-casing-${route.id}`
  const layerId = `transit-route-layer-${route.id}`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        name: route.name,
        status: route.status
      },
      geometry: {
        type: 'LineString',
        coordinates: path
      }
    }
  })

  map.addLayer({
    id: casingLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#ffffff',
      'line-width': 11,
      'line-opacity': 0.9
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
      'line-width': 5,
      'line-opacity': route.status === 'active' ? 0.88 : 0.62
    }
  })

  routeLayers.push({ layerIds: [layerId, casingLayerId], sourceId })
}

const addBusMarker = (bus) => {
  const marker = new maplibregl.Marker({
    element: createBusMarker(bus),
    anchor: 'center'
  })
    .setLngLat(nearestRouteCoordinate(bus))
    .setPopup(
      new maplibregl.Popup({ offset: 22 }).setHTML(`
        <div class="smart-map-popup">
          <strong>${bus.number}</strong>
          <p>${bus.route} - ${bus.location}</p>
          <p>${bus.passengers}/${bus.capacity} penumpang - ETA ${bus.eta}</p>
          <p>Status: ${bus.status}</p>
        </div>
      `)
    )
    .addTo(map)

  busMarkers.push(marker)
}

const renderMapLayers = () => {
  if (!map || !map.loaded()) {
    return
  }

  clearMapLayers()
  props.routes.forEach(addRouteLayer)
  props.buses.forEach(addBusMarker)
  fitBounds()
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.846, -1.249],
    zoom: 13.4,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', renderMapLayers)
})

watch(
  () => [props.routes, props.buses, props.transitNetwork],
  () => renderMapLayers(),
  { deep: true }
)

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
  cursor: pointer;
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
