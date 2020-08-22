import { Response } from 'express';
import mongoose from 'mongoose';
import { CUSTOM_VALIDATION } from '@src/models/user';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/util/errors/api-error';

export abstract class BaseController {
  protected sendCreatedUpdatedErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientError = this.handleClientErrors(error);
      res
        .status(clientError.code)
        .json(ApiError.format({ code: clientError.code, message: clientError.error }));
    } else {
      logger.error(error)
      res.status(500).send(ApiError.format({ code: 500, message: 'Something went wrong !' }));
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );

    if (duplicatedKindErrors.length) {
      return {
        code: 409,
        error: error.message,
      };
    } else {
      return { code: 422, error: error.message };
    }
  }

  protected sendErrorResponse(res: Response,error: APIError):Response {
    return res.status(error.code).send(ApiError.format(error))
  }
}
