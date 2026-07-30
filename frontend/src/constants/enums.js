export const ROLES = { GUEST: 'guest', HOST: 'host', ADMIN: 'admin' };

export const PROPERTY_STATUS = {
  available: { label: 'Available', color: 'green' },
  unavailable: { label: 'Unavailable', color: 'gray' },
  maintenance: { label: 'Under maintenance', color: 'yellow' },
  suspended: { label: 'Suspended', color: 'red' },
};

export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  rejected: { label: 'Rejected', color: 'red' },
  expired: { label: 'Expired', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'orange' },
  completed: { label: 'Completed', color: 'green' },
};

export const PAYMENT_STATUS = {
  unpaid: { label: 'Unpaid', color: 'gray' },
  held: { label: 'Held', color: 'blue' },
  released: { label: 'Released', color: 'green' },
  refunded: { label: 'Refunded', color: 'purple' },
  partially_refunded: { label: 'Partially refunded', color: 'orange' },
};

export const PAYMENT_METHODS = {
  creditCard: 'Credit card',
  bankTransfer: 'Bank transfer',
  paypal: 'PayPal',
};

export const DISPUTE_STATUS = {
  open: { label: 'Open', color: 'yellow' },
  'in-progress': { label: 'In progress', color: 'blue' },
  resolved: { label: 'Resolved', color: 'green' },
};

export const DISPUTE_RESOLUTION = {
  fullRefund: 'Full refund',
  partialRefund: 'Partial refund',
  releasePayment: 'Release payment',
  noRefund: 'No refund',
};

export const REVIEWER_ROLES = {
  guestToHost: 'Guest → Host',
  hostToGuest: 'Host → Guest',
};

export const LOYALTY_LEVELS = [
  { level: 'Platinum', minCompletedBookings: 20, discountPercentage: 15 },
  { level: 'Gold', minCompletedBookings: 10, discountPercentage: 10 },
  { level: 'Silver', minCompletedBookings: 5, discountPercentage: 5 },
  { level: 'Regular', minCompletedBookings: 0, discountPercentage: 0 },
];

export const AMENITIES = [
  'WiFi', 'Swimming pool', 'Parking', 'Air conditioning', 'Kitchen', 'Washing machine',
  'TV', 'Balcony', 'Garden', 'Elevator', 'Jacuzzi', 'Gym',
];
