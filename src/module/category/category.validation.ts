import Joi from 'joi'

export const schemaCreate = Joi.object().keys({
  title: Joi.string().required().min(2),
})