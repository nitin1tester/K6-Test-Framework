import { sleep } from 'k6';
import { login } from '../../services/auth.service.js';
import { createOrder } from '../../services/order.service.js';
import { loginPayload } from '../../payloads/login.payload.js';
import { createOrderPayload } from '../../payloads/order.payload.js';
import { validateResponse } from '../../utils/validations.js';
import { constantScenario } from '../../scenarios/constantScenario.js';
import { buildAllureJUnit } from '../../utils/allure.js';

export const options = {
  vus: constantScenario.vus,
  duration: constantScenario.duration,
};

export default function () {
  const loginRes = login(loginPayload.username, loginPayload.password);
  validateResponse(loginRes, { 'login status is 200': (r) => r.status === 200 });
  const authToken = loginRes.json('token');
  const orderRes = createOrder(createOrderPayload(101, 2), authToken);
  validateResponse(orderRes, { 'order created': (r) => r.status === 201 });
  sleep(1);
}

export function handleSummary(data) {
  return {
    'allure-results/k6-load-test.json': JSON.stringify(data, null, 2),
    'allure-results/k6-load-test.xml': buildAllureJUnit(data, 'k6-load-test'),
  };
}
