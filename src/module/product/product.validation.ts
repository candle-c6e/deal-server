import Joi from 'joi'

export const schemaCreateProduct = Joi.object().keys({
  title: Joi.string().required().min(5),
  categoryId: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(1),
  images: Joi.allow()
})

export const schemaEditProduct = Joi.object().keys({
  productId: Joi.allow(),
  title: Joi.string().required().min(5),
  categoryId: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(1),
  status: Joi.allow()
})

export const schemaDeleteProduct = Joi.object().keys({
  productId: Joi.string().required()
})

export const schemaDeleteImage = Joi.object().keys({
  productId: Joi.string().required(),
  url: Joi.string().required()
})