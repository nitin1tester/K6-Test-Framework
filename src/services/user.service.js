import http from 'k6/http';
import { getConfig } from '../utils/config.js';

export function fetchUser(userId, authToken) {
  return http.get(`${getConfig().baseUrl}/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}
