'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Function to check PIN and load data
  const fetchSubmissions = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin?secret=${pin}`);
    
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data);
      setIsAuthenticated(true);
    } else {
      alert("Wrong PIN!");
    }
    setLoading(false);
  };

  // 2. Function to Approve/Reject
  const handleAction = async (id, action) => {
    if(!confirm(`Are you sure you want to ${action}?`)) return;

    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, secret: pin }),
    });

    if (res.ok) {
      // Remove the item from the local list immediately (UI update)
      setSubmissions(submissions.filter(sub => sub._id !== id));
      alert(action === 'approve' ? "Approved! It's now live." : "Rejected and deleted.");
    } else {
      alert("Action failed.");
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter PIN"
            className="w-full p-3 border rounded mb-4"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button 
            onClick={fetchSubmissions}
            className="w-full bg-black text-white p-3 rounded hover:bg-gray-800"
          >
            {loading ? 'Checking...' : 'Enter Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Review Submissions</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-red-500">Logout</button>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">No pending submissions. Good job!</div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div key={sub._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                
                {/* Data Display */}
                <div>
                  <h3 className="text-xl font-bold">{sub.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="font-semibold text-gray-700">{sub.library}</span> • {sub.framework}
                  </div>
                  <a href={sub.docUrl} target="_blank" className="text-blue-500 text-sm mt-2 block hover:underline">
                    {sub.docUrl}
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(sub._id, 'reject')}
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(sub._id, 'approve')}
                    className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium transition shadow-sm"
                  >
                    Approve
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}