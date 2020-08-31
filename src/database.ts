import config, { IConfig } from 'config';
import mongoose from 'mongoose';
import logger from './logger';

const dbConfig: IConfig = config.get('App.database');

export const connect = async (): Promise<typeof mongoose> => {
  const connection = await mongoose.connect(dbConfig.get('mongoUrl'), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  if (process.env.NODE_ENV !== 'test') {
    logger.info('Database connected');
  }
  return connection;
};

export const close = (): Promise<void> => mongoose.connection.close();
