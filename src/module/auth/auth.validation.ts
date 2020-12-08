import Joi from 'joi'

export const schemaEditProfile = Joi.object().keys({
  name: Joi.string().required().min(2),
  username: Joi.string().required().min(2),
  password: Joi.allow()
})

export const schemaRegister = Joi.object().keys({
  name: Joi.string().required().min(2),
  email: Joi.string().required().email(),
  username: Joi.string().required().min(2),
  password: Joi.string().required().min(4),
})

export const schemaLogin = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required().min(4)
})