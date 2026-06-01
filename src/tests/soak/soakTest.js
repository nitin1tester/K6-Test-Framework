import { sleep } from 'k6';
import { login } from '../../services/auth.service.js';
import { loginPayload } from '../../payloads/login.payload.js';
import { validateResponse } from '../../utils/validations.js';

export const options = {
  vus: 10,
  duration: '30m',
};

export default function () {
  const res = login(loginPayload.username, loginPayload.password);
  validateResponse(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
