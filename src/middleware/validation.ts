import { NextFunction, Request, Response } from "express";
import { ValidationResult } from 'joi'

export const validateWithSchema = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  const { error }: ValidationResult = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(422).json({
      success: false,
      data: error.details.map(item => item.message)
    })
  }

  return next();
}
