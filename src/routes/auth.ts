import { Router } from 'express'
import { schemaLogin, schemaRegister, schemaEditProfile } from '../module/auth/auth.validation'
import { validateWithSchema } from '../middleware/validation'
import authentication from '../middleware/auth'
import upload from '../middleware/upload'
import { Auth } from '../module'

const router = Router()

router
  .get('/me', authentication, Auth.me)
  .post('/device-token', authentication, Auth.getDeviceToken)
  .post('/register', validateWithSchema(schemaRegister), Auth.register)
  .post('/edit-avatar', upload('avatar').any(), authentication, Auth.editAvatar)
  .post('/login', validateWithSchema(schemaLogin), Auth.login)
  .post('/logout', Auth.logout)
  .post('/store-token', Auth.storeToken)
  .patch('/update-device-token', Auth.updateDeviceToken)
  .patch('/edit-profile', authentication, validateWithSchema(schemaEditProfile), Auth.editProfile)

export default router