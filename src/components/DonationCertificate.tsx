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
    const currentTotal = donor.total_donations || 0;

    try {
      const { error: updateError } = await supabase
        .from('donors')
        .update({ 
          last_donation_date: today,
          total_donations: currentTotal + 1,
          is_available: false 
        })
        .eq('id', donor.id);

      if (updateError) throw updateError;

      const { data: newCert, error: certError } = await supabase
        .from('certificates')
        .insert({ donor_id: donor.id, hospital_name: 'RaktaSetu Partner Hospital' })
        .select()
        .single();

      if (certError) throw certError;

      setCertificate(newCert);
      setDonor({ ...donor, last_donation_date: today, is_available: false, total_donations: currentTotal + 1 });
      toast.success('Donation recorded! Lockout applied.');
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    toast.loading('Generating PDF...', { id: 'pdf' });
    
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      // Landscape A4
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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Donation Certificate</h2>
      
      {!donor ? (
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="tel"
            placeholder="Enter donor phone number"
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
              
              {/* --- ELEGANT CERTIFICATE DESIGN (MATCHING IMAGE) --- */}
              <div 
                ref={certificateRef} 
                className="relative w-full aspect-[1.414/1] bg-[#f4f4f4] p-8 md:p-12 shadow-2xl overflow-hidden font-serif text-slate-900 border-4 border-white"
                style={{ 
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
                  backgroundColor: '#f0f0f0'
                }}
              >
                {/* Red Outer Border Frame */}
                <div className="absolute inset-4 border border-red-800 pointer-events-none"></div>

                {/* Decorative Red Ribbon Top Right */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-red-500 to-red-800 transform rotate-45 translate-x-40 -translate-y-40 opacity-95 shadow-lg"></div>
                
                {/* Top Text in Ribbon */}
                <div className="absolute top-12 right-12 text-white font-sans font-bold tracking-[0.2em] z-10 text-sm rotate-45 translate-x-12 -translate-y-6">
                  RAKTASETU
                </div>

                {/* Decorative Red Ribbon Bottom Left */}
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-800 to-red-500 transform rotate-45 -translate-x-40 translate-y-40 opacity-95 shadow-lg"></div>

                {/* Blood Drop Image (Placeholder URL, replace with your own if needed) */}
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/2950/2950713.png" 
                  alt="Blood Drop" 
                  className="absolute top-12 right-28 w-16 h-16 object-contain z-20 drop-shadow-xl"
                  crossOrigin="anonymous"
                />

                <div className="relative z-10 flex flex-col h-full text-center justify-between px-8 py-4">
                  
                  {/* Header */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800">Blood Donor Day</h3>
                    <h1 className="text-5xl md:text-7xl font-black text-red-800 font-serif mt-1 mb-1 tracking-tight">Certificate</h1>
                    <p className="text-xl md:text-2xl italic text-slate-800">In Grateful Recognition</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-2 mt-2">
                    <p className="text-base md:text-lg text-slate-800">This certificate is proudly presented to</p>
                    
                    <div className="w-full max-w-xl mx-auto border-b border-slate-400 pb-1 mb-4">
                      <h2 className="text-4xl md:text-5xl font-bold text-red-800 capitalize">{donor.name}</h2>
                    </div>

                    <p className="text-sm md:text-base text-slate-800 leading-relaxed max-w-2xl mx-auto">
                      For the selfless act of donating blood and helping to save lives,<br/>
                      our generosity is a gift of hope and health to those in need.
                    </p>
                    
                    <p className="text-sm md:text-base text-slate-800 leading-relaxed max-w-2xl mx-auto mt-2">
                      On this occasion of World Blood Donor Day, we honor your courage,<br/>
                      compassion, and contribution to humanity.
                    </p>

                    <p className="text-base md:text-xl italic font-serif text-slate-900 mt-6">
                      "A single pint can save three lives. A single gesture can create a million smiles."
                    </p>
                  </div>

                  {/* Footer Signatures */}
                  <div className="flex justify-between items-end mt-4 px-12 md:px-20 pb-4">
                    <div className="text-center w-48">
                      <p className="border-t border-slate-800 pt-1 font-bold text-lg">{new Date(certificate.issued_at).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-700 mt-1">Date</p>
                    </div>
                    <div className="text-center w-64">
                      <p className="border-t border-slate-800 pt-1 font-bold text-lg truncate px-2">{certificate.hospital_name}</p>
                      <p className="text-sm text-slate-700 mt-1">Head of Hospital</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* --- END CERTIFICATE DESIGN --- */}

              <button 
                onClick={downloadPDF}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-md"
              >
                Download PDF Certificate
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600 mb-4">No certificate found for this donor yet.</p>
              <p className="text-xs text-slate-400 mb-4">(For demo, click below to simulate the hospital confirming your donation)</p>
              <button 
                onClick={handleMarkAsDonated}
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition w-full shadow-md"
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