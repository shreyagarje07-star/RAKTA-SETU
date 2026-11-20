const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Medical compatibility matrix
const compatibilityMap: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal Recipient
};

export function BloodCompatibility() {
  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🩸 Blood Type Compatibility Matrix
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Understanding who you can help, and who can help you.
        </p>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b-2 border-slate-200 bg-slate-50 font-bold text-slate-700 rounded-tl-lg">
                Donor Type
              </th>
              <th className="p-3 border-b-2 border-slate-200 bg-slate-50 font-bold text-slate-700 rounded-tr-lg">
                Can Donate To
              </th>
            </tr>
          </thead>
          <tbody>
            {bloodGroups.map((group) => {
              const isUniversalDonor = group === 'O-';
              const isUniversalRecipient = group === 'AB+';
              
              return (
                <tr key={group} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-10 text-center py-1 bg-red-100 text-red-700 font-bold rounded-md">
                        {group}
                      </span>
                      {isUniversalDonor && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Universal Donor
                        </span>
                      )}
                      {isUniversalRecipient && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Universal Recipient
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {compatibilityMap[group].map((target) => (
                        <span 
                          key={target} 
                          className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200"
                        >
                          {target}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend / Quick Facts */}
      <div className="bg-slate-50 p-4 border-t border-slate-100 grid md:grid-cols-2 gap-4 text-sm">
        <div className="flex gap-3">
          <span className="text-2xl">🌟</span>
          <p className="text-slate-600">
            <strong>O- is the Universal Donor.</strong> Their blood can be given to any patient in an extreme emergency when the patient's blood type is unknown.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="text-2xl">🏥</span>
          <p className="text-slate-600">
            <strong>AB+ is the Universal Recipient.</strong> They can receive blood from absolutely anyone, but can only donate to other AB+ patients.
          </p>
        </div>
      </div>
    </div>
  );
}