import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ScoredDonor } from '../lib/types';

// Fix for default marker icons
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
  html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">🏥</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Function to create Letter Icons (A, B, C...)
const createLetterIcon = (letter: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${letter}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

interface Props {
  donors: ScoredDonor[];
  hospitalLat: number;
  hospitalLon: number;
  hospitalName: string;
}

export function DonorMap({ donors, hospitalLat, hospitalLon, hospitalName }: Props) {
  if (!hospitalLat || !hospitalLon) return null;

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner mt-6 relative z-0">
      {/* ZOOM LEVEL 7 shows the whole state/region */}
      <MapContainer 
        center={[hospitalLat, hospitalLon]} 
        zoom={7} 
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

        {/* Donor Markers with A, B, C labels */}
        {donors.map((donor, index) => {
          if (!donor.latitude || !donor.longitude) return null;
          
          // Generate letters: 0 -> A, 1 -> B, etc.
          const letter = String.fromCharCode(65 + index);

          // Apply offset based on area to spread them out visually
          let adjustedLat = donor.latitude;
          let adjustedLon = donor.longitude;
          if (donor.area) {
            const seed = donor.area.length * 0.05; // 0.05 gives a visible offset
            adjustedLat += seed;
            adjustedLon -= seed;
          }

          return (
            <Marker 
              key={donor.id} 
              position={[adjustedLat, adjustedLon]} 
              icon={createLetterIcon(letter)}
            >
              <Popup>
                <strong>Donor {letter}</strong><br />
                Blood Group: {donor.blood_group}<br />
                Location: {donor.area ? `${donor.area}, ` : ''}{donor.city}<br />
                Score: {donor.priority_score}/100
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}