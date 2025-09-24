import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createError(errorMessage, 400);
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      }),
    userType: Joi.string().valid('CUSTOMER', 'VENDOR').required(),
    companyName: Joi.string().when('userType', {
      is: 'VENDOR',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    contactPerson: Joi.string().optional(),
    phone: Joi.string().pattern(/^[+]?[1-9][\d\s\-()]{7,15}$/).optional(),
    address: Joi.string().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  product: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    categoryId: Joi.string().uuid().required(),
    price: Joi.number().positive().required(),
    unit: Joi.string().required(),
    stockQuantity: Joi.number().integer().min(0).required(),
    minOrderQty: Joi.number().integer().positive().default(1),
    images: Joi.array().items(Joi.string().uri()).optional(),
    isFeatured: Joi.boolean().default(false)
  }),

  order: Joi.object({
    vendorId: Joi.string().uuid().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().positive().required()
      })
    ).min(1).required(),
    deliveryAddress: Joi.string().required(),
    notes: Joi.string().optional()
  }),

  category: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional()
  })
};