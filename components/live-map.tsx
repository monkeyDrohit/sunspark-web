'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLiveAgentLocations, type LiveAgentLocation } from '@/lib/agent-locations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Create a custom DivIcon to avoid missing image URL issues with Next.js & Leaflet
const createAgentIcon = (name: string, isRecent: boolean) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const colorClass = isRecent ? 'bg-primary' : 'bg-muted-foreground';
  
  return L.divIcon({
    className: 'custom-agent-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${colorClass} text-primary-foreground shadow-md border-2 border-white">
        <span class="text-xs font-bold">${initials}</span>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white"></div>
        <div class="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] ${isRecent ? 'border-t-primary' : 'border-t-muted-foreground'}"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
};

export default function LiveMap({ vendorId }: { vendorId?: string | null }) {
  const [agents, setAgents] = useState<LiveAgentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Default center of India
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;

  const loadLocations = async () => {
    try {
      const data = await fetchLiveAgentLocations(vendorId);
      setAgents(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load agent locations:', err);
      setError('Failed to refresh agent locations.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load & Polling every 30 seconds
  useEffect(() => {
    loadLocations();
    const interval = setInterval(loadLocations, 30000);
    return () => clearInterval(interval);
  }, [vendorId]);

  // Fit map bounds to show all agents when agents change significantly
  useEffect(() => {
    if (agents.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(agents.map(a => [a.latitude, a.longitude]));
      // Only flyTo if bounds are valid
      if (bounds.isValid()) {
        // Prevent constant zooming on every tiny location update by checking if we really need to zoom out
        const currentBounds = mapRef.current.getBounds();
        if (!currentBounds.contains(bounds)) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    }
  }, [agents.length]); // Intentionally only run on length change to avoid interrupting user panning

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
      
      {/* Map Container - 3/4 width on large screens */}
      <div className="lg:col-span-3 rounded-xl overflow-hidden border shadow-sm relative h-full min-h-[400px] z-0">
        {loading && agents.length === 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <Navigation className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">Locating Agents...</p>
            </div>
          </div>
        )}
        
        {error && agents.length === 0 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <div className="text-center p-6 border rounded-lg bg-destructive/10 text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={loadLocations}>Retry</Button>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={defaultCenter} 
            zoom={defaultZoom} 
            className="w-full h-full"
            ref={mapRef}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {agents.map((agent) => {
              // Determine if the location update was within the last hour
              const isRecent = new Date().getTime() - new Date(agent.lastLocationUpdate).getTime() < 60 * 60 * 1000;
              
              return (
                <Marker 
                  key={agent.id} 
                  position={[agent.latitude, agent.longitude]}
                  icon={createAgentIcon(agent.name, isRecent)}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {agent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm m-0 leading-none">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground m-0 mt-1">{agent.mobile}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={isRecent ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {isRecent ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Last Seen:</span>
                          <span className="font-medium">{formatDistanceToNow(new Date(agent.lastLocationUpdate), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Active Jobs:</span>
                          <span className="font-medium">{agent.user?.assignedApplications?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Sidebar Roster - 1/4 width on large screens */}
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Agent Roster
            </div>
            <Badge variant="outline">{agents.length} Total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1">
          {agents.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No active field agents found with GPS data.
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {agents.sort((a, b) => new Date(b.lastLocationUpdate).getTime() - new Date(a.lastLocationUpdate).getTime()).map((agent) => {
                const isRecent = new Date().getTime() - new Date(agent.lastLocationUpdate).getTime() < 60 * 60 * 1000;
                
                return (
                  <button 
                    key={agent.id} 
                    className="flex flex-col p-4 hover:bg-accent/50 text-left transition-colors"
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.flyTo([agent.latitude, agent.longitude], 15, { duration: 1.5 });
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{agent.name}</span>
                      <div className={`h-2 w-2 rounded-full ${isRecent ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{agent.mobile}</span>
                      <span>{formatDistanceToNow(new Date(agent.lastLocationUpdate), { addSuffix: true })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
