import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { DonorRegistrationSchema, type BloodGroup } from '../lib/types';
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

interface Props { userId?: string; onSuccess?: () => void; }

export function DonorRegistration({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', age: '', blood_group: 'O+' as BloodGroup, city: '', state: '', consent_sms: false, last_donation_date: '',
  });
  
  // Medical Screening States
  const [hasDisease, setHasDisease] = useState(false);
  const [diseaseDetails, setDiseaseDetails] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Block submission if they have a disease
    if (hasDisease) {
      toast.error('Registration denied: Donors with infectious diseases are not eligible.');
      return;
    }

    setLoading(true);

    try {
      const ageNum = parseInt(form.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
        throw new Error('Donor age must be between 18 and 65.');
      }

      const parsed = DonorRegistrationSchema.parse({
        ...form,
        last_donation_date: form.last_donation_date || null,
        is_available: true,
      });

      const coords = getMockCoordinates(parsed.city);

      const { error } = await supabase.from('donors').insert({
        name: parsed.name,
        phone: parsed.phone,
        age: ageNum,
        blood_group: parsed.blood_group,
        city: parsed.city,
        state: parsed.state,
        consent_sms: parsed.consent_sms,
        is_available: true,
        last_donation_date: parsed.last_donation_date || null,
        total_donations: 0,
        latitude: coords.lat,
        longitude: coords.lon,
        has_disease: false, // Always false if they pass the check
        disease_details: null,
      });

      if (error) throw error;

      toast.success('Registration successful!');
      setForm({ name: '', phone: '', age: '', blood_group: 'O+', city: '', state: '', consent_sms: false, last_donation_date: '' });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Become a Donor</h2>
      <p className="text-slate-500 mb-6 text-sm">Register once. Get real-time alerts when hospitals need your blood type.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Priya Sharma" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age (18-65)</label>
            <input name="age" type="number" min="18" max="65" value={form.age} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="25" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
          <select name="blood_group" value={form.blood_group} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none">
            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Mumbai" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <input name="state" value={form.state} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Maharashtra" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Donation Date <span className="text-slate-400">(optional)</span></label>
          <input name="last_donation_date" type="date" value={form.last_donation_date} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" />
        </div>

        {/* --- MEDICAL SCREENING SECTION --- */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <h3 className="text-sm font-bold text-red-800 mb-2">Medical Eligibility Check</h3>
          <label className="flex items-start gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={hasDisease} 
              onChange={(e) => {
                setHasDisease(e.target.checked);
                if (!e.target.checked) setDiseaseDetails('');
              }} 
              className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500" 
            />
            <span className="text-sm text-red-700 font-medium">
              I have a history of infectious diseases (HIV, Hepatitis B/C, Syphilis, Malaria, etc.)
            </span>
          </label>

          {hasDisease && (
            <div className="mt-3">
              <p className="text-xs text-red-600 font-bold mb-2">
                ⚠️ You are not eligible to donate blood. Please consult a doctor.
              </p>
              <input 
                type="text" 
                placeholder="Please specify (Optional)" 
                value={diseaseDetails}
                onChange={(e) => setDiseaseDetails(e.target.value)}
                className="w-full rounded-lg border border-red-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="consent_sms" checked={form.consent_sms} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
          <span className="text-sm text-slate-600">I consent to receive emergency blood request notifications.</span>
        </label>
        
        <button 
          type="submit" 
          disabled={loading || !form.consent_sms || hasDisease} 
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Registering...' : 'Register as Donor'}
        </button>
      </form>
    </div>
  );
}