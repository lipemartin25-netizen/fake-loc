import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinate } from '../geo';
import type { GpxData } from '../fileFormats';

interface RealMapProps {
  current: Coordinate;
  destination: Coordinate | null;
  onSelectDestination: (coord: Coordinate) => void;
  gpxData: GpxData | null;
}

// Custom DivIcons to avoid missing asset png files in bundlers / electron
const currentIcon = L.divIcon({
  className: 'custom-pin current-pin',
  html: '<div class="pin-marker current-pulse" title="Posição Simulada"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const destIcon = L.divIcon({
  className: 'custom-pin dest-pin',
  html: '<div class="pin-marker dest-dot" title="Destino"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function RealMap({ current, destination, onSelectDestination, gpxData }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const gpxLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [current.latitude, current.longitude],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Click on map to set destination
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectDestination({
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
      });
    });

    // Marker for current simulated position
    const curMarker = L.marker([current.latitude, current.longitude], { icon: currentIcon }).addTo(map);
    curMarker.bindTooltip('Posição simulada', { permanent: false, direction: 'top' });
    currentMarkerRef.current = curMarker;

    // Layer group for GPX elements
    const gpxGroup = L.layerGroup().addTo(map);
    gpxLayerRef.current = gpxGroup;

    mapRef.current = map;

    // Invalidate size once container layout stabilizes
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update current position marker
  useEffect(() => {
    if (!currentMarkerRef.current) return;
    currentMarkerRef.current.setLatLng([current.latitude, current.longitude]);
  }, [current.latitude, current.longitude]);

  // Update destination marker and route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destination) {
      const destLatLng: [number, number] = [destination.latitude, destination.longitude];

      if (!destMarkerRef.current) {
        const marker = L.marker(destLatLng, {
          icon: destIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onSelectDestination({
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6)),
          });
        });

        marker.bindTooltip('Destino (arraste para mover)', { permanent: false, direction: 'top' });
        destMarkerRef.current = marker;
      } else {
        destMarkerRef.current.setLatLng(destLatLng);
      }

      // Draw or update route polyline
      const routePoints: [number, number][] = [
        [current.latitude, current.longitude],
        destLatLng,
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(routePoints, {
          color: '#58deb3',
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 6',
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(routePoints);
      }
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
    }
  }, [destination, current.latitude, current.longitude]);

  // Render GPX routes/waypoints if imported
  useEffect(() => {
    const group = gpxLayerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();

    if (!gpxData) return;

    // Draw waypoints
    for (const wpt of gpxData.waypoints) {
      const m = L.circleMarker([wpt.latitude, wpt.longitude], {
        radius: 5,
        color: '#ffb86b',
        fillColor: '#ffb86b',
        fillOpacity: 0.8,
      });
      if (wpt.name) m.bindTooltip(wpt.name);
      group.addLayer(m);
    }

    // Draw routes
    for (const route of gpxData.routes) {
      if (route.length < 2) continue;
      const pts: [number, number][] = route.map((p) => [p.latitude, p.longitude]);
      group.addLayer(L.polyline(pts, { color: '#ff79c6', weight: 3, opacity: 0.7 }));
    }

    // Draw track segments
    for (const seg of gpxData.trackSegments) {
      if (seg.length < 2) continue;
      const pts: [number, number][] = seg.map((p) => [p.latitude, p.longitude]);
      group.addLayer(L.polyline(pts, { color: '#bd93f9', weight: 2, opacity: 0.6 }));
    }
  }, [gpxData]);

  return (
    <div className="real-map-wrapper">
      <div ref={containerRef} className="real-map-container" />
      <div className="map-overlay-badge">
        <span>{current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}</span>
      </div>
    </div>
  );
}
