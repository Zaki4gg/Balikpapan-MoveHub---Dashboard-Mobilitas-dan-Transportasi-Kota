<template>
  <div class="card h-[30rem] overflow-hidden">
    <div class="relative h-full">
      <div ref="mapContainer" class="h-full w-full"></div>

      <div class="absolute left-4 top-4 z-10 rounded-xl border border-cyan-200/60 bg-white/95 p-4 shadow-lg backdrop-blur">
        <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{{ eyebrow }}</p>
        <h3 class="mt-1 font-bold text-slate-950">{{ title }}</h3>
        <p class="mt-1 text-xs font-semibold text-slate-500">{{ subtitle }}</p>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { activeBuses, trafficLocations, transitRoutes } from '../../shared/data/mobilityData'
import { emptyRoadNetwork, emptyTransitNetwork } from '../../shared/data/roadNetworkData.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'overview'
  },
  traffic: {
    type: Array,
    default: () => trafficLocations
  },
  roadNetwork: {
    type: Object,
    default: () => emptyRoadNetwork
  },
  routes: {
    type: Array,
    default: () => transitRoutes
  },
  transitNetwork: {
    type: Object,
    default: () => emptyTransitNetwork
  },
  buses: {
    type: Array,
    default: () => activeBuses
  },
  userLocation: {
    type: Object,
    default: null
  }
})

const mapContainer = ref(null)
let map
let markers = []
let activeLayers = []
let markerAnimations = new Set()

const title = computed(() => {
  if (props.mode === 'traffic') {
    return 'Jalur Kemacetan'
  }

  if (props.mode === 'transit') {
    return 'Rute Bacitra'
  }

  return 'Balikpapan'
})

const eyebrow = computed(() => {
  if (props.mode === 'traffic') {
    return 'B-Connect'
  }

  if (props.mode === 'transit') {
    return 'Bacitra'
  }

  return 'MapLibre'
})

const subtitle = computed(() => {
  if (props.mode === 'traffic') {
    return 'Kondisi ruas'
  }

  if (props.mode === 'transit') {
    return 'Rute dan posisi armada simulasi'
  }

  return 'OSM GeoJSON lokal'
})

const legendItems = computed(() => {
  if (props.mode === 'transit') {
    return [
      ...props.routes.map((route) => ({ label: route.shortName, color: route.color })),
      { label: 'Armada Bacitra', color: '#0ea5e9' }
    ]
  }

  return [
    { label: 'Kemacetan Berat', color: '#ef4444' },
    { label: 'Kemacetan Sedang', color: '#f59e0b' },
    { label: 'Lancar', color: '#10b981' }
  ]
})

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

const roadFeatureById = () => new Map((props.roadNetwork?.features || []).map((feature) => [feature.id, feature]))
const transitFeatureByRouteId = () => new Map((props.transitNetwork?.features || []).map((feature) => [feature.properties?.routeId, feature]))

const trafficSegment = (location) => {
  const feature = roadFeatureById().get(location.roadFeatureId)
  return feature?.geometry?.coordinates?.length ? feature.geometry.coordinates : location.segment || []
}

const transitSegment = (route) => {
  if (route.path?.length) {
    return route.path
  }

  const feature = transitFeatureByRouteId().get(route.id)
  return feature?.geometry?.coordinates?.length ? feature.geometry.coordinates : route.path || []
}

const nearestRouteCoordinate = (bus) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? transitSegment(route) : []

  if (!path.length) {
    return bus.coordinates
  }

  return path.reduce((nearest, coordinate) => {
    const distance = Math.hypot(coordinate[0] - bus.coordinates[0], coordinate[1] - bus.coordinates[1])
    return distance < nearest.distance ? { coordinate, distance } : nearest
  }, { coordinate: path[0], distance: Infinity }).coordinate
}

const createMarkerElement = ({ color, label }) => {
  const marker = document.createElement('button')
  marker.className = 'smart-map-marker'
  marker.style.background = color
  marker.textContent = label
  marker.type = 'button'
  return marker
}

const createBusMarkerElement = (bus, route) => {
  const marker = document.createElement('button')
  marker.className = bus.status.startsWith('Delayed') ? 'smart-map-bus-marker smart-map-bus-marker--delayed' : 'smart-map-bus-marker'
  marker.type = 'button'
  marker.style.setProperty('--bus-color', route?.color || '#0ea5e9')
  marker.setAttribute('aria-label', `${bus.number}, ${bus.route}, ${bus.status}`)
  marker.innerHTML = `
    <span class="smart-map-bus-marker__pulse"></span>
    <span class="smart-map-bus-marker__body">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="4" width="14" height="13" rx="3"></rect>
        <path d="M8 8h8M8 12h8M8 20l1.5-3M16 20l-1.5-3"></path>
      </svg>
    </span>
    <span class="smart-map-bus-marker__label">${bus.number}</span>
  `
  return marker
}

