import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { matchAndScoreDonors } from '../lib/matching';
import { PriorityScoreBar } from './PriorityScoreBar';
import type { BloodRequest, CreateBloodRequest, Donor, ScoredDonor, BloodGroup } from '../lib/types';
import { CreateBloodRequestSchema } from '../lib/types';
import toast from 'react-hot-toast';

const BLOOD_GROUPS: BloodGroup[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

interface Props {
  userId: string;
}

export function HospitalDashboard({ userId }: Props) {
  const [form, setForm] = useState({
    hospital_name: '',
    blood_group: 'O+' as BloodGroup,
    urgency: 'urgent' as 'critical' | 'urgent' | 'normal',
    hospital_city: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState<ScoredDonor[]>([]);
  const [activeRequest, setActiveRequest] = useState<BloodRequest | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  // Listen for new Accept responses on the current request
  useEffect(() => {
    if (!activeRequest?.id) return;

    const channel = supabase
      .channel(`request-${activeRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_responses',
          filter: `request_id=eq.${activeRequest.id}`,
        },
        (payload) => {
          const resp = payload.new;
          setResponses((prev) => [...prev, resp]);
          if (resp.status === 'accepted') {
            toast.success('A donor has accepted the request! 🎉', { duration: 5000 });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRequest?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMatchedDonors([]);
    setResponses([]);

    try {
      const parsed = CreateBloodRequestSchema.parse(form);

      // 1. Insert the request
      const { data: request, error } = await supabase
        .from('blood_requests')
        .insert({
          hospital_name: parsed.hospital_name,
          blood_group: parsed.blood_group,
          urgency: parsed.urgency,
          hospital_city: parsed.hospital_city,
          notes: parsed.notes || null,
          created_by: userId,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      setActiveRequest(request as BloodRequest);
      toast.success('Emergency request submitted! Matching donors...');

      // 2. Fetch all donors and run matching + scoring
      const { data: donors, error: donorError } = await supabase
        .from('donors')
        .select('*');

      if (donorError) throw donorError;

      const scored = matchAndScoreDonors(
        (donors || []) as Donor[],
        parsed.blood_group,
        parsed.hospital_city
      );

      setMatchedDonors(scored);

      if (scored.length === 0) {
        toast('No eligible donors found right now.', { icon: '⚠️' });
      } else {
        toast.success(`Found ${scored.length} eligible donor(s). Sorted by priority.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Request Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          Submit Emergency Blood Request
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Matching donors will be ranked by Triage Priority Score (Proximity + Recency + Reliability).
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hospital Name
            </label>
            <input
              name="hospital_name"
              value={form.hospital_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blood-500 outline-none"
              placeholder="City General Hospital"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Blood Group Needed
            </label>
            <select
              name="blood_group"
              value={form.blood_group}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blood-500 outline-none"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Urgency
            </label>
            <select
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blood-500 outline-none"
            >
              <option value="critical">Critical</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hospital City
            </label>
            <input
              name="hospital_city"
              value={form.hospital_city}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blood-500 outline-none"
              placeholder="Mumbai"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-blood-500 outline-none"
              placeholder="Patient in ICU, need within 2 hours..."
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blood-600 hover:bg-blood-700 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-lg"
            >
              {loading ? 'Submitting & Matching...' : '🚨 Submit Emergency Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Matched Donors - Sorted by Priority Score */}
      {matchedDonors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              Matched Donors ({matchedDonors.length})
            </h3>
            <span className="text-xs text-slate-500">
              Sorted by Triage Priority Score
            </span>
          </div>

          <div className="space-y-4">
            {matchedDonors.map((donor, index) => (
              <div
                key={donor.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blood-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blood-100 text-blood-700 font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">{donor.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                        {donor.blood_group}
                      </span>
                      <span className="text-xs text-slate-500">
                        {donor.city}, {donor.state}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Phone: {donor.phone}</span>
                      <span>Past donations: {donor.total_donations}</span>
                      <span>
                        Last donation:{' '}
                        {donor.last_donation_date
                          ? new Date(donor.last_donation_date).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <PriorityScoreBar score={donor.priority_score} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Acceptances */}
      {responses.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <h4 className="font-bold text-emerald-800 mb-3">
            Live Responses ({responses.length})
          </h4>
          <ul className="space-y-2">
            {responses.map((r) => (
              <li key={r.id} className="text-sm text-emerald-700">
                Donor {r.status === 'accepted' ? '✅ accepted' : '❌ declined'} the request
                at {new Date(r.created_at).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
