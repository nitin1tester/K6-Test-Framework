import { sleep } from 'k6';
import { login } from '../../services/auth.service.js';
import {
  createBooking,
  getBookingById,
  getBookingsByDates,
  getBookingsByName,
  updateBooking,
  partialUpdateBooking,
  deleteBooking,
} from '../../services/booking.service.js';
import {
  createBookingPayload,
  fullUpdateBookingPayload,
  partialUpdateBookingPayload,
} from '../../payloads/booking.payload.js';
import { validateResponse } from '../../utils/validations.js';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  const authRes = login('admin', 'password123');
  validateResponse(authRes, {
    'auth status is 200': (r) => r.status === 200,
  });

  const token = authRes.json('token');
  const bookingRes = createBooking(createBookingPayload());
  validateResponse(bookingRes, {
    'create booking status is 200': (r) => r.status === 200,
  });

  const bookingId = bookingRes.json('bookingid');
  const bookingDetails = getBookingById(bookingId);
  validateResponse(bookingDetails, {
    'get booking by id is 200': (r) => r.status === 200,
  });

  const dateSearch = getBookingsByDates('2018-01-01', '2019-01-01');
  validateResponse(dateSearch, {
    'search by dates is 200': (r) => r.status === 200,
  });

  const nameSearch = getBookingsByName('Jim', 'Brown');
  validateResponse(nameSearch, {
    'search by name is 200': (r) => r.status === 200,
  });

  const updateRes = updateBooking(bookingId, fullUpdateBookingPayload(), token);
  validateResponse(updateRes, {
    'update booking status is 200': (r) => r.status === 200,
  });

  const partialRes = partialUpdateBooking(bookingId, partialUpdateBookingPayload(), token);
  validateResponse(partialRes, {
    'partial update status is 200': (r) => r.status === 200,
  });

  const deleteRes = deleteBooking(bookingId, token);
  validateResponse(deleteRes, {
    'delete booking status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
