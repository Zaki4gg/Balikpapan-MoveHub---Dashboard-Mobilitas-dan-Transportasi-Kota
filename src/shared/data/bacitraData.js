export const bacitraServiceInfo = {
  operator: 'Balikpapan City Trans',
  mode: 'Prototype terinspirasi Mitra Darat',
  payment: 'Kartu non-tunai / QR simulasi',
  operatingHour: '06.00 - 20.00 WITA',
  averageHeadway: '7-12 menit',
  hotline: '112 / kanal laporan warga'
}

export const bacitraCorridors = [
  {
    id: 'corridor-a',
    routeId: 101,
    code: 'A',
    from: 'Pelabuhan Semayang',
    to: 'Halte Bandara SAMS',
    buses: 0,
    shelters: 46,
    color: '#22c55e',
    accent: 'bg-green-500',
    tagClass: 'bg-green-500 text-white',
    busCodes: [],
    stops: ['Pelabuhan Semayang', 'Melawai A', 'Lapangan Merdeka Balikpapan', 'RS Pertamina A', 'Balikpapan Superblock', 'Bandara SAMS'],
    path: [
      [116.8102, -1.2798],
      [116.8245, -1.2761],
      [116.8367, -1.2742],
      [116.8508, -1.2746],
      [116.8658, -1.2668],
      [116.8905, -1.2642]
    ]
  },
  {
    id: 'corridor-b',
    routeId: 102,
    code: 'B',
    from: 'Terminal Batuampar B',
    to: 'Terminal Batu Ampar',
    buses: 0,
    shelters: 87,
    color: '#db2777',
    accent: 'bg-pink-500',
    tagClass: 'bg-pink-500 text-white',
    busCodes: [],
    stops: ['Terminal Batuampar B', 'Perintis', 'Perumahan Ramayana', 'Gunung Pipa', 'Siloam Hospitals Balikpapan', 'Terminal Batu Ampar'],
    path: [
      [116.8248, -1.281],
      [116.826, -1.262],
      [116.8218, -1.2472],
      [116.8315, -1.2302],
      [116.858, -1.232],
      [116.8668, -1.255],
      [116.846, -1.276]
    ]
  },
  {
    id: 'corridor-k1',
    routeId: 103,
    code: 'K1',
    from: 'Pelabuhan Semayang',
    to: 'Halte Bandara SAMS',
    buses: 9,
    shelters: 45,
    color: '#16a34a',
    accent: 'bg-green-600',
    tagClass: 'bg-green-600 text-white',
    busCodes: ['TB I 05', 'TB I 01', 'TB I 03', 'TB I 02'],
    stops: ['Pelabuhan Semayang', 'Melawai A', 'Lapangan Merdeka Balikpapan', 'RS Pertamina A', 'Balikpapan Superblock', 'Bandara SAMS'],
    path: [
      [116.8088, -1.2806],
      [116.8238, -1.2762],
      [116.8372, -1.2748],
      [116.8535, -1.2739],
      [116.873, -1.2662],
      [116.8928, -1.2636]
    ]
  },
  {
    id: 'corridor-k2a',
    routeId: 104,
    code: 'K2A',
    from: 'Terminal Batu Ampar',
    to: 'DKK',
    buses: 8,
    shelters: 43,
    color: '#db2777',
    accent: 'bg-pink-500',
    tagClass: 'bg-pink-500 text-white',
    busCodes: ['CAD 02', 'TB IIA 02', 'TB IIA 01', 'CAD 03'],
    stops: ['Terminal Batu Ampar', 'Sabulussalam', 'Simpang Batu Ampar 1', 'Pasar Butun 1', 'RSUD Dr. Kanujoso', 'DKK'],
    path: [
      [116.824, -1.2808],
      [116.835, -1.2682],
      [116.851, -1.2515],
      [116.8588, -1.2345],
      [116.8465, -1.2222],
      [116.8322, -1.229]
    ]
  },
  {
    id: 'corridor-k2b',
    routeId: 105,
    code: 'K2B',
    from: 'Terminal Batu Ampar',
    to: 'Bank Danamon',
    buses: 6,
    shelters: 43,
    color: '#f59e0b',
    accent: 'bg-amber-500',
    tagClass: 'bg-amber-500 text-white',
    busCodes: ['TB IIB 01', 'TB IIB 05'],
    stops: ['Terminal Batu Ampar', 'Perintis', 'Perumahan Ramayana', 'Bank Danamon', 'Gunung Pipa', 'Terminal Batu Ampar'],
    path: [
      [116.824, -1.2808],
      [116.8266, -1.2635],
      [116.8218, -1.2475],
      [116.8295, -1.2325],
      [116.848, -1.2185],
      [116.8615, -1.2268]
    ]
  }
]

