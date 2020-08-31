import pino from 'pino';
import config, { IConfig } from 'config';

const loggerConfig: IConfig = config.get('App.logger');

export default pino({
  enabled: loggerConfig.get('enabled'),
  level: loggerConfig.get('level'),
});
