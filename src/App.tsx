import { useState } from 'react';
import { DonorRegistration } from './components/DonorRegistration';
import { HospitalDashboard } from './components/HospitalDashboard';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'donor' | 'hospital'>('donor');

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <h1 className="text-xl font-bold text-slate-800">RaktaSetu</h1>
          </div>
          
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'donor' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donor Portal
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto py-10 px-4">
        {activeTab === 'donor' ? (
          <DonorRegistration />
        ) : (
          <HospitalDashboard />
        )}
      </main>
    </div>
  );
}