export const bacitraShelters = [
  {
    id: 'shelter-gunung-malang',
    name: 'Halte Gunung Malang',
    corridor: 'Koridor Kota',
    distance: '350 m',
    walkTime: '4 menit jalan kaki',
    nextBus: '6 menit',
    status: 'Ramai',
    statusClass: 'bg-amber-50 text-amber-700',
    routeIds: [1, 3],
    coordinates: [116.8368, -1.2488]
  },
  {
    id: 'shelter-markoni',
    name: 'Halte Markoni',
    corridor: 'Koridor Sudirman',
    distance: '520 m',
    walkTime: '7 menit jalan kaki',
    nextBus: '8 menit',
    status: 'Normal',
    statusClass: 'bg-emerald-50 text-emerald-700',
    routeIds: [1, 2],
    coordinates: [116.8421, -1.2441]
  },
  {
    id: 'shelter-plaza',
    name: 'Halte Plaza Balikpapan',
    corridor: 'Koridor Pusat Kota',
    distance: '780 m',
    walkTime: '10 menit jalan kaki',
    nextBus: '11 menit',
    status: 'Normal',
    statusClass: 'bg-emerald-50 text-emerald-700',
    routeIds: [2, 4],
    coordinates: [116.8395, -1.2465]
  },
  {
    id: 'shelter-grand-city',
    name: 'Halte Grand City',
    corridor: 'Koridor MT Haryono',
    distance: '1.2 km',
    walkTime: '15 menit jalan kaki',
    nextBus: '13 menit',
    status: 'Padat',
    statusClass: 'bg-rose-50 text-rose-700',
    routeIds: [1, 4],
    coordinates: [116.845, -1.255]
  },
  {
    id: 'shelter-bandara',
    name: 'Halte Bandara Sepinggan',
    corridor: 'Koridor Bandara',
    distance: '2.8 km',
    walkTime: 'Butuh feeder',
    nextBus: '9 menit',
    status: 'Normal',
    statusClass: 'bg-emerald-50 text-emerald-700',
    routeIds: [2],
    coordinates: [116.86, -1.238]
  }
]

export const bacitraRouteStops = {
  1: ['Terminal Pusat', 'Halte Markoni', 'Halte Gunung Malang', 'MT Haryono', 'Grand City'],
  2: ['Terminal Pusat', 'Halte Markoni', 'Soekarno Hatta', 'Sepinggan Baru', 'Bandara Sepinggan'],
  3: ['Sepinggan', 'Gunung Malang', 'Gatot Subroto', 'RS Kota', 'Pusat Layanan'],
  4: ['Kampus', 'Halte Plaza Balikpapan', 'Sudirman', 'MT Haryono', 'Mall Balikpapan']
}

export const bacitraOperationalQueue = [
  {
    id: 'queue-1',
    item: 'Validasi posisi armada BLK-004',
    priority: 'Tinggi',
    status: 'Dipantau',
    owner: 'Operator Transit'
  },
  {
    id: 'queue-2',
    item: 'Sinkron estimasi Halte Grand City',
    priority: 'Sedang',
    status: 'Dalam pembaruan',
    owner: 'Dispatcher'
  },
  {
    id: 'queue-3',
    item: 'Konfirmasi keterlambatan Route 3',
    priority: 'Sedang',
    status: 'Menunggu armada',
    owner: 'Petugas Lapangan'
  }
]
