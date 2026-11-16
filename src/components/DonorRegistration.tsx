import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { DonorRegistrationSchema, type BloodGroup } from '../lib/types';
import toast from 'react-hot-toast';

const BLOOD_GROUPS: BloodGroup[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

interface Props {
  userId?: string;
  onSuccess?: () => void;
}

export function DonorRegistration({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    blood_group: 'O+' as BloodGroup,
    city: '',
    state: '',
    consent_sms: false,
    last_donation_date: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsed = DonorRegistrationSchema.parse({
        ...form,
        last_donation_date: form.last_donation_date || null,
        is_available: true,
      });

      // Insert directly into Supabase without requiring user_id
      const { error } = await supabase.from('donors').insert({
        name: parsed.name,
        phone: parsed.phone,
        blood_group: parsed.blood_group,
        city: parsed.city,
        state: parsed.state,
        consent_sms: parsed.consent_sms,
        is_available: true,
        last_donation_date: parsed.last_donation_date || null,
        total_donations: 0,
      });

      if (error) throw error;

      toast.success('Registration successful! You can now receive emergency alerts.');
      
      // Clear form
      setForm({
        name: '', phone: '', blood_group: 'O+', city: '', state: '', consent_sms: false, last_donation_date: ''
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Registration failed. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Become a Donor</h2>
      <p className="text-slate-500 mb-6 text-sm">
        Register once. Get real-time alerts when hospitals need your blood type.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="Priya Sharma"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Blood Group
          </label>
          <select
            name="blood_group"
            value={form.blood_group}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Mumbai"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              State
            </label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Maharashtra"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last Donation Date <span className="text-slate-400">(optional)</span>
          </label>
          <input
            name="last_donation_date"
            type="date"
            value={form.last_donation_date}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consent_sms"
            checked={form.consent_sms}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-slate-600">
            I consent to receive emergency blood request notifications
            (SMS / in-app alerts). I understand this is critical for saving lives.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !form.consent_sms}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Registering...' : 'Register as Donor'}
        </button>
      </form>
    </div>
  );
}