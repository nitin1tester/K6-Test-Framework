export function setup() {
  console.log('Starting performance test setup');
  return { startedAt: new Date().toISOString() };
}
