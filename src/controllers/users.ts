import {
  Controller,
  Post,
  Get,
  ClassMiddleware,
  Middleware,
} from '@overnightjs/core';
import httpStatusCodes from 'http-status-codes';
import { Request, Response } from 'express';
import User from '@src/models/user';
import { BaseController } from '.';
import AuthService from '@src/services/auth';
import AuthMiddleware from '@src/middlewares/auth';

@Controller('users')
export class UserController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new User(req.body);
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreatedUpdatedErrorResponse(res, error);
    }
  }
  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found',
      });
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Invalid credentials',
      });
    }

    const token = AuthService.generateToken(user.toJSON());

    return res.status(200).send({ token });
  }
  @Get('me')
  @Middleware(AuthMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const email = req.decoded ? req.decoded.email : undefined;

    const user = await User.findOne({ email });

    if (!user)
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found',
        codeAsString: httpStatusCodes.getStatusText(404),
      });

    return res.json({ user });
  }
}
