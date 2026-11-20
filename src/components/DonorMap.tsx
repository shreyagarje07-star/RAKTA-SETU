import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ScoredDonor } from '../lib/types';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Red Icon for Hospital
const hospitalIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Custom Green Icon for Donor
const donorIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface Props {
  donors: ScoredDonor[];
  hospitalLat: number;
  hospitalLon: number;
  hospitalName: string;
}

export function DonorMap({ donors, hospitalLat, hospitalLon, hospitalName }: Props) {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner mt-6 z-0 relative">
      <MapContainer 
        center={[hospitalLat, hospitalLon]} 
        zoom={10} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Hospital Marker */}
        <Marker position={[hospitalLat, hospitalLon]} icon={hospitalIcon}>
          <Popup>
            <strong>🏥 {hospitalName}</strong><br />
            Emergency Request Location
          </Popup>
        </Marker>

        {/* Donor Markers */}
        {donors.map((donor) => (
          donor.latitude && donor.longitude ? (
            <Marker 
              key={donor.id} 
              position={[donor.latitude, donor.longitude]} 
              icon={donorIcon}
            >
              <Popup>
                <strong>{donor.name}</strong><br />
                Blood Group: {donor.blood_group}<br />
                Score: {donor.priority_score}/100
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}