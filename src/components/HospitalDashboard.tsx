import { DonorMap } from './DonorMap';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { matchAndScoreDonors } from '../lib/matching';
import { PriorityScoreBar } from './PriorityScoreBar';
import type { BloodRequest, Donor, ScoredDonor, BloodGroup } from '../lib/types';
import { CreateBloodRequestSchema } from '../lib/types';
import toast from 'react-hot-toast';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const getMockCoordinates = (city: string) => {
  const c = city.toLowerCase();
  if (c.includes('mumbai')) return { lat: 19.0760, lon: 72.8777 };
  if (c.includes('delhi')) return { lat: 28.7041, lon: 77.1025 };
  if (c.includes('bangalore') || c.includes('bengaluru')) return { lat: 12.9716, lon: 77.5946 };
  if (c.includes('pune')) return { lat: 18.5204, lon: 73.8567 };
  return { lat: null, lon: null };
};

export function HospitalDashboard({ userId }: { userId?: string }) {
  const [form, setForm] = useState({
    hospital_name: '', blood_group: 'O+' as BloodGroup, urgency: 'urgent' as 'critical' | 'urgent' | 'normal', hospital_city: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Separate states for exact and compatible matches
  const [exactDonors, setExactDonors] = useState<ScoredDonor[]>([]);
  const [compatibleDonors, setCompatibleDonors] = useState<ScoredDonor[]>([]);
  
  const [allMatchedDonors, setAllMatchedDonors] = useState<ScoredDonor[]>([]); // For the map
  const [activeRequest, setActiveRequest] = useState<BloodRequest | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [hospitalCoords, setHospitalCoords] = useState<{ lat: number, lon: number } | null>(null);

  useEffect(() => {
    if (!activeRequest?.id) return;
    const channel = supabase.channel(`request-${activeRequest.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'request_responses', filter: `request_id=eq.${activeRequest.id}` }, (payload) => {
        const resp = payload.new;
        setResponses((prev) => [...prev, resp]);
        if (resp.status === 'accepted') toast.success('A donor has accepted the request! 🎉');
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeRequest?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setExactDonors([]);
    setCompatibleDonors([]);
    setResponses([]);
    setHospitalCoords(null);

    try {
      const parsed = CreateBloodRequestSchema.parse(form);
      const coords = getMockCoordinates(parsed.hospital_city);

      if (coords.lat && coords.lon) setHospitalCoords({ lat: coords.lat, lon: coords.lon });

      const { data: request, error } = await supabase.from('blood_requests').insert({
        hospital_name: parsed.hospital_name,
        blood_group: parsed.blood_group,
        urgency: parsed.urgency,
        hospital_city: parsed.hospital_city,
        notes: parsed.notes || null,
        latitude: coords.lat,
        longitude: coords.lon,
        status: 'open',
      }).select().single();

      if (error) throw error;
      setActiveRequest(request as BloodRequest);

      const { data: donors, error: donorError } = await supabase.from('donors').select('*');
      if (donorError) throw donorError;

      const result = matchAndScoreDonors(
        (donors || []) as Donor[], 
        parsed.blood_group, 
        parsed.hospital_city,
        coords.lat,
        coords.lon
      );
      
      setExactDonors(result.exactMatches);
      setCompatibleDonors(result.compatibleMatches);
      
      // Combine them for the map
      setAllMatchedDonors([...result.exactMatches, ...result.compatibleMatches]);
      
      toast.success(`Found ${result.exactMatches.length} exact and ${result.compatibleMatches.length} compatible donors.`);

    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async () => {
    if (!activeRequest) return;
    const { error } = await supabase.from('blood_requests').update({ status: 'closed' }).eq('id', activeRequest.id);
    if (error) toast.error('Failed to close request');
    else {
      toast.success('Request fulfilled! Alerts removed.');
      setActiveRequest(null);
      setExactDonors([]);
      setCompatibleDonors([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Request Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Submit Emergency Blood Request</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Hospital Name</label>
            <input name="hospital_name" value={form.hospital_name} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none" placeholder="City General Hospital" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group Needed</label>
            <select name="blood_group" value={form.blood_group} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none">
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
            <select name="urgency" value={form.urgency} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none">
              <option value="critical">Critical</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Hospital City</label>
            <input name="hospital_city" value={form.hospital_city} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none" placeholder="Mumbai" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl text-lg">
              {loading ? 'Submitting & Matching...' : 'Submit Emergency Request'}
            </button>
          </div>
        </form>
      </div>

      {activeRequest && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-emerald-800">Active Emergency Request</h3>
            <p className="text-sm text-emerald-600">Found a donor? Mark this request as fulfilled to clear the alerts.</p>
          </div>
          <button onClick={handleResolveRequest} className="mt-4 md:mt-0 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md">
            Mark as Fulfilled & Close Alerts
          </button>
        </div>
      )}

      {hospitalCoords && allMatchedDonors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Donor Proximity Map</h3>
          <DonorMap donors={allMatchedDonors} hospitalLat={hospitalCoords.lat} hospitalLon={hospitalCoords.lon} hospitalName={form.hospital_name} />
        </div>
      )}

      {/* EXACT MATCHES SECTION */}
      {exactDonors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-100">
          <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
            Exact Match Donors ({form.blood_group}) - {exactDonors.length} found
          </h3>
          <div className="space-y-4">
            {exactDonors.map((donor, index) => (
               <DonorCard key={donor.id} donor={donor} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* COMPATIBLE MATCHES SECTION */}
      {compatibleDonors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
            Also Compatible With ({compatibleDonors.length} found)
          </h3>
          <p className="text-sm text-slate-500 mb-4">These donors have compatible blood types that can be safely used for a {form.blood_group} patient.</p>
          <div className="space-y-4">
            {compatibleDonors.map((donor, index) => (
               <DonorCard key={donor.id} donor={donor} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component for the Donor Card
function DonorCard({ donor, index }: { donor: ScoredDonor, index: number }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-emerald-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">{donor.name}</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">{donor.blood_group}</span>
            <span className="text-xs text-slate-500">{donor.city}, {donor.state}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Phone: {donor.phone}</span>
            <span>Past donations: {donor.total_donations}</span>
          </div>
          <div className="mt-3"><PriorityScoreBar score={donor.priority_score} /></div>
        </div>
      </div>
    </div>
  );
}