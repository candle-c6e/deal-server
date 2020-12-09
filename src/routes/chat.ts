import { Router } from 'express'
import { Chat } from '../module'

const router = Router()

router
  .get('/chatRoom/:userId', Chat.getChatRoom)
  .get('/chat/:roomId/:page', Chat.getChatByRoomId)

export default router