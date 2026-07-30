import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../constants/enums';

export default function BookingCard({ booking, actions = [] }) {
  const status = BOOKING_STATUS[booking.status];
  const payment = PAYMENT_STATUS[booking.payment?.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-gray-900">
              {booking.propertyId?.title || 'Property'}
            </h3>
            {status && <Badge label={status.label} color={status.color} />}
            {payment && <Badge label={payment.label} color={payment.color} />}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Check-in</p>
              <p className="font-medium">{format(new Date(booking.startDate), 'dd MMM yyyy', { locale: enUS })}</p>
            </div>
            <div>
              <p className="text-gray-500">Check-out</p>
              <p className="font-medium">{format(new Date(booking.endDate), 'dd MMM yyyy', { locale: enUS })}</p>
            </div>
            <div>
              <p className="text-gray-500">Nights</p>
              <p className="font-medium">{booking.numberOfNights}</p>
            </div>
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-medium text-primary-600">${booking.pricingSnapshot?.totalPrice?.toFixed(2)}</p>
            </div>
          </div>

          {booking.pricingSnapshot?.discountPercentage > 0 && (
            <p className="text-xs text-green-600 mt-2">
              Loyalty discount {booking.pricingSnapshot.discountPercentage}% (-${booking.pricingSnapshot.discountAmount?.toFixed(2)})
            </p>
          )}

          {booking.payment?.method && (
            <p className="text-xs text-gray-500 mt-1">
              Payment method: {PAYMENT_METHODS[booking.payment.method]}
            </p>
          )}

          {booking.cancellationReason && (
            <p className="text-xs text-orange-600 mt-1">Cancellation reason: {booking.cancellationReason}</p>
          )}
          {booking.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">Rejection reason: {booking.rejectionReason}</p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <Button key={i} size="sm" variant={action.variant || 'primary'} onClick={action.onClick} loading={action.loading}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
