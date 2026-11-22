import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePriorityScore } from '../lib/matching';
import { PriorityScoreBar } from './PriorityScoreBar';
import type { Donor, ScoredDonor } from '../lib/types';

export function DonorDirectory() {
  const [donors, setDonors] = useState<ScoredDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('donors').select('*');
      
      if (data && !error) {
        const scored = data.map((d: Donor) => ({
          ...d,
          priority_score: calculatePriorityScore(d, '') 
        }));
        scored.sort((a, b) => b.priority_score - a.priority_score);
        setDonors(scored);
      }
      setLoading(false);
    };

    fetchDonors();
  }, []);

  // Filter logic
  const filteredDonors = donors.filter((donor) => {
    const nameMatch = (donor.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (donor.phone || '').includes(searchTerm);
    const cityMatch = (donor.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const areaMatch = (donor.area || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = nameMatch || phoneMatch || cityMatch || areaMatch;
    const matchesGroup = filterGroup === 'All' || donor.blood_group === filterGroup;
    
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registered Donor Directory</h2>
          <p className="text-sm text-slate-500">Search and filter all donors in the RaktaSetu network.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search name, phone, area, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="All">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading directory...</p>
        ) : filteredDonors.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No donors found matching "{searchTerm}".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Donor Name</th>
                  <th className="px-6 py-4 font-semibold">Age</th>
                  <th className="px-6 py-4 font-semibold">Blood Group</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Phone Number</th>
                  <th className="px-6 py-4 font-semibold">Last Donation</th>
                  <th className="px-6 py-4 font-semibold text-center">Triage Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{donor.name}</td>
                    <td className="px-6 py-4 text-slate-600">{donor.age || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-md text-xs">
                        {donor.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {/* Display Area, City, State */}
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{donor.area || 'N/A'}</span>
                        <span className="text-xs text-slate-500">{donor.city}, {donor.state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <a href={`tel:${donor.phone}`} className="hover:text-red-600 underline">
                        {donor.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : (
                        <span className="text-emerald-600 font-medium">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 w-48">
                      <PriorityScoreBar score={donor.priority_score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}