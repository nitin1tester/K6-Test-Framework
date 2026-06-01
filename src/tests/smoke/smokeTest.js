import { sleep } from 'k6';
import { login } from '../../services/auth.service.js';
import { validateResponse } from '../../utils/validations.js';
import { loginPayload } from '../../payloads/login.payload.js';
import { setup } from '../../hooks/setup.js';
import { teardown } from '../../hooks/teardown.js';

export const options = {
  vus: 5,
  duration: '30s',
};

export function setupWrapper() {
  return setup();
}

export default function () {
  const response = login(loginPayload.username, loginPayload.password);
  validateResponse(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}

export function teardownWrapper(data) {
  teardown(data);
}
