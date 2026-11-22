import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const getMockCoordinates = (city: string) => {
  const c = city.toLowerCase();
  if (c.includes('mumbai')) return { lat: 19.0760, lon: 72.8777 };
  if (c.includes('delhi')) return { lat: 28.7041, lon: 77.1025 };
  if (c.includes('bangalore') || c.includes('bengaluru')) return { lat: 12.9716, lon: 77.5946 };
  if (c.includes('pune')) return { lat: 18.5204, lon: 73.8567 };
  return { lat: null, lon: null };
};

export function EditProfile() {
  const [phone, setPhone] = useState('');
  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('donors').select('*').eq('phone', phone).single();
    if (error || !data) {
      toast.error('No donor found with this phone number.');
      setDonor(null);
    } else {
      setDonor(data);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const coords = getMockCoordinates(donor.city);

    // Validate Age if they entered one
    const ageNum = donor.age ? parseInt(donor.age) : null;
    if (ageNum && (ageNum < 18 || ageNum > 65)) {
      toast.error('Age must be between 18 and 65.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('donors')
      .update({
        name: donor.name,
        age: ageNum,
        city: donor.city,
        state: donor.state,
        blood_group: donor.blood_group,
        is_available: donor.is_available,
        latitude: coords.lat,
        longitude: coords.lon,
      })
      .eq('id', donor.id)
      .select();

    if (error) {
      toast.error('Failed to update: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
      if (data && data.length > 0) setDonor(data[0]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Update Your Details</h2>
      
      {!donor ? (
        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="tel" placeholder="Enter your registered phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" required />
          <button type="submit" disabled={loading} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition">{loading ? 'Searching...' : 'Find'}</button>
        </form>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input value={donor.name} onChange={(e) => setDonor({ ...donor, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age (18-65)</label>
              <input type="number" min="18" max="65" value={donor.age || ''} onChange={(e) => setDonor({ ...donor, age: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input value={donor.city} onChange={(e) => setDonor({ ...donor, city: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input value={donor.state} onChange={(e) => setDonor({ ...donor, state: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
            <select value={donor.blood_group} onChange={(e) => setDonor({ ...donor, blood_group: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer">
            <input type="checkbox" checked={donor.is_available} onChange={(e) => setDonor({ ...donor, is_available: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500" />
            <span className="text-sm font-medium text-slate-700">I am currently available to donate</span>
          </label>
          <div className="flex gap-2 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">{loading ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => setDonor(null)} className="flex-1 bg-slate-200 text-slate-800 py-2.5 rounded-lg font-semibold hover:bg-slate-300 transition">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}