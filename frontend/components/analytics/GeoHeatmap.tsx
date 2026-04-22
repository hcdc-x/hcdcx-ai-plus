// frontend/components/analytics/GeoHeatmap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';

// 确保只设置一次 access token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

interface GeoDataPoint {
  lat: number;
  lng: number;
  weight: number;
  location?: string;
}

interface GeoHeatmapProps {
  data: GeoDataPoint[];
  isLoading?: boolean;
}

export function GeoHeatmap({ data, isLoading }: GeoHeatmapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 示例数据（如果没有传入数据）
  const displayData = data.length > 0 ? data : [
    { lat: 40.7128, lng: -74.0060, weight: 1.0, location: 'New York' },
    { lat: 34.0522, lng: -118.2437, weight: 0.8, location: 'Los Angeles' },
    { lat: 51.5074, lng: -0.1278, weight: 0.6, location: 'London' },
    { lat: 35.6895, lng: 139.6917, weight: 0.7, location: 'Tokyo' },
    { lat: -33.8688, lng: 151.2093, weight: 0.5, location: 'Sydney' },
    { lat: 55.7558, lng: 37.6173, weight: 0.4, location: 'Moscow' },
    { lat: 19.0760, lng: 72.8777, weight: 0.9, location: 'Mumbai' },
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.5,
      pitch: 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // 添加热力图图层
      map.addSource('scans', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: displayData.map((point) => ({
            type: 'Feature',
            properties: {
              weight: point.weight,
              location: point.location,
            },
            geometry: {
              type: 'Point',
              coordinates: [point.lng, point.lat],
            },
          })),
        },
      });

      map.addLayer({
        id: 'scans-heat',
        type: 'heatmap',
        source: 'scans',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1.5,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 0, 0, 0)',
            0.2,
            '#0080FF',
            0.4,
            '#00FFFF',
            0.6,
            '#A020F0',
            0.8,
            '#FF00FF',
            1,
            '#FF0000',
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.8,
        },
      });

      map.addLayer({
        id: 'scans-point',
        type: 'circle',
        source: 'scans',
        minzoom: 8,
        paint: {
          'circle-radius': 8,
          'circle-color': '#00FFFF',
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000',
        },
      });

      // 添加导航控件
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 更新数据
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !mapRef.current.getSource('scans')) return;

    const source = mapRef.current.getSource('scans') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: displayData.map((point) => ({
          type: 'Feature',
          properties: {
            weight: point.weight,
            location: point.location,
          },
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat],
          },
        })),
      });
    }
  }, [data, mapLoaded]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
      </div>
    );
  }

  if (!mapboxgl.accessToken) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-6 text-center">
        <div>
          <p className="text-muted-foreground">Mapbox token not configured</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full overflow-hidden rounded-lg"
    >
      <div ref={mapContainerRef} className="h-full w-full" />
    </motion.div>
  );
}
