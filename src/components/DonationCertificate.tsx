import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function DonationCertificate() {
  const [phone, setPhone] = useState('');
  const [donor, setDonor] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: donorData, error: donorError } = await supabase
      .from('donors')
      .select('*')
      .eq('phone', phone)
      .single();

    if (donorError || !donorData) {
      toast.error('Donor not found.');
      setDonor(null);
      setCertificate(null);
      setLoading(false);
      return;
    }

    setDonor(donorData);

    const { data: certData } = await supabase
      .from('certificates')
      .select('*')
      .eq('donor_id', donorData.id)
      .order('issued_at', { ascending: false })
      .limit(1)
      .single();

    setCertificate(certData || null);
    setLoading(false);
  };

  const handleMarkAsDonated = async () => {
    if (!donor) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    try {
      const { error: updateError } = await supabase
        .from('donors')
        .update({ 
          last_donation_date: today,
          total_donations: (donor.total_donations || 0) + 1,
          is_available: false
        })
        .eq('id', donor.id);

      if (updateError) throw updateError;

      const { data: newCert, error: certError } = await supabase
        .from('certificates')
        .insert({ donor_id: donor.id, hospital_name: 'City General Hospital' })
        .select()
        .single();

      if (certError) throw certError;

      setCertificate(newCert);
      setDonor({ ...donor, last_donation_date: today, is_available: false });
      toast.success('Donation recorded! Certificate generated.');
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: PDF DOWNLOAD FUNCTION ---
  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    
    toast.loading('Generating PDF...', { id: 'pdf' });
    
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      // A4 size in landscape
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RaktaSetu_Certificate_${donor.name.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('PDF Downloaded!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Donation Certificate</h2>
      
      {!donor ? (
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <button type="submit" disabled={loading} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition">
            {loading ? 'Checking...' : 'Find'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {certificate ? (
            <div className="space-y-4">
              {/* Certificate UI (This is what gets captured) */}
              <div 
                ref={certificateRef} 
                className="border-8 border-double border-yellow-500 p-8 rounded-xl text-center bg-[#fffdf5] relative overflow-hidden shadow-inner"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-3 bg-red-600"></div>
                <div className="absolute bottom-0 left-0 w-full h-3 bg-red-600"></div>
                
                <h3 className="text-3xl font-serif font-bold text-slate-800 mt-4">Certificate of Appreciation</h3>
                <p className="text-sm text-slate-600 mt-3 uppercase tracking-widest">This is to certify that</p>
                <p className="text-3xl font-bold text-red-700 my-4 font-serif italic">{donor.name}</p>
                <p className="text-sm text-slate-600">has generously donated blood at</p>
                <p className="text-lg font-semibold text-slate-800 mt-1">{certificate.hospital_name}</p>
                <p className="text-xs text-slate-500 mt-6 uppercase tracking-wide">Issued on: {new Date(certificate.issued_at).toLocaleDateString()}</p>
                
                <div className="mt-6 flex justify-center items-center gap-4">
                  <div className="text-4xl">🩸</div>
                  <div className="text-4xl">🏅</div>
                </div>
              </div>

              {/* Download Button */}
              <button 
                onClick={downloadPDF}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
              >
                📥 Download PDF Certificate
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-slate-600 mb-4">No certificate found for this donor yet.</p>
              <p className="text-xs text-slate-400 mb-4">(For demo, click below to simulate the hospital confirming your donation)</p>
              <button 
                onClick={handleMarkAsDonated}
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition w-full"
              >
                {loading ? 'Processing...' : 'Simulate Donation Completion'}
              </button>
            </div>
          )}
          
          <button onClick={() => { setDonor(null); setCertificate(null); setPhone(''); }} className="text-sm text-slate-500 underline w-full text-center">
            Search another donor
          </button>
        </div>
      )}
    </div>
  );
}