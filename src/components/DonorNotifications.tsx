import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function DonorNotifications() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch initial alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('blood_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setAlerts(data);
    };
    fetchAlerts();

    // 2. Subscribe to real-time updates (Live Notification!)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'blood_requests' },
        (payload) => {
          setAlerts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔔</span>
        <h2 className="text-xl font-bold text-slate-800">Live Emergency Alerts</h2>
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
                </div>
                <span className="text-xs font-bold text-red-500 uppercase">{alert.urgency}</span>
              </div>
              <p className="text-xs text-red-400 mt-2">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}