import { useState } from 'react';

export function DonorGuide() {
  const [activeTab, setActiveTab] = useState<'process' | 'benefits' | 'guidelines'>('process');

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      
      {/* Hero Section */}
      <div className="bg-red-600 p-8 text-center text-white relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <h2 className="text-3xl font-extrabold mb-2 relative z-10">Be a Hero. Donate Blood.</h2>
        <p className="text-red-100 text-lg max-w-2xl mx-auto relative z-10">
          "The blood you donate gives someone another chance at life. One day that someone may be a close relative, a friend, a loved one—or even you."
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('process')}
          className={`flex-1 py-4 font-semibold text-sm transition-colors ${
            activeTab === 'process' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📋 Donation Process
        </button>
        <button
          onClick={() => setActiveTab('benefits')}
          className={`flex-1 py-4 font-semibold text-sm transition-colors ${
            activeTab === 'benefits' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ❤️ Benefits
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex-1 py-4 font-semibold text-sm transition-colors ${
            activeTab === 'guidelines' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ⚠️ Guidelines
        </button>
      </div>

      {/* Content Area */}
      <div className="p-8">
        
        {/* TAB 1: PROCESS */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">What happens when you donate?</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl mb-2 block">1️⃣</span>
                <h4 className="font-bold text-slate-700">Registration</h4>
                <p className="text-sm text-slate-600 mt-1">You will be asked to fill out a confidential form and show a valid ID. Your details are securely stored in our registry.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl mb-2 block">2️⃣</span>
                <h4 className="font-bold text-slate-700">Medical Checkup</h4>
                <p className="text-sm text-slate-600 mt-1">A quick health check will be done. We will check your hemoglobin levels, blood pressure, and pulse to ensure it is safe for you to donate.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl mb-2 block">3️⃣</span>
                <h4 className="font-bold text-slate-700">The Donation</h4>
                <p className="text-sm text-slate-600 mt-1">The actual blood donation takes only 8-10 minutes. You will relax on a comfortable bed while a sterile needle collects one unit (about 350-450ml) of blood.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl mb-2 block">4️⃣</span>
                <h4 className="font-bold text-slate-700">Refreshments & Certificate</h4>
                <p className="text-sm text-slate-600 mt-1">You will be given snacks and juice to replenish your energy. Once confirmed, you will instantly receive a digital Certificate of Appreciation on this portal!</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BENEFITS */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                  <span>🧑‍🤝‍🧑</span> For the Patient
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><span>✅</span> Saves up to 3 lives with a single donation (red cells, platelets, plasma).</li>
                  <li className="flex gap-2"><span>✅</span> Essential for accident victims, surgery patients, and cancer treatments.</li>
                  <li className="flex gap-2"><span>✅</span> Helps patients with chronic illnesses like Thalassemia and Sickle Cell Anemia.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <span>💪</span> For the Donor (You)
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><span>✅</span> <strong>Free Health Checkup:</strong> You get a mini blood test and BP check.</li>
                  <li className="flex gap-2"><span>✅</span> <strong>Reduces Heart Attack Risk:</strong> Regular donation helps maintain iron levels in the body.</li>
                  <li className="flex gap-2"><span>✅</span> <strong>Burns Calories:</strong> Donating one unit of blood burns roughly 650 calories.</li>
                  <li className="flex gap-2"><span>✅</span> <strong>Mental Satisfaction:</strong> The knowledge that you saved a life is the greatest reward.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDELINES */}
        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Medical Eligibility Guidelines</h3>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-red-800 text-sm">Who CANNOT donate?</h4>
              <p className="text-sm text-red-700 mt-1">
                You should not donate if you have a cold, flu, active infection, are pregnant, or have had a tattoo/piercing in the last 6 months. You must weigh at least 50kg.
              </p>
            </div>

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-emerald-800 text-sm">The 90-Day Rule</h4>
              <p className="text-sm text-emerald-700 mt-1">
                Your body takes time to replenish its red blood cells. Our system automatically enforces a strict <strong>90-day gap</strong> between donations. You will not receive emergency alerts during this recovery period.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-blue-800 text-sm">How to prepare?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Drink plenty of water before your donation. Eat an iron-rich meal (like leafy greens or beans) and avoid fatty foods. Get a good night's sleep. Do not drink alcohol 24 hours before donating.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}