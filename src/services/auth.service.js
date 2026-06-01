import http from 'k6/http';
import { getConfig } from '../utils/config.js';

export function login(username, password) {
  const url = `${getConfig().baseUrl}/auth`;
  const payload = JSON.stringify({ username, password });
  return http.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
}
