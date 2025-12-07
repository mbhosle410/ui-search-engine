'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        // Debounce search by 300ms
        const timer = setTimeout(async () => {
            setLoading(true);
            const res = await fetch(`/api/search?q=${query}`);
            const data = await res.json();
            setResults(data.data);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);
    useEffect(() => {
        if (!query) {
        setResults([]);
        return;
        }
        const timer = setTimeout(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${query}`);
            const data = await res.json();
            setResults(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

  return (
    <main className="relative min-h-screen flex flex-col items-center py-24 px-4 overflow-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      {/* 1. Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      {/* 2. Radial Gradient Glow */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>


      {/* --- HEADER --- */}
      <div className="text-center mb-12 relative z-10 max-w-2xl">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wide mb-4 uppercase">
          Beta v1.0
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
          UI Component Search
        </h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
          Stop opening 10 tabs. Find the best components across <span className="text-gray-900 font-semibold">MUI, ShadCN, & Mantine</span> in one place.
        </p>
      </div>

      {/* --- SEARCH BAR (Hero) --- */}
      <div className="w-full max-w-2xl mb-16 relative z-20 group">
        <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
          {/* Glow Effect behind search */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
          
          <input
            type="text"
            className="relative w-full p-5 pl-14 rounded-full bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xl text-gray-800 placeholder-gray-400 transition-all"
            placeholder="Search for 'avatar', 'button', 'card'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          {/* Search Icon */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* --- RESULTS GRID --- */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {results.map((item) => (
          <a
            key={item._id}
            href={item.docUrl}
            target="_blank"
            className="flex flex-col p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h2>
                {item.popularityScore >= 90 && (
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">
                    Hot
                  </span>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </div>
            
            <div className="flex gap-2 mt-auto">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {item.library}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                 item.framework === 'React' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
              }`}>
                {item.framework}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* --- FOOTER --- */}
      <div className="mt-20 pb-10 text-center">
        <p className="text-gray-400 text-sm">
          Missing a library?{' '}
          <a href="/submit" className="text-gray-900 font-semibold border-b border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all">
            Submit it here
          </a>
        </p>
      </div>

    </main>
  );
}