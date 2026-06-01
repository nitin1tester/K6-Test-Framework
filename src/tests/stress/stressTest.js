import { sleep } from 'k6';
import { login } from '../../services/auth.service.js';
import { loginPayload } from '../../payloads/login.payload.js';
import { validateResponse } from '../../utils/validations.js';
import { spikeScenario } from '../../scenarios/spikeScenario.js';

export const options = {
  stages: spikeScenario.stages,
};

export default function () {
  const res = login(loginPayload.username, loginPayload.password);
  validateResponse(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
