import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
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
import { About } from './components/About';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'donor' | 'profile' | 'hospital' | 'directory' | 'about' | 'notifications'>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  // --- GLOBAL NOTIFICATION LISTENER ---
  useEffect(() => {
    const updateCount = async () => {
      const { count } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      
      console.log("Checking count...", count);
      setAlertCount(count || 0);
    };

    updateCount();

    const channel = supabase
      .channel('global-notification-tracker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        () => {
          updateCount(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTabChange = (tab: 'home' | 'donor' | 'profile' | 'hospital' | 'directory' | 'about' | 'notifications') => {
    setActiveTab(tab);
    setIsMenuOpen(false); 
    if (tab === 'hospital' || tab === 'directory') {
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-800 transition-colors focus:outline-none flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-semibold hidden sm:block">Menu</span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('home')}>
              <img src="/logo.png" alt="RaktaSetu Logo" className="h-9 w-auto object-contain" />
              <h1 className="text-xl font-bold text-slate-800">RaktaSetu</h1>
            </div>
          </div>

          {/* Right Side: Bell Icon with Live Badge */}
          <div className="flex items-center">
            <button 
              onClick={() => handleTabChange('notifications')}
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
            >
              <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {alertCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full animate-pulse shadow-md">
                  {alertCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Sliding Drawer */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} rounded-r-2xl`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Navigation</h2>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 flex-1">
            <button onClick={() => handleTabChange('home')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'home' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>Home</button>
            <button onClick={() => handleTabChange('donor')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'donor' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>Donor Registration</button>
            <button onClick={() => handleTabChange('profile')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'profile' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>My Profile & Documents</button>
            <button onClick={() => handleTabChange('hospital')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'hospital' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>Hospital Portal</button>
            <button onClick={() => handleTabChange('directory')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'directory' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>Donor Directory</button>
            <button onClick={() => handleTabChange('about')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'about' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>About & Manual</button>
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">RaktaSetu © 2026</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full py-6 px-4">
        
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <img src="/logo.png" alt="RaktaSetu Logo" className="w-full max-w-xs h-auto object-contain drop-shadow-2xl mb-2" />
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Welcome to <span className="text-red-600">RaktaSetu</span></h1>
            <h2 className="text-xl text-slate-600 max-w-2xl font-medium">The bridge between hospitals and life-savers.</h2>
            <p className="text-slate-500 max-w-2xl text-base">We connect critical blood requirements directly to eligible, nearby donors in real-time.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button onClick={() => handleTabChange('donor')} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">Become a Donor</button>
              <button onClick={() => handleTabChange('hospital')} className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">Hospital Emergency Request</button>
            </div>
          </div>
        )}

        {activeTab === 'donor' && (
          <div className="space-y-12 pb-20">
            <DonorRegistration />
            <BloodCompatibility />
            <DonorGuide />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-12 pb-20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800">My Profile & Documents</h1>
              <p className="text-slate-500">Update your details or download your certificates and reports.</p>
            </div>
            <EditProfile />
            <DonationCertificate />
            <BloodReport />
          </div>
        )}

        {/* NOTIFICATIONS TAB - Removed the callback so it can't interfere with the bell */}
        {activeTab === 'notifications' && (
          <div className="space-y-12 pb-20">
            <DonorNotifications />
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

        {activeTab === 'about' && (
          <div className="space-y-12 pb-20">
            <About />
          </div>
        )}
      </main>
    </div>
  );
}