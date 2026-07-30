import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Star } from 'lucide-react';
import Badge from './ui/Badge';
import { REVIEWER_ROLES } from '../constants/enums';

export default function ReviewCard({ review, onReport, onHandleReport, isAdmin = false }) {
  const booking = review.bookingId || {};
  const guestName = booking.guestId?.name || 'Unknown guest';
  const hostName = booking.propertyId?.hostId?.name || 'Unknown host';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isAdmin && (
            <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-x-2">
              <span>Guest: <span className="font-medium text-gray-700">{guestName}</span></span>
              <span>|</span>
              <span>Host: <span className="font-medium text-gray-700">{hostName}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <Badge label={REVIEWER_ROLES[review.reviewerRole] || review.reviewerRole} color="blue" />
            {!review.isVisible && <Badge label="Hidden" color="gray" />}
            {review.isFlagged && <Badge label="Flagged" color="red" />}
          </div>
          {review.comment && <p className="text-sm text-gray-700 mt-2">{review.comment}</p>}
          <p className="text-xs text-gray-400 mt-2">
            {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: enUS })}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {onReport && <button onClick={() => onReport(review)} className="text-xs text-red-600 hover:underline">Report</button>}
          {isAdmin && review.reports?.length > 0 && onHandleReport && (
            <button onClick={() => onHandleReport(review)} className="text-xs text-primary-600 hover:underline">
              Handle ({review.reports.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
