import { Link } from 'react-router-dom';
import { MapPin, Users, Star } from 'lucide-react';
import Badge from './ui/Badge';
import { PROPERTY_STATUS } from '../constants/enums';

export default function PropertyCard({ property, showStatus = false }) {
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop';
  const status = PROPERTY_STATUS[property.status];

  return (
    <Link to={`/properties/${property._id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showStatus && status && (
            <div className="absolute top-3 left-3">
              <Badge label={status.label} color={status.color} />
            </div>
          )}
          {!property.isVerified && showStatus && (
            <div className="absolute top-3 right-3">
              <Badge label="Pending verification" color="yellow" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{property.location?.address || 'Address not available'}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{property.maxGuests}</span>
              {property.averageRating && (
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />{property.averageRating.toFixed(1)}</span>
              )}
            </div>
            <p className="font-bold text-primary-600">
              ${property.pricePerNight}
              <span className="text-xs font-normal text-gray-500">/night</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
