import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Props {
  onAlertCountChange: (count: number) => void;
}

export function DonorNotifications({ onAlertCountChange }: Props) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      if (data) {
        setAlerts(data);
        onAlertCountChange(data.length); // Update parent badge
      }
    };
    fetchAlerts();

    const channel = supabase
      .channel('blood-alerts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        () => {
          fetchAlerts(); // Re-fetch on any change to update counts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onAlertCountChange]);

  const clearAlerts = async () => {
    if (!window.confirm("Are you sure you want to clear all alerts? This will delete them permanently.")) return;
    
    setAlerts([]); 
    onAlertCountChange(0);

    const { error } = await supabase
      .from('blood_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (error) {
      toast.error('Database error: Could not clear alerts.');
    } else {
      toast.success('All alerts permanently cleared!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Live Emergency Alerts</h2>
          <p className="text-slate-500">You receive these alerts because hospitals urgently need your blood type.</p>
        </div>
        {alerts.length > 0 && (
          <button 
            onClick={clearAlerts}
            className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"
          >
            Clear All Alerts
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-400 text-lg">No active alerts right now. You are safe!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 bg-white shadow-sm border border-red-200 border-l-4 border-l-red-600 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg text-slate-800">URGENT: {alert.blood_group} Needed</p>
                  <p className="text-slate-600 font-medium mt-1">{alert.hospital_name || 'Local Hospital'}</p>
                  <p className="text-sm text-slate-500 mt-2">Location: {alert.hospital_city || 'City Center'}</p>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {alert.urgency}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}