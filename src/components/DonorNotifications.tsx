import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function DonorNotifications() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch initial alerts (only 'open' ones)
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (data) setAlerts(data);
    };
    fetchAlerts();

    // 2. Listen for changes in real-time
    const channel = supabase
      .channel('blood-alerts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' }, // Listen to INSERT, UPDATE, and DELETE
        () => {
          // If anything changes, just re-fetch the open alerts
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Wipe the database
  const clearAlerts = async () => {
    // Clear UI immediately so it feels instant
    setAlerts([]); 

    // Delete all requests from the database
    const { error } = await supabase
      .from('blood_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (error) {
      toast.error('Database error: Could not clear alerts.');
      console.error(error);
    } else {
      toast.success('All alerts permanently cleared!');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          <h2 className="text-xl font-bold text-slate-800">Live Emergency Alerts</h2>
        </div>
        {alerts.length > 0 && (
          <button 
            onClick={clearAlerts}
            className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
          >
            Clear All
          </button>
        )}
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        You will receive instant alerts here when a hospital needs your blood group.
      </p>

      {alerts.length === 0 ? (
        <p className="text-center text-slate-400 py-8">No active alerts right now.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-red-700">🚨 URGENT: {alert.blood_group} Needed</p>
                  <p className="text-sm text-red-600">{alert.hospital_name || 'Local Hospital'}</p>
                  <p className="text-xs text-slate-500 mt-1">📍 {alert.hospital_city || 'City Center'}</p>
                </div>
                <span className="text-xs font-bold text-red-500 uppercase">{alert.urgency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}