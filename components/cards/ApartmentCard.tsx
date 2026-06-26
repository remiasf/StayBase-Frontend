import { MapPin, Users, BedDouble, Maximize } from "lucide-react";
import Link from "next/link";

interface Apartment {
  id: string;
  title: string;
  images: string[];
  size: number;
  rooms: number;
  maxGuests: number;
  price: number;
  priceUsd: number;
  currency: string;
  discountPercent: number;
  city: string;
  address: string;
}

export default function ApartmentCard({ apartment }: { apartment: Apartment }) {
  // Count a discount
  const finalPrice = apartment.discountPercent > 0
    ? apartment.price - (apartment.price * apartment.discountPercent) / 100
    : apartment.price;

  // Make the first image as a main
  const previewImage = apartment.images?.length > 0 
    ? apartment.images[0] 
    : "/images/no-photo.jpg";

  return (
    <Link
      href={`/search/apartment/${apartment.id}`}
      className="group flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      
      {/* image section */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={previewImage}
          alt={apartment.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* discount badge */}
        {apartment.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md tracking-wide">
            -{apartment.discountPercent}%
          </div>
        )}
      </div>

      {/* features */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* title and address */}
        <div className="mb-4">
          <h3 className="font-bold text-xl text-slate-900 line-clamp-1 mb-1.5" title={apartment.title}>
            {apartment.title}
          </h3>
          <div className="flex items-center text-sm text-slate-500">
            <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{apartment.city}, {apartment.address}</span>
          </div>
        </div>

        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5" title="capacity">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Up to {apartment.maxGuests}</span>
          </div>
          <div className="flex items-center gap-1.5" title="rooms">
            <BedDouble className="w-4 h-4 text-slate-400" />
            <span>{apartment.rooms} rooms</span>
          </div>
          <div className="flex items-center gap-1.5" title="area">
            <Maximize className="w-4 h-4 text-slate-400" />
            <span>{apartment.size} м²</span>
          </div>
        </div>

        {/* Price section */}
        <div className="mt-auto flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400 mb-0.5 uppercase tracking-wider">
              Price per night
            </span>
            <div className="flex items-center gap-2">
              {/* Final price */}
              <span className="text-2xl font-extrabold text-blue-600">
                {finalPrice.toLocaleString()} {apartment.currency}
              </span>
              
              {/* Crossed price */}
              {apartment.discountPercent > 0 && (
                <span className="text-sm font-medium text-slate-400 line-through">
                  {apartment.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Dollar cross price */}
          <div className="text-sm font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            ~ ${apartment.priceUsd.toLocaleString()}
          </div>
        </div>

      </div>
    </Link>
  );
}