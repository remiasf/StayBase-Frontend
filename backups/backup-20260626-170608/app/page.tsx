"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [destination, setDestination] = useState("");
  const [guests, setGuests] = useState("2");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAddress = destination.trim();
    if (!normalizedAddress) {
      return;
    }

    router.push(`/search/${encodeURIComponent(normalizedAddress)}`);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      {/* Greet */}
      <div className="text-center md:text-left mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 sm:text-5xl">
          Find the best vacation rentals
        </h1>
        <p className="text-lg text-slate-600">
          Hotels, houses, apartments and much more around the world at the best prices.
        </p>
      </div>

      {/* SEARCH FORM */}
      <form 
        onSubmit={handleSearch} 
        className="bg-white p-4 rounded-xl shadow-lg border flex flex-col md:flex-row gap-3 items-center"
      >
        {/* DESTINATION FIELD */}
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Where are we heading??"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            required
          />
        </div>

        {/* GUEST NUMBER */}
        <div className="w-full md:w-48 relative">
          <UserPlus className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-700 appearance-none"
          >
            <option value="1">1 adult</option>
            <option value="2">2 adult</option>
            <option value="3">3 adult</option>
            <option value="4">4 adult</option>
          </select>
        </div>

        {/* SEARCH BUTTON */}
        <button
          type="submit"
          className="w-full md:w-auto bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-md text-sm shrink-0"
        >
          Find
        </button>
      </form>

      {/* TEMPLATE */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Trending</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
          {
            name: 'Tokyo, Japan',
            imageUrl: '/tokyo.avif'
          },
          {
            name: 'New York, USA',
            imageUrl: '/NewYork.webp'
          },
          {
            name: 'Kyiv, Ukraine',
            imageUrl: '/kyiv.jpg'    
          }].map((city) => (
            <Link 
              key={city.name}
              href={`/search/${encodeURIComponent(city.name)}?radius=15`}
              className="group block">
              <div key={city.name} className="border bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group">
                <div className="h-52 bg-slate-200 group-hover:scale-105 transition duration-300 flex items-center justify-center text-slate-400">
                  <img 
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-600"
                  />

                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{city.name}</h3>
                  <p className="text-sm text-slate-500">Above 100 listings</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}