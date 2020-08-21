import config, { IConfig } from 'config';
import mongoose from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

console.log(dbConfig.get('mongoUrl'))

export const connect = async (): Promise<typeof mongoose> =>
  await mongoose.connect(dbConfig.get('mongoUrl'), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

export const close = (): Promise<void> => mongoose.connection.close();
