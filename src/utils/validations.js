import { check, fail } from 'k6';

export function validateResponse(response, checks) {
  const result = check(response, checks);
  if (!result) {
    fail(`Response validation failed: status=${response.status}`);
  }
}
