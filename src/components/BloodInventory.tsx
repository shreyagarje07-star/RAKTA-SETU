import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function BloodInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    blood_group: 'O+',
    units: 1,
    hospital_name: 'City General Hospital',
  });

  // Fetch inventory
  const fetchInventory = async () => {
    const { data } = await supabase
      .from('blood_inventory')
      .select('*')
      .order('expiry_date', { ascending: true });
    if (data) setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddBlood = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 42); // Blood has a 42-day shelf life

    const { error } = await supabase.from('blood_inventory').insert({
      blood_group: form.blood_group,
      units: form.units,
      hospital_name: form.hospital_name,
      donation_date: today.toISOString().split('T')[0],
      expiry_date: expiry.toISOString().split('T')[0],
    });

    if (error) {
      toast.error('Failed to add blood unit');
      console.error(error);
    } else {
      toast.success('Blood unit added to inventory!');
      fetchInventory(); // Refresh the list
    }
    setLoading(false);
  };

  // Helper to check if expiring soon (less than 7 days)
  const isExpiringSoon = (expiryDate: string) => {
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      
      {/* Add Blood Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🏥 Add Blood to Inventory</h2>
        <form onSubmit={handleAddBlood} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
            <select
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Units</label>
            <input
              type="number"
              min="1"
              value={form.units}
              onChange={(e) => setForm({ ...form, units: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hospital</label>
            <input
              value={form.hospital_name}
              onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            {loading ? 'Adding...' : 'Add Blood'}
          </button>
        </form>
      </div>

      {/* Inventory List */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🩸 Current Inventory</h2>
        {inventory.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No blood units in inventory.</p>
        ) : (
          <div className="space-y-3">
            {inventory.map((item) => {
              const expiring = isExpiringSoon(item.expiry_date);
              return (
                <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center ${expiring ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-slate-800">{item.blood_group}</span>
                      <span className="text-sm text-slate-500">({item.units} units)</span>
                      {expiring && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                          EXPIRING SOON
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Hospital: {item.hospital_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Expiry Date</p>
                    <p className={`text-sm font-semibold ${expiring ? 'text-red-600' : 'text-slate-800'}`}>
                      {new Date(item.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}