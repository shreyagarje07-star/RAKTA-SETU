import { useState } from 'react';

export function About() {
  const [activeSection, setActiveSection] = useState<'about' | 'manual' | 'privacy'>('about');

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <h1 className="text-4xl font-extrabold mb-4 relative z-10">About RaktaSetu</h1>
        <p className="text-lg text-red-100 max-w-2xl mx-auto relative z-10">
          We are a technology-driven bridge connecting hospitals in critical need with everyday heroes—our blood donors. 
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveSection('about')}
          className={`flex-1 py-4 font-semibold text-lg transition-colors ${
            activeSection === 'about' ? 'text-red-600 border-b-4 border-red-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Our Mission
        </button>
        <button
          onClick={() => setActiveSection('manual')}
          className={`flex-1 py-4 font-semibold text-lg transition-colors ${
            activeSection === 'manual' ? 'text-red-600 border-b-4 border-red-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Manual
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`flex-1 py-4 font-semibold text-lg transition-colors ${
            activeSection === 'privacy' ? 'text-red-600 border-b-4 border-red-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Privacy & Safety
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 md:p-10">
        
        {/* SECTION 1: ABOUT */}
        {activeSection === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Why RaktaSetu Exists</h2>
            <p className="text-slate-600 leading-relaxed">
              Every year, thousands of lives are lost not because of a lack of blood, but because of a lack of coordination. 
              Hospitals waste critical hours calling donors manually, while willing donors remain unaware that their blood type is needed just a few kilometers away.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">🚨 The Problem</h3>
                <p className="text-sm text-red-700">Fragmented communication, outdated spreadsheets, and no way to prioritize the closest or most reliable donors during golden hour.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-800 mb-2">✅ Our Solution</h3>
                <p className="text-sm text-emerald-700">A real-time, geographically aware web platform that instantly matches requests to eligible donors using a custom Triage Priority Score.</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MANUAL */}
        {activeSection === 'manual' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-red-100 text-red-600 p-2 rounded-lg">🩸</span> For Donors
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-slate-600 ml-2">
                <li><strong>Register:</strong> Click on the "Donor Portal" from the menu and fill out your basic details (name, age, blood group, city).</li>
                <li><strong>Get Alerts:</strong> Keep your availability turned ON. When a hospital requests your blood type nearby, you will instantly see a red alert on the screen.</li>
                <li><strong>Donate & Get Certified:</strong> Once the hospital confirms your donation, search your phone number in the "Donation Certificate" section to download your official PDF certificate!</li>
                <li><strong>Manage Profile:</strong> Use the "Update Details" section to pause your availability if you are traveling, or correct any typos.</li>
              </ol>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg">🏥</span> For Hospitals
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-slate-600 ml-2">
                <li><strong>Submit a Request:</strong> Go to the "Hospital Portal" and enter the required blood group, urgency, and your city.</li>
                <li><strong>Review Matches:</strong> The system will instantly show you a list of eligible donors sorted by our Triage Priority Score (highest reliability and closest proximity first).</li>
                <li><strong>Use the Map:</strong> View the donor locations on the interactive map to see who is closest to your hospital.</li>
                <li><strong>Close the Loop:</strong> Once a donor accepts and donates, click "Mark as Fulfilled" to remove the alert from the donor network.</li>
              </ol>
            </div>
          </div>
        )}

        {/* SECTION 3: PRIVACY */}
        {activeSection === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Data & Medical Safety</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl">🔒</div>
                <div>
                  <h4 className="font-bold text-slate-800">Data Privacy</h4>
                  <p className="text-sm text-slate-600">We use strict Row-Level Security (RLS) in our database. Your personal information is never sold, and your phone number is only shared with verified hospitals when you explicitly consent.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl">🛡️</div>
                <div>
                  <h4 className="font-bold text-slate-800">Medical Eligibility</h4>
                  <p className="text-sm text-slate-600">RaktaSetu enforces a strict 90-day lockout between donations to protect your health. Donors with a history of infectious diseases are automatically barred from the registry to ensure patient safety.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl">🚫</div>
                <div>
                  <h4 className="font-bold text-slate-800">No Spam Policy</h4>
                  <p className="text-sm text-slate-600">You will only be alerted if a hospital specifically requests your exact blood group in your city. You can pause your alerts at any time using the Donor Portal.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}