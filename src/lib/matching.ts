import type { Donor, ScoredDonor, BloodGroup } from './types';

// Haversine formula to calculate distance in km between two coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function calculatePriorityScore(
  donor: Donor,
  hospitalCity: string,
  hospitalLat?: number | null,
  hospitalLon?: number | null
): number {
  let proximity = 0;
  
  if (hospitalLat && hospitalLon && donor.latitude && donor.longitude) {
    // If the donor has an area, we add a small random offset so they don't stack perfectly
    // This simulates different neighborhoods
    let adjustedLat = donor.latitude;
    let adjustedLon = donor.longitude;
    
    if (donor.area) {
      // Create a pseudo-random offset based on the string length of the area name
      const seed = donor.area.length * 0.001;
      adjustedLat += seed;
      adjustedLon -= seed;
    }

    const distance = getDistanceFromLatLonInKm(hospitalLat, hospitalLon, adjustedLat, adjustedLon);
    
    if (distance <= 10) proximity = 40;
    else if (distance <= 25) proximity = 30;
    else if (distance <= 50) proximity = 15;
    else proximity = 0;
  } else {
    const donorCity = donor.city ? donor.city.trim().toLowerCase() : '';
    const hospCity = hospitalCity ? hospitalCity.trim().toLowerCase() : '';
    proximity = donorCity === hospCity ? 40 : 0;
  }

  // ... rest of the function

  // 2. Recency (30 pts)
  let recency = 0;
  if (!donor.last_donation_date) {
    recency = 30;
  } else {
    const daysSince = Math.floor((Date.now() - new Date(donor.last_donation_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 90) {
      const effective = Math.min(daysSince, 365);
      recency = ((effective - 90) / (365 - 90)) * 30;
    }
  }

  // 3. Reliability (30 pts)
  const reliability = Math.min(30, (donor.total_donations || 0) * 5);

  const total = proximity + recency + reliability;
  return Math.round(Math.min(100, Math.max(0, total)));
}

export function matchAndScoreDonors(
  allDonors: Donor[],
  bloodGroup: BloodGroup,
  hospitalCity: string,
  hospitalLat?: number | null,
  hospitalLon?: number | null
): ScoredDonor[] {
  
  const eligible = allDonors.filter((donor) => {
    if (donor.blood_group !== bloodGroup) return false;
    if (!donor.consent_sms) return false;
    if (!donor.is_available) return false;

    if (donor.last_donation_date) {
      const daysSince = Math.floor((Date.now() - new Date(donor.last_donation_date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 90) return false;
    }
    return true;
  });

  const scored: ScoredDonor[] = eligible.map((donor) => ({
    ...donor,
    priority_score: calculatePriorityScore(donor, hospitalCity, hospitalLat, hospitalLon),
  }));

  scored.sort((a, b) => b.priority_score - a.priority_score);
  return scored;
}