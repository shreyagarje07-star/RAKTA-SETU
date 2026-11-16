import { useState } from 'react';
import { DonorRegistration } from './components/DonorRegistration';
import { HospitalDashboard } from './components/HospitalDashboard';
import { DonorNotifications } from './components/DonorNotifications';
import { EditProfile } from './components/EditProfile';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'donor' | 'hospital'>('donor');
  // We add a key to force the Hospital Dashboard to remount and fetch fresh data
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (tab: 'donor' | 'hospital') => {
    setActiveTab(tab);
    if (tab === 'hospital') {
      setRefreshKey((prev) => prev + 1); // Force reload
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      
      <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <h1 className="text-xl font-bold text-slate-800">RaktaSetu</h1>
          </div>
          
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleTabChange('donor')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'donor' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donor Portal
            </button>
            <button
              onClick={() => handleTabChange('hospital')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'hospital' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hospital Portal
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4">
        {activeTab === 'donor' ? (
          <div className="space-y-10 pb-20">
            <DonorRegistration />
            <DonorNotifications />
            <EditProfile />
          </div>
        ) : (
          // The 'key' prop forces the HospitalDashboard to reload completely
          <HospitalDashboard key={refreshKey} />
        )}
      </main>
    </div>
  );
}