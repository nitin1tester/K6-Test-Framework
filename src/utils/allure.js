export function buildAllureJUnit(summary, suiteName = 'k6-load-test') {
  const metrics = summary.metrics || {};
  const checks = metrics.checks?.values || {};
  const failedChecks = checks.failed || 0;
  const durationSecs = summary.root_group?.duration ? summary.root_group.duration / 1000 : 0;
  const systemOut = Object.entries(metrics)
    .map(([name, metric]) => {
      const values = metric.values || {};
      const parts = [`type=${metric.type}`];
      if (values.count !== undefined) parts.push(`count=${values.count}`);
      if (values.avg !== undefined) parts.push(`avg=${values.avg}`);
      if (values.min !== undefined) parts.push(`min=${values.min}`);
      if (values.max !== undefined) parts.push(`max=${values.max}`);
      if (values['p(90)'] !== undefined) parts.push(`p(90)=${values['p(90)']}`);
      if (values['p(95)'] !== undefined) parts.push(`p(95)=${values['p(95)']}`);
      return `${name}: ${parts.join(', ')}`;
    })
    .join('\n');

  const properties = Object.entries(metrics)
    .map(([name, metric]) => {
      const values = metric.values || {};
      const valueParts = [];
      if (values.count !== undefined) valueParts.push(`count=${values.count}`);
      if (values.avg !== undefined) valueParts.push(`avg=${values.avg}`);
      if (values.min !== undefined) valueParts.push(`min=${values.min}`);
      if (values.max !== undefined) valueParts.push(`max=${values.max}`);
      if (values['p(90)'] !== undefined) valueParts.push(`p(90)=${values['p(90)']}`);
      if (values['p(95)'] !== undefined) valueParts.push(`p(95)=${values['p(95)']}`);
      return `    <property name="${name}" value="${valueParts.join(', ')}"/>\n`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<testsuite name="${suiteName}" tests="1" failures="${failedChecks > 0 ? 1 : 0}" time="${durationSecs}">\n` +
    `  <properties>\n${properties}  </properties>\n` +
    `  <testcase name="${suiteName}" classname="${suiteName}" time="${durationSecs}">\n` +
    (failedChecks > 0 ? `    <failure message="${failedChecks} failed checks"/>\n` : '') +
    `    <system-out><![CDATA[${systemOut}]]></system-out>\n` +
    `  </testcase>\n` +
    `</testsuite>\n`;
}
