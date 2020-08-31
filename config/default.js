require('dotenv').config();

module.exports = {
  App: {
    port: 3000,
    database: {
      mongoUrl: 'mongodb://localhost:27017/surf-forecast',
    },
    logger: {
      enabled: true,
      level: 'info',
    },
    auth: {
      key: 'node-js-secret-app-key',
      tokenExpiresIn: '1d',
    },
    resources: {
      StormGlass: {
        apiUrl: 'https://api.stormglass.io/v2',
        apiToken: 'do-not-hard-code',
      },
    },
  },
};