const markerPopupHtml = ({ title: markerTitle, description, meta }) => `
  <div class="smart-map-popup">
    <strong>${markerTitle}</strong>
    <p>${description}</p>
    ${meta ? `<p class="smart-map-popup__meta">${meta}</p>` : ''}
  </div>
`

const busPopupHtml = (bus) => `
  <div class="smart-map-popup">
    <strong>${bus.number}${bus.plate ? ` - ${bus.plate}` : ''}</strong>
    <p>${bus.route} - ${bus.location}</p>
    <p>${bus.passengers}/${bus.capacity} penumpang - ETA ${bus.eta} - ${bus.status}</p>
    <p class="smart-map-popup__meta">${bus.updatedAt || new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}</p>
    <button type="button" class="smart-map-popup__report">Buat Laporan</button>
  </div>
`

const bindInteractivePopup = (element, marker, popup) => {
  let tapOpen = false

  const openPopup = () => {
    popup.setLngLat(marker.getLngLat()).addTo(map)
  }

  const closePopup = () => {
    if (!tapOpen) {
      popup.remove()
    }
  }

  element.addEventListener('mouseenter', openPopup)
  element.addEventListener('mouseleave', closePopup)
  element.addEventListener('focus', openPopup)
  element.addEventListener('blur', () => {
    tapOpen = false
    popup.remove()
  })
  element.addEventListener('click', () => {
    tapOpen = !tapOpen
    if (tapOpen) {
      openPopup()
    } else {
      popup.remove()
    }
  })
  element.addEventListener('touchstart', (event) => {
    event.preventDefault()
    tapOpen = !tapOpen
    if (tapOpen) {
      openPopup()
    } else {
      popup.remove()
    }
  }, { passive: false })
}

const clearMapLayers = () => {
  markerAnimations.forEach((animationId) => cancelAnimationFrame(animationId))
  markerAnimations = new Set()

  markers.forEach((marker) => marker.remove())
  markers = []

  activeLayers.forEach(({ layerIds, sourceId }) => {
    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  })

  activeLayers = []
}

const lineWidthByZoom = (baseWidth, minRatio = 0.42, maxBonus = 1) => [
  'interpolate',
  ['linear'],
  ['zoom'],
  9,
  Math.max(1, baseWidth * minRatio),
  11.5,
  Math.max(1.5, baseWidth * 0.62),
  13.5,
  baseWidth,
  16,
  baseWidth + maxBonus
]

const addLineLayer = ({
  id,
  coordinates,
  color,
  opacity = 0.9,
  width = 5,
  dashArray,
  centerColor,
  centerWidth = 2,
  centerDashArray,
  properties = {}
}) => {
  if (!coordinates.length) {
    return
  }

  const sourceId = `${id}-source`
  const casingLayerId = `${id}-casing`
  const layerId = `${id}-line`
  const centerLayerId = `${id}-center`

  map.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates
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
      'line-width': lineWidthByZoom(width + 6, 0.38, 1.5),
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
      'line-color': color,
      'line-width': lineWidthByZoom(width),
      'line-opacity': opacity,
      ...(dashArray ? { 'line-dasharray': dashArray } : {})
    }
  })

  const layerIds = [layerId, casingLayerId]

  if (centerColor) {
    map.addLayer({
      id: centerLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': centerColor,
        'line-width': lineWidthByZoom(centerWidth, 0.55, 0.4),
        'line-opacity': opacity,
        ...(centerDashArray ? { 'line-dasharray': centerDashArray } : {})
      }
    })

    layerIds.unshift(centerLayerId)
  }

  activeLayers.push({ layerIds, sourceId })
}

const addMarker = ({ coordinates, color = '#0ea5e9', label = 'B', title: markerTitle, description, meta }) => {
  const element = createMarkerElement({ color, label })
  const marker = new maplibregl.Marker({
    element,
    anchor: 'center'
  })
    .setLngLat(coordinates)
    .addTo(map)

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 24 })
    .setHTML(markerPopupHtml({ title: markerTitle, description, meta }))

  bindInteractivePopup(element, marker, popup)

  markers.push(marker)
}

const mapMarkerScale = () => {
  if (!map) {
    return 1
  }

  const zoom = map.getZoom()
  if (zoom <= 10) return 0.58
  if (zoom <= 11.5) return 0.68
  if (zoom <= 13) return 0.82
  return 1
}

const updateMarkerScale = () => {
  const scale = mapMarkerScale()
  markers.forEach((marker) => {
    marker.getElement().style.setProperty('--map-marker-scale', scale)
  })
}

