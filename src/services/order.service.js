import http from 'k6/http';
import { getConfig } from '../utils/config.js';

export function createOrder(orderPayload, authToken) {
  return http.post(`${getConfig().baseUrl}/api/orders`, JSON.stringify(orderPayload), {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}
