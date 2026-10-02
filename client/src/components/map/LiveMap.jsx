import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue with React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom icons
const passengerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const porterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  const [hasSetInitial, setHasSetInitial] = useState(false);

  useEffect(() => {
    if (center && center[0] && !hasSetInitial) {
      map.setView(center, 16, { animate: true });
      setHasSetInitial(true);
    }
  }, [center, map, hasSetInitial]);
  
  return null;
};

const LiveMap = ({ passengerLocation, porterLocation, stationName }) => {
  // Default to center of India if no loc
  const defaultCenter = [20.5937, 78.9629];
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    if (passengerLocation) {
      setCenter([passengerLocation.lat, passengerLocation.lng]);
    } else if (porterLocation) {
      setCenter([porterLocation.lat, porterLocation.lng]);
    }
  }, [passengerLocation, porterLocation]);

  return (
    <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0">
      
      {/* Fallback overlay warning */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-semibold text-gray-700 flex items-center border border-yellow-200">
        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
        GPS accuracy is limited inside the station
      </div>

      <MapContainer center={center} zoom={16} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {passengerLocation && (
          <Marker position={[passengerLocation.lat, passengerLocation.lng]} icon={passengerIcon}>
            <Popup>
              <strong>You are here</strong><br/>
              Approx accuracy: {Math.round(passengerLocation.accuracy)}m
            </Popup>
          </Marker>
        )}

        {porterLocation && (
          <Marker position={[porterLocation.lat, porterLocation.lng]} icon={porterIcon}>
            <Popup>
              <strong>Porter Location</strong><br/>
              Updated recently
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
