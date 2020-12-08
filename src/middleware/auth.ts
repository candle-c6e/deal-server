import { NextFunction, Response } from 'express'
import { RequestCustom } from '../lib/types'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { generateAccessToken } from '../utils/generateToken'

const authentication = async (req: RequestCustom, res: Response, next: NextFunction) => {
  let token = null

  const cookies = req.signedCookies
  const authorization = req.headers.authorization || null

  if (!cookies && !authentication) {
    req.userId = ''
    return next()
  }

  if (!authorization) {
    token = cookies.rid
  } else {
    token = authorization.split(' ')[1]
  }

  let decoded: any = null
  let user: any = null

  try {
    decoded = jwt.verify(token, process.env.SECRET_REFRESH_TOKEN!)
    if (decoded) {
      user = await req.database?.users.findOne({ _id: new ObjectId(decoded.id) })
      const token = await generateAccessToken(user)
      res.cookie('qid', token, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
    }
  } catch (error) {
    return next()
  }

  req.userId = String(user._id)

  return next()
}

export default authentication