export const trafficLocations = [
  {
    id: 3,
    name: 'Jl. Ahmad Yani',
    description: 'Kawasan perdagangan',
    level: 'light',
    density: 35,
    avgSpeed: 50,
    coordinates: [116.8426, -1.2423],
    color: '#10b981',
    roadFeatureId: 'road-ahmad-yani',
    segment: []
  },
  {
    id: 4,
    name: 'Ruas Gunung Malang',
    description: 'Ruas pusat kota',
    level: 'medium',
    density: 55,
    avgSpeed: 35,
    coordinates: [116.837, -1.2496],
    color: '#f59e0b',
    roadFeatureId: 'road-gunung-malang',
    segment: []
  },
  {
    id: 5,
    name: 'Grand City - MT Haryono',
    description: 'Akses mal utama',
    level: 'heavy',
    density: 78,
    avgSpeed: 15,
    coordinates: [116.8487, -1.2568],
    color: '#ef4444',
    roadFeatureId: 'road-grand-city-mt-haryono',
    segment: []
  },
  {
    id: 7,
    name: 'Jl. Jenderal Sudirman - BSB/Penta City',
    description: 'Ruas pusat belanja dan kawasan pesisir',
    level: 'medium',
    density: 70,
    avgSpeed: 22,
    coordinates: [116.8599, -1.2709],
    color: '#f59e0b',
    roadFeatureId: 'road-sudirman-bsb-penta-city',
    segment: []
  },
  {
    id: 8,
    name: 'Jl. MT Haryono - Lampu Merah Grand City',
    description: 'Simpang lampu merah kawasan Grand City',
    level: 'heavy',
    density: 90,
    avgSpeed: 9,
    coordinates: [116.87276, -1.229545],
    color: '#ef4444',
    roadFeatureId: 'road-mt-haryono-grand-city-light',
    segment: []
  }
]

export const transitRoutes = [
  {
    id: 1,
    name: 'Bacitra Route 1',
    shortName: 'Route 1',
    route: 'Terminal Pusat ke Grand City',
    status: 'active',
    fleet: 12,
    passengers: 485,
    onTime: 98,
    eta: '6 menit',
    color: '#2563eb',
    path: [
      [116.817, -1.251],
      [116.824, -1.248],
      [116.8334, -1.2666],
      [116.845, -1.255]
    ]
  },
  {
    id: 2,
    name: 'Bacitra Route 2',
    shortName: 'Route 2',
    route: 'Terminal Pusat ke Poros Soekarno-Hatta',
    status: 'active',
    fleet: 15,
    passengers: 620,
    onTime: 95,
    eta: '8 menit',
    color: '#059669',
    path: [
      [116.817, -1.251],
      [116.833, -1.262],
      [116.85, -1.25],
      [116.86, -1.238]
    ]
  },
  {
    id: 3,
    name: 'Bacitra Route 3',
    shortName: 'Route 3',
    route: 'Sepinggan ke Rumah Sakit',
    status: 'delayed',
    fleet: 8,
    passengers: 245,
    onTime: 87,
    eta: '14 menit',
    color: '#f59e0b',
    path: [
      [116.825, -1.245],
      [116.833, -1.252],
      [116.84, -1.258],
      [116.846, -1.265]
    ]
  },
  {
    id: 4,
    name: 'Bacitra Route 4',
    shortName: 'Route 4',
    route: 'Kampus ke Mall',
    status: 'active',
    fleet: 10,
    passengers: 380,
    onTime: 92,
    eta: '10 menit',
    color: '#7c3aed',
    path: [
      [116.812, -1.243],
      [116.82, -1.24],
      [116.833, -1.246],
      [116.845, -1.255]
    ]
  }
]

export const activeBuses = [
  {
    id: 1,
    number: 'BLK-001',
    route: 'Route 1',
    routeId: 1,
    location: 'Jl. MT Haryono',
    passengers: 42,
    capacity: 50,
    status: 'On Schedule',
    eta: '6 menit',
    coordinates: [116.8334, -1.2666]
  },
  {
    id: 2,
    number: 'BLK-002',
    route: 'Route 1',
    routeId: 1,
    location: 'Grand City',
    passengers: 38,
    capacity: 50,
    status: 'On Schedule',
    eta: '9 menit',
    coordinates: [116.845, -1.255]
  },
  {
    id: 3,
    number: 'BLK-003',
    route: 'Route 2',
    routeId: 2,
    location: 'Jl. Soekarno Hatta',
    passengers: 45,
    capacity: 50,
    status: 'On Schedule',
    eta: '8 menit',
    coordinates: [116.85, -1.25]
  },
  {
    id: 4,
    number: 'BLK-004',
    route: 'Route 2',
    routeId: 2,
    location: 'Poros Soekarno-Hatta',
    passengers: 50,
    capacity: 50,
    status: 'Delayed (5 min)',
    eta: '13 menit',
    coordinates: [116.86, -1.238]
  },
  {
    id: 5,
    number: 'BLK-005',
    route: 'Route 3',
    routeId: 3,
    location: 'Ruas Gunung Malang',
    passengers: 35,
    capacity: 50,
    status: 'On Schedule',
    eta: '14 menit',
    coordinates: [116.825, -1.245]
  },
  {
    id: 6,
    number: 'BLK-006',
    route: 'Route 4',
    routeId: 4,
    location: 'Kawasan Kampus',
    passengers: 48,
    capacity: 50,
    status: 'On Schedule',
    eta: '10 menit',
    coordinates: [116.812, -1.243]
  }
]

export const weeklyReports = [
  { day: 'Senin', date: '2026-05-18', incidents: 12, avgTime: 42 },
  { day: 'Selasa', date: '2026-05-19', incidents: 10, avgTime: 40 },
  { day: 'Rabu', date: '2026-05-20', incidents: 14, avgTime: 45 },
  { day: 'Kamis', date: '2026-05-21', incidents: 11, avgTime: 41 },
  { day: 'Jumat', date: '2026-05-22', incidents: 16, avgTime: 48 },
  { day: 'Sabtu', date: '2026-05-23', incidents: 8, avgTime: 35 },
  { day: 'Minggu', date: '2026-05-24', incidents: 5, avgTime: 30 }
]
