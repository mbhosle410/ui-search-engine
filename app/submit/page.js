'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    library: '',
    framework: 'React',
    docUrl: ''
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setStatus('success');
      setFormData({ name: '', library: '', framework: 'React', docUrl: '' });
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit a Component</h1>
          <p className="text-gray-500 text-sm mt-2">
            Found a cool library? Add it to the index.
          </p>
        </div>

        {/* Success Message */}
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800">Thank You!</h3>
            <p className="text-gray-500 mt-2">Your submission has been sent for review.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-6 text-blue-600 font-medium hover:underline"
            >
              Submit another
            </button>
            <div className="mt-4">
              <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">
                &larr; Back to Search
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Component Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Carousel"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Library Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Library Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Swiper.js"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.library}
                onChange={(e) => setFormData({ ...formData, library: e.target.value })}
              />
            </div>

            {/* Framework Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.framework}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
              >
                <option value="React">React</option>
                <option value="Vue">Vue</option>
                <option value="Svelte">Svelte</option>
                <option value="CSS">CSS Only</option>
              </select>
            </div>

            {/* Doc URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documentation URL</label>
              <input
                required
                type="url"
                placeholder="https://..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.docUrl}
                onChange={(e) => setFormData({ ...formData, docUrl: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Component'}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}