const interpolateCoordinate = (from, to, progress) => [
  from[0] + ((to[0] - from[0]) * progress),
  from[1] + ((to[1] - from[1]) * progress)
]

const stableSeed = (value) =>
  String(value ?? '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)

const pathMetrics = (path) => {
  const segmentLengths = []
  let totalLength = 0

  for (let index = 0; index < path.length - 1; index += 1) {
    const distance = Math.hypot(path[index + 1][0] - path[index][0], path[index + 1][1] - path[index][1])
    segmentLengths.push(distance)
    totalLength += distance
  }

  return { segmentLengths, totalLength }
}

const coordinateAtDistance = (path, metrics, rawDistance) => {
  if (path.length < 2) {
    return path[0]
  }

  if (!metrics.totalLength) {
    return path[0]
  }

  let distance = ((rawDistance % metrics.totalLength) + metrics.totalLength) % metrics.totalLength

  for (let index = 0; index < metrics.segmentLengths.length; index += 1) {
    const segmentLength = metrics.segmentLengths[index]

    if (distance <= segmentLength || index === metrics.segmentLengths.length - 1) {
      const progress = segmentLength ? distance / segmentLength : 0
      return interpolateCoordinate(path[index], path[index + 1], progress)
    }

    distance -= segmentLength
  }

  return path[path.length - 1]
}

const distributedBusDistance = (path, bus, routeBusIndex = 0, routeBusCount = 1) => {
  const metrics = pathMetrics(path)

  if (!metrics.totalLength) {
    return { metrics, distance: 0, coordinate: path[0] || bus.coordinates }
  }

  const spacing = 1 / Math.max(routeBusCount, 1)
  const seed = stableSeed(bus.id || bus.number)
  const jitter = ((seed % 9) - 4) * Math.min(0.018, spacing * 0.18)
  const progress = ((routeBusIndex + 0.5) * spacing + jitter + 1) % 1
  const distance = progress * metrics.totalLength

  return {
    metrics,
    distance,
    coordinate: coordinateAtDistance(path, metrics, distance)
  }
}

const animateBusMarker = ({ marker, popup, path, metrics, startDistance = 0, duration = 210000, delay = 0 }) => {
  if (path.length < 2 || !metrics.totalLength) {
    return
  }

  const startTime = performance.now() + delay

  let animationId

  const frame = (time) => {
    if (animationId) {
      markerAnimations.delete(animationId)
    }

    const elapsed = Math.max(0, time - startTime)
    const distance = startDistance + ((elapsed / duration) * metrics.totalLength)
    const coordinate = coordinateAtDistance(path, metrics, distance)
    marker.setLngLat(coordinate)

    if (popup.isOpen?.()) {
      popup.setLngLat(coordinate)
    }

    animationId = requestAnimationFrame(frame)
    markerAnimations.add(animationId)
  }

  animationId = requestAnimationFrame(frame)
  markerAnimations.add(animationId)
}

const addMovingBusMarker = (bus, routeBusIndex = 0, routeBusCount = 1) => {
  const route = props.routes.find((item) => item.id === bus.routeId)
  const path = route ? transitSegment(route) : []
  const position = distributedBusDistance(path, bus, routeBusIndex, routeBusCount)
  const coordinates = position.coordinate || nearestRouteCoordinate(bus)
  const element = createBusMarkerElement(bus, route)
  const marker = new maplibregl.Marker({
    element,
    anchor: 'center'
  })
    .setLngLat(coordinates)
    .addTo(map)

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 26 })
    .setHTML(busPopupHtml(bus))

  bindInteractivePopup(element, marker, popup)
  markers.push(marker)
  animateBusMarker({
    marker,
    popup,
    path,
    metrics: position.metrics,
    startDistance: position.distance,
    duration: 200000 + (stableSeed(bus.number || bus.id) % 45) * 1000,
    delay: Number(bus.id?.toString().length || 0) * 180
  })
}

const fitBounds = () => {
  const bounds = new maplibregl.LngLatBounds()

  if (props.mode === 'transit') {
    props.routes.forEach((route) => transitSegment(route).forEach((coordinate) => bounds.extend(coordinate)))
    props.buses.forEach((bus) => bounds.extend(nearestRouteCoordinate(bus)))
    if (props.userLocation?.coordinates) {
      bounds.extend(props.userLocation.coordinates)
    }
  } else {
    props.traffic.forEach((location) => {
      const segment = trafficSegment(location)

      if (segment.length) {
        segment.forEach((coordinate) => bounds.extend(coordinate))
      } else {
        bounds.extend(location.coordinates)
      }
    })
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 70, right: 110, bottom: 70, left: 110 },
      maxZoom: 14.5,
      duration: 700
    })
    updateMarkerScale()
  }
}

