const target = __ENV.K6_ENV || 'dev';
const configFile = `config/${target}.json`;

export function getConfig() {
  try {
    const configText = open(configFile);
    return JSON.parse(configText);
  } catch (error) {
    throw new Error(`Unable to load config file ${configFile}: ${error.message}`);
  }
}
