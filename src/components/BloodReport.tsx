import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function BloodReport() {
  const [phone, setPhone] = useState('');
  const [donor, setDonor] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data) {
      toast.error('Donor not found.');
      setDonor(null);
      setReportData(null);
    } else {
      setDonor(data);
      setReportData(null);
    }
    setLoading(false);
  };

  const generateReport = () => {
    if (!donor) return;
    
    // Simulate clinical readings for the report (Weight removed)
    const simulatedReadings = {
      hemoglobin: (13.5 + Math.random() * 2).toFixed(1), // 13.5 - 15.5 g/dL
      bloodPressure: `${110 + Math.floor(Math.random() * 15)}/${70 + Math.floor(Math.random() * 10)}`, // e.g., 120/80
      pulse: 70 + Math.floor(Math.random() * 15), // 70 - 85 bpm
      units: 1, // 1 unit (approx 450ml)
      date: new Date().toLocaleDateString(),
      hospital: 'City General Hospital (RaktaSetu Network)',
      bagId: `BAG-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setReportData(simulatedReadings);
    toast.success('Medical report generated!');
  };

  const downloadPDF = async () => {
    if (!reportRef.current || !reportData) return;
    
    toast.loading('Generating PDF...', { id: 'pdf' });
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Blood_Report_${donor.name.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('PDF Downloaded!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Medical Blood Report</h2>
      
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
            {loading ? 'Finding...' : 'Find'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {!reportData ? (
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-slate-600 mb-4">Donor found: <strong>{donor.name}</strong> ({donor.blood_group})</p>
              <button 
                onClick={generateReport}
                className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition w-full"
              >
                Generate Clinical Report
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* The Report Layout */}
              <div ref={reportRef} className="border border-slate-300 p-6 rounded-xl bg-white space-y-4 text-slate-800">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h1 className="text-2xl font-bold text-red-600">RaktaSetu</h1>
                  <p className="text-sm text-slate-500">Official Blood Donation Medical Report</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Donor Name</p>
                    <p className="font-semibold">{donor.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Blood Group</p>
                    <p className="font-bold text-red-600">{donor.blood_group}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-semibold">{donor.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date of Donation</p>
                    <p className="font-semibold">{reportData.date}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-800 mb-2">Clinical Readings (Pre-Donation)</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg">
                    <p>Hemoglobin: <strong>{reportData.hemoglobin} g/dL</strong></p>
                    <p>Blood Pressure: <strong>{reportData.bloodPressure} mmHg</strong></p>
                    <p>Pulse Rate: <strong>{reportData.pulse} bpm</strong></p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-800 mb-2">Collection Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Hospital: <strong>{reportData.hospital}</strong></p>
                    <p>Units Collected: <strong>{reportData.units} Unit (450ml)</strong></p>
                    <p>Bag ID: <strong>{reportData.bagId}</strong></p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 text-center">
                  <p>This is a system-generated report. All readings are medically verified by the attending doctor at {reportData.hospital}.</p>
                </div>
              </div>

              {/* Download Button */}
              <button 
                onClick={downloadPDF}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
              >
                Download Blood Report PDF
              </button>
            </div>
          )}
          
          <button onClick={() => { setDonor(null); setReportData(null); setPhone(''); }} className="text-sm text-slate-500 underline w-full text-center">
            Search another donor
          </button>
        </div>
      )}
    </div>
  );
}