const renderTraffic = () => {
  props.traffic.forEach((location) => {
    const segment = trafficSegment(location)
    addLineLayer({
      id: `public-traffic-${location.id}`,
      coordinates: segment,
      color: location.color,
      width: 6,
      properties: { name: location.name, density: location.density }
    })

    addMarker({
      coordinates: location.coordinates,
      color: location.color,
      label: `${location.density}%`,
      title: location.name,
      description: `${location.description} - kepadatan ${location.density}%`
    })
  })
}

const renderTransit = () => {
  props.routes.forEach((route) => {
    addLineLayer({
      id: `public-transit-${route.id}`,
      coordinates: transitSegment(route),
      color: route.color,
      opacity: route.status === 'active' ? 0.88 : 0.62,
      width: route.appStyle ? 7 : 5,
      centerColor: route.appStyle ? '#ffffff' : undefined,
      centerWidth: route.appStyle ? 2 : undefined,
      centerDashArray: route.appStyle ? [1.2, 1.8] : undefined,
      properties: { name: route.name }
    })
  })

  const busesByRoute = props.buses.reduce((groups, bus) => {
    const routeBuses = groups.get(bus.routeId) || []
    routeBuses.push(bus)
    groups.set(bus.routeId, routeBuses)
    return groups
  }, new Map())

  props.buses.forEach((bus) => {
    const routeBuses = busesByRoute.get(bus.routeId) || [bus]
    addMovingBusMarker(bus, routeBuses.findIndex((item) => item.id === bus.id), routeBuses.length)
  })

  if (props.userLocation?.coordinates) {
    addMarker({
      coordinates: props.userLocation.coordinates,
      color: '#2563eb',
      label: '',
      title: props.userLocation.name,
      description: props.userLocation.description,
      meta: 'Titik simulasi lokasi pengguna'
    })
  }
}

const renderMapLayers = () => {
  if (!map || !map.loaded()) {
    return
  }

  clearMapLayers()

  if (props.mode === 'transit') {
    renderTransit()
  } else {
    renderTraffic()
  }

  fitBounds()
  updateMarkerScale()
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [116.846, -1.249],
    zoom: 13,
    attributionControl: false
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left')
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

  map.on('load', renderMapLayers)
  map.on('zoom', updateMarkerScale)
  map.on('moveend', updateMarkerScale)
})

watch(
  () => [props.mode, props.traffic, props.roadNetwork, props.routes, props.transitNetwork, props.buses, props.userLocation],
  () => renderMapLayers(),
  { deep: true }
)

onBeforeUnmount(() => {
  markerAnimations.forEach((animationId) => cancelAnimationFrame(animationId))
  markerAnimations = new Set()

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
  cursor: pointer;
  display: flex;
  font-size: 11px;
  font-weight: 800;
  height: 36px;
  justify-content: center;
  min-width: 36px;
  padding: 0 4px;
  transform: scale(var(--map-marker-scale, 1));
  transform-origin: center;
}

.smart-map-bus-marker {
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: inline-flex;
  height: 36px;
  justify-content: center;
  padding: 0;
  position: relative;
  transform: scale(var(--map-marker-scale, 1));
  transform-origin: center;
  width: 36px;
}

.smart-map-bus-marker__pulse {
  animation: bus-marker-pulse 1.8s ease-out infinite;
  background: color-mix(in srgb, var(--bus-color, #0ea5e9) 42%, transparent);
  border-radius: 999px;
  height: 42px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 42px;
}

.smart-map-bus-marker__body {
  align-items: center;
  background: var(--bus-color, #0ea5e9);
  border: 3px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);
  color: #ffffff;
  display: flex;
  height: 36px;
  justify-content: center;
  position: relative;
  width: 36px;
}

.smart-map-bus-marker__body svg {
  height: 18px;
  width: 18px;
}

.smart-map-bus-marker__label {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
  color: #0f172a;
  font-size: 0.62rem;
  font-weight: 900;
  line-height: 1;
  max-width: 72px;
  overflow: hidden;
  padding: 0.22rem 0.42rem;
  position: absolute;
  top: 40px;
  left: 50%;
  text-overflow: ellipsis;
  transform: translateX(-50%);
  white-space: nowrap;
}

.smart-map-bus-marker--delayed .smart-map-bus-marker__body {
  background: #f97316;
}

.smart-map-bus-marker:hover .smart-map-bus-marker__body,
.smart-map-bus-marker:focus-visible .smart-map-bus-marker__body {
  transform: translateY(-2px) scale(1.04);
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

.smart-map-popup__meta {
  color: #dc2626 !important;
  font-weight: 800;
}

.smart-map-popup__report {
  background: #dc143c;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 900;
  margin-top: 0.9rem;
  padding: 0.75rem 1rem;
  width: 100%;
}

@keyframes bus-marker-pulse {
  0% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(0.65);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.35);
  }
}
</style>
