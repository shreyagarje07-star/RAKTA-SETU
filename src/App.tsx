import { useState } from 'react';
import { DonorRegistration } from './components/DonorRegistration';
import { HospitalDashboard } from './components/HospitalDashboard';
import { DonorNotifications } from './components/DonorNotifications';
import { EditProfile } from './components/EditProfile';
import { DonationCertificate } from './components/DonationCertificate';
import { BloodReport } from './components/BloodReport';
import { BloodInventory } from './components/BloodInventory';
import { DonorDirectory } from './components/DonorDirectory';
import { DonorGuide } from './components/DonorGuide';
import { BloodCompatibility } from './components/BloodCompatibility';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'donor' | 'hospital' | 'directory'>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabChange = (tab: 'home' | 'donor' | 'hospital' | 'directory') => {
    setActiveTab(tab);
    setIsMenuOpen(false); 
    if (tab === 'hospital' || tab === 'directory') {
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col">
      <Toaster position="top-center" />
      
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-800 transition-colors focus:outline-none flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
                <span className="font-semibold hidden sm:block">Menu</span>
              </button>

              {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1 z-50">
                  <button onClick={() => handleTabChange('home')} className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${activeTab === 'home' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>🏠 Home</button>
                  <button onClick={() => handleTabChange('donor')} className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${activeTab === 'donor' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>🩸 Donor Portal</button>
                  <button onClick={() => handleTabChange('hospital')} className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${activeTab === 'hospital' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>🏥 Hospital Portal</button>
                  <button onClick={() => handleTabChange('directory')} className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${activeTab === 'directory' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>📖 Donor Directory</button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('home')}>
              {/* Changed src to /logo.png */}
              <img src="/logo.png" alt="RaktaSetu Logo" className="h-10 w-auto object-contain" />
              <h1 className="text-xl font-bold text-slate-800">RaktaSetu</h1>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full py-6 px-4">
        
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 animate-in fade-in zoom-in duration-500">
            
            {/* Changed src to /logo.png */}
            <img 
              src="/logo.png" 
              alt="RaktaSetu Logo" 
              className="w-full max-w-xs h-auto object-contain drop-shadow-2xl mb-2" 
            />

            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Welcome to <span className="text-red-600">RaktaSetu</span>
            </h1>
            <h2 className="text-xl text-slate-600 max-w-2xl font-medium">
              The bridge between hospitals and life-savers.
            </h2>
            <p className="text-slate-500 max-w-2xl text-base">
              We connect critical blood requirements directly to eligible, nearby donors in real-time. 
              No middlemen. No delays. Just a continuous stream of life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button onClick={() => handleTabChange('donor')} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">Become a Donor</button>
              <button onClick={() => handleTabChange('hospital')} className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">Hospital Emergency Request</button>
            </div>

            <div className="w-full max-w-3xl mt-10 flex items-center justify-between border-t-4 border-dashed border-red-200 pt-6 relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-4 text-red-500 font-bold">Our Mission</div>
               <div className="text-center">
                  <div className="text-4xl mb-1">🏥</div>
                  <p className="font-bold text-slate-700">Hospitals</p>
                  <p className="text-sm text-slate-500">Submit requests</p>
               </div>
               <div className="flex-1 px-4 relative">
                  <div className="h-1 w-full bg-red-400 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl bg-slate-50 px-2">🔗</div>
               </div>
               <div className="text-center">
                  <div className="text-4xl mb-1">🧑‍🤝‍🧑</div>
                  <p className="font-bold text-slate-700">Donors</p>
                  <p className="text-sm text-slate-500">Give the gift of life</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'donor' && (
          <div className="space-y-12 pb-20">
            <DonorRegistration />
            <DonorNotifications />
            <EditProfile />
            <DonationCertificate />
            <BloodReport />
            <BloodCompatibility />
            <DonorGuide />
          </div>
        )}

        {activeTab === 'hospital' && (
          <div className="space-y-12 pb-20">
            <HospitalDashboard key={refreshKey} />
            <BloodInventory />
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="space-y-12 pb-20">
            <DonorDirectory />
          </div>
        )}
      </main>
    </div>
  );
}