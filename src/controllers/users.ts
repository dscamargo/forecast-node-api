import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import User from '@src/models/user';
import Mongoose from 'mongoose';
import { BaseController } from '.';
import AuthService from '@src/services/auth';
import ApiError from '@src/util/errors/api-error';

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
      return this.sendErrorResponse(res,{
        code: 401,
        message: 'User not found',
      })
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Invalid credentials',
      })
    }

    const token = AuthService.generateToken(user.toJSON());

    return res.status(200).send({ token });
  }
}
