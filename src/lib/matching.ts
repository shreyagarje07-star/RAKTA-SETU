import type { Donor, ScoredDonor, BloodGroup } from './types';

export function calculatePriorityScore(donor: Donor, hospitalCity: string): number {
  const donorCity = donor.city ? donor.city.trim().toLowerCase() : '';
  const hospCity = hospitalCity ? hospitalCity.trim().toLowerCase() : '';
  const proximity = donorCity === hospCity ? 40 : 0;

  let recency = 30; // Default for new donors
  if (donor.last_donation_date) {
    const daysSince = Math.floor((Date.now() - new Date(donor.last_donation_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 90) {
      recency = Math.min((daysSince / 365) * 30, 30);
    } else {
      recency = 0;
    }
  }

  const reliability = Math.min(30, (donor.total_donations || 0) * 5);
  return Math.round(Math.min(100, Math.max(0, proximity + recency + reliability)));
}

export function matchAndScoreDonors(
  allDonors: Donor[],
  bloodGroup: BloodGroup,
  hospitalCity: string
): ScoredDonor[] {
  
  const eligible = allDonors.filter((donor) => {
    // 1. Check Blood Group
    if (donor.blood_group !== bloodGroup) return false;
    
    // 2. Check Consent & Availability
    if (!donor.consent_sms) {
      console.log(`Skipping ${donor.name}: No consent`);
      return false;
    }
    if (!donor.is_available) {
      console.log(`Skipping ${donor.name}: Not available`);
      return false;
    }

    // Temporarily disabled the 90-day check to debug
    /* 
    if (donor.last_donation_date) {
      const daysSince = Math.floor((Date.now() - new Date(donor.last_donation_date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 90) {
        console.log(`Skipping ${donor.name}: Donated less than 90 days ago`);
        return false;
      }
    }
    */

    return true;
  });

  const scored: ScoredDonor[] = eligible.map((donor) => ({
    ...donor,
    priority_score: calculatePriorityScore(donor, hospitalCity),
  }));

  scored.sort((a, b) => b.priority_score - a.priority_score);
  return scored;
}