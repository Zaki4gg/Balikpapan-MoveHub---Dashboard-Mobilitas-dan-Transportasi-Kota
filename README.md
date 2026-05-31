# Smart Mobility Dashboard

Dashboard Smart Mobility untuk mode admin dan publik.

## Peta

Project ini memakai **MapLibre GL JS** dengan raster tile OpenStreetMap.

Kelebihan setup ini:

- Tidak perlu Google Maps API key.
- Tidak perlu billing Google Cloud.
- Tetap mendukung marker, popup, legenda, dan layer interaktif.
- Bisa dikembangkan ke vector tile, heatmap, rute, atau animasi armada.

## Menjalankan Project

```bash
npm install
npm run dev
npm.cmd run dev:backend ## backend
npm.cmd run dev:public ## website dashboard publik
npm.cmd run dev:admin ## website dashboard admin panel
```