import './util/module-alias';
import cors from 'cors';
import expressPino from 'express-pino-logger';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import { Application } from 'express';
import * as database from '@src/database';
import { BeachesController } from './controllers/beaches';
import { UserController } from './controllers/users';
import logger from './logger';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupController();
    await this.setupDatabase();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
    this.app.use(
      expressPino({
        logger,
      })
    );
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const userController = new UserController();

    this.addControllers([
      forecastController,
      userController,
      beachesController,
    ]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
