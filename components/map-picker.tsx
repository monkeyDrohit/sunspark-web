'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LocateFixed, Loader2 } from 'lucide-react';

// Fix for default Leaflet icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialLink?: string | null;
  onChange: (data: { lat: number | null; lng: number | null; link: string }) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function MapControls({ setPosition }: { setPosition: (pos: L.LatLng) => void }) {
  const map = useMap();

  useEffect(() => {
    // Add Search Control
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search address or location...',
    });

    map.addControl(searchControl);

    // Event listener for search result
    map.on('geosearch/showlocation', (e: any) => {
      if (e.location && e.location.y && e.location.x) {
        setPosition(new L.LatLng(e.location.y, e.location.x));
      }
    });

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation');
    };
  }, [map, setPosition]);

  return null;
}

export default function MapLocationPicker({ initialLat, initialLng, initialLink, onChange }: MapLocationPickerProps) {
  const defaultCenter = new L.LatLng(20.5937, 78.9629); // Center of India
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null
  );
  const [link, setLink] = useState(initialLink || '');
  const [locating, setLocating] = useState(false);

  // Debounce onChange call to avoid excessive re-renders
  const lastUpdateRef = useRef({ lat: initialLat, lng: initialLng, link: initialLink });

  useEffect(() => {
    const lat = position?.lat || null;
    const lng = position?.lng || null;
    
    if (lat !== lastUpdateRef.current.lat || lng !== lastUpdateRef.current.lng || link !== lastUpdateRef.current.link) {
      lastUpdateRef.current = { lat, lng, link };
      onChange({ lat, lng, link });
    }
  }, [position, link, onChange]);

  const handleManualCoordChange = (type: 'lat' | 'lng', value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (type === 'lat') {
        setPosition(prev => new L.LatLng(num, prev?.lng || defaultCenter.lng));
      } else {
        setPosition(prev => new L.LatLng(prev?.lat || defaultCenter.lat, num));
      }
    } else {
       if (type === 'lat' && position) setPosition(new L.LatLng(0, position.lng));
       if (type === 'lng' && position) setPosition(new L.LatLng(position.lat, 0));
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
        setPosition(latLng);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <Label>Geographic Coordinates</Label>
         <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleCurrentLocation} 
            disabled={locating}
            className="flex items-center gap-2"
          >
           {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
           Use My Current Location
         </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="googleMapLink">Google Maps Link</Label>
          <Input
            id="googleMapLink"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste Google Maps URL here..."
          />
          <p className="text-xs text-muted-foreground">Provide a direct Google Maps link, or pinpoint the exact location on the map below.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={position?.lat || ''}
            onChange={(e) => handleManualCoordChange('lat', e.target.value)}
            placeholder="e.g. 28.6139"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={position?.lng || ''}
            onChange={(e) => handleManualCoordChange('lng', e.target.value)}
            placeholder="e.g. 77.2090"
          />
        </div>
      </div>

      <div className="h-[400px] w-full rounded-md border overflow-hidden mt-4 relative z-0">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : 4}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapControls setPosition={setPosition} />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  );
}
