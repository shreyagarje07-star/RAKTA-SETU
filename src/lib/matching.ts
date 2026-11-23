import type { Donor, ScoredDonor, BloodGroup } from './types';

// Medical compatibility matrix (Who can donate TO whom)
const COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculatePriorityScore(
  donor: Donor,
  hospitalCity: string,
  hospitalLat?: number | null,
  hospitalLon?: number | null
): number {
  let proximity = 0;
  
  if (hospitalLat && hospitalLon && donor.latitude && donor.longitude) {
    const distance = getDistanceFromLatLonInKm(hospitalLat, hospitalLon, donor.latitude, donor.longitude);
    if (distance <= 10) proximity = 40;
    else if (distance <= 25) proximity = 30;
    else if (distance <= 50) proximity = 15;
    else proximity = 0;
  } else {
    const donorCity = donor.city ? donor.city.trim().toLowerCase() : '';
    const hospCity = hospitalCity ? hospitalCity.trim().toLowerCase() : '';
    proximity = donorCity === hospCity ? 40 : 0;
  }

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

  const reliability = Math.min(30, (donor.total_donations || 0) * 5);
  return Math.round(Math.min(100, Math.max(0, proximity + recency + reliability)));
}

// Updated return type to separate exact and compatible
export interface MatchResult {
  exactMatches: ScoredDonor[];
  compatibleMatches: ScoredDonor[];
}

export function matchAndScoreDonors(
  allDonors: Donor[],
  requestedBloodGroup: BloodGroup,
  hospitalCity: string,
  hospitalLat?: number | null,
  hospitalLon?: number | null
): MatchResult {
  
  // Find all compatible blood groups for the request
  // (e.g., if they request A+, valid donors are A+, A-, O+, O-)
  const validDonorGroups = Object.keys(COMPATIBILITY_MATRIX).filter(donorGroup => 
    COMPATIBILITY_MATRIX[donorGroup as BloodGroup].includes(requestedBloodGroup)
  );

  const eligible = allDonors.filter((donor) => {
    // Check if the donor's blood group is in the valid list
    if (!validDonorGroups.includes(donor.blood_group)) return false;
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

  // Separate exact matches from compatible matches
  return {
    exactMatches: scored.filter(d => d.blood_group === requestedBloodGroup),
    compatibleMatches: scored.filter(d => d.blood_group !== requestedBloodGroup)
  };
}