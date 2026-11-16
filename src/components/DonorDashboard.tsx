import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Donor, BloodRequest } from '../lib/types';
import toast from 'react-hot-toast';

interface Props {
  donor: Donor;
  onUpdate: () => void;
}

export function DonorDashboard({ donor, onUpdate }: Props) {
  const [incomingRequest, setIncomingRequest] = useState<BloodRequest | null>(null);
  const [responding, setResponding] = useState(false);

  // Real-time listener for new blood requests of matching blood group
  useEffect(() => {
    if (!donor.consent_sms || !donor.is_available) return;

    const channel = supabase
      .channel('blood-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blood_requests',
          filter: `blood_group=eq.${donor.blood_group}`,
        },
        (payload) => {
          const request = payload.new as BloodRequest;
          // Only show if status is open
          if (request.status === 'open') {
            setIncomingRequest(request);
            // Also show a toast immediately
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  <div className="flex-1 p-4">
                    <p className="text-sm font-bold text-blood-700">
                      🚨 URGENT: {request.blood_group} needed
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      at <strong>{request.hospital_name}</strong> ({request.hospital_city})
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Urgency: {request.urgency.toUpperCase()}
                    </p>
                  </div>
                </div>
              ),
              { duration: 8000 }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donor.blood_group, donor.consent_sms, donor.is_available]);

  const handleResponse = async (status: 'accepted' | 'declined') => {
    if (!incomingRequest) return;
    setResponding(true);

    try {
      // Record the response
      const { error: respError } = await supabase.from('request_responses').insert({
        request_id: incomingRequest.id,
        donor_id: donor.id,
        status,
      });

      if (respError) throw respError;

      if (status === 'accepted') {
        // Optionally mark donor temporarily unavailable
        await supabase
          .from('donors')
          .update({ is_available: false })
          .eq('id', donor.id);

        toast.success('Thank you! Hospital has been notified of your acceptance.');
        onUpdate();
      } else {
        toast('You declined this request.', { icon: 'ℹ️' });
      }

      setIncomingRequest(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to record response');
    } finally {
      setResponding(false);
    }
  };

  const toggleAvailability = async () => {
    const { error } = await supabase
      .from('donors')
      .update({ is_available: !donor.is_available })
      .eq('id', donor.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        donor.is_available ? 'You are now unavailable' : 'You are now available for requests'
      );
      onUpdate();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{donor.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {donor.blood_group} • {donor.city}, {donor.state}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Total donations: {donor.total_donations} • Phone: {donor.phone}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              donor.is_available
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {donor.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              donor.is_available
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {donor.is_available ? 'Set Unavailable' : 'Set Available'}
          </button>
        </div>
      </div>

      {/* Incoming Emergency Alert Modal */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in">
            <div className="text-center">
              <div className="text-4xl mb-3">🚨</div>
              <h3 className="text-xl font-bold text-blood-700">
                URGENT BLOOD REQUEST
              </h3>
              <p className="mt-2 text-slate-600">
                <span className="font-semibold text-lg">{incomingRequest.blood_group}</span>{' '}
                blood needed at
              </p>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {incomingRequest.hospital_name}
              </p>
              <p className="text-sm text-slate-500">
                {incomingRequest.hospital_city} • Urgency:{' '}
                <span className="uppercase font-medium">{incomingRequest.urgency}</span>
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleResponse('declined')}
                disabled={responding}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => handleResponse('accepted')}
                disabled={responding}
                className="flex-1 py-3 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-semibold disabled:opacity-50"
              >
                {responding ? 'Sending...' : 'Accept & Donate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blood-50 border border-blood-100 rounded-xl p-4 text-sm text-blood-800">
        <p className="font-medium">How alerts work</p>
        <p className="mt-1 text-blood-700/80">
          When a hospital requests {donor.blood_group} blood, you will instantly see a
          pop-up here (and a toast notification) if you are logged in and available.
        </p>
      </div>
    </div>
  );
}
