import type { Donor, ScoredDonor, BloodGroup } from './types';

/**
 * Triage Priority Score (0-100)
 * - Proximity  40%  → exact city match
 * - Recency    30%  → longer since last donation = higher
 * - Reliability 30% → more past donations = higher
 */
export function calculatePriorityScore(
  donor: Donor,
  hospitalCity: string
): number {
  // 1. Proximity (40 pts)
  const proximity =
    donor.city.trim().toLowerCase() === hospitalCity.trim().toLowerCase()
      ? 40
      : 0;

  // 2. Recency (30 pts)
  let recency = 0;
  if (!donor.last_donation_date) {
    // Never donated → maximum recency points
    recency = 30;
  } else {
    const last = new Date(donor.last_donation_date);
    const daysSince = Math.floor(
      (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince >= 90) {
      // Linear scale: 90 days → 0 pts, 365 days → 30 pts
      const effective = Math.min(daysSince, 365);
      recency = ((effective - 90) / (365 - 90)) * 30;
    }
  }

  // 3. Reliability (30 pts)
  // 1 donation ≈ 5 pts, 6+ donations = full 30
  const reliability = Math.min(30, (donor.total_donations || 0) * 5);

  const total = proximity + recency + reliability;
  return Math.round(Math.min(100, Math.max(0, total)));
}

/**
 * Filter eligible donors + score + sort (highest score first)
 */
export function matchAndScoreDonors(
  allDonors: Donor[],
  bloodGroup: BloodGroup,
  hospitalCity: string
): ScoredDonor[] {
  const eligible = allDonors.filter((donor) => {
    if (donor.blood_group !== bloodGroup) return false;
    if (!donor.consent_sms) return false;
    if (!donor.is_available) return false;

    // last_donation_date must be NULL or older than 90 days
    if (donor.last_donation_date) {
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.last_donation_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSince < 90) return false;
    }

    return true;
  });

  const scored: ScoredDonor[] = eligible.map((donor) => ({
    ...donor,
    priority_score: calculatePriorityScore(donor, hospitalCity),
  }));

  // Highest priority first
  scored.sort((a, b) => b.priority_score - a.priority_score);

  return scored;
}
