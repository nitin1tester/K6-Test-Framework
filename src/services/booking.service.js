import http from 'k6/http';
import { getConfig } from '../utils/config.js';

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

function buildQuery(params = {}) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
}

export function createBooking(payload) {
  return http.post(`${getConfig().baseUrl}/booking`, JSON.stringify(payload), {
    headers: jsonHeaders,
  });
}

export function updateBooking(id, payload, token) {
  return http.put(`${getConfig().baseUrl}/booking/${id}`, JSON.stringify(payload), {
    headers: {
      ...jsonHeaders,
      Cookie: `token=${token}`,
    },
  });
}

export function partialUpdateBooking(id, payload, token) {
  return http.patch(`${getConfig().baseUrl}/booking/${id}`, JSON.stringify(payload), {
    headers: {
      ...jsonHeaders,
      Cookie: `token=${token}`,
    },
  });
}

export function deleteBooking(id, token) {
  return http.del(`${getConfig().baseUrl}/booking/${id}`, null, {
    headers: {
      ...jsonHeaders,
      Cookie: `token=${token}`,
    },
  });
}

export function getBookingIds(query = {}) {
  return http.get(`${getConfig().baseUrl}/booking${buildQuery(query)}`, {
    headers: jsonHeaders,
  });
}

export function getBookingById(id) {
  return http.get(`${getConfig().baseUrl}/booking/${id}`, {
    headers: jsonHeaders,
  });
}

export function getBookingsByDates(checkin, checkout) {
  return getBookingIds({ checkin, checkout });
}

export function getBookingsByName(firstname, lastname) {
  return getBookingIds({ firstname, lastname });
}
