import fs from 'fs'
import { Request, Response } from "express";
import { RequestCustom } from "../../lib/types";
import bcrypt from 'bcrypt'
import { ObjectId } from "mongodb";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";
import { UPLOAD_PATH } from '../../constants';

export const me = async (req: RequestCustom, res: Response) => {

  const user = await req.database?.users.findOne({ _id: new ObjectId(req.userId) })

  if (!user) {
    return res.status(403).json({
      success: false,
      data: "user is not exists."
    })
  }

  const refreshToken = await generateRefreshToken(user)

  return res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avartar,
      token: refreshToken,
      deviceToken: user.deviceToken
    }
  })
}

export const editAvatar = async (req: RequestCustom, res: Response) => {
  const userId = req.userId
  const file = req.files as any

  const User = req.database?.users

  let user

  user = await User?.findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return res.status(403).json({
      success: false,
      data: "User is not exists"
    })
  }

  if (String(user._id) !== String(userId)) {
    return res.status(401).json({
      success: false,
      data: "You are not permitted."
    })
  }

  if (user.avartar) {
    await fs.promises.unlink(`${UPLOAD_PATH}/avatar/${user.avartar}`)
  }

  user = await User?.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { avartar: file[0].filename } }, { returnOriginal: false })

  if (!user) {
    return res.status(500).json({
      success: false,
      data: "Something went wrong."
    })
  }

  const token = await generateAccessToken(user?.value!)
  const refreshToken = await generateRefreshToken(user?.value!)

  res.cookie('qid', token, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
  res.cookie('rid', refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })

  return res.status(200).json({
    success: true,
    data: []
  })
}

export const editProfile = async (req: RequestCustom, res: Response) => {
  const userId = req.userId
  const { name, username, password } = req.body

  const User = req.database?.users

  let query = password ? { name, username, password: await bcrypt.hash(password, 10) } : { name, username }

  const user = await User?.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { ...query } }, { returnOriginal: false })

  if (!user) {
    return res.status(500).json({
      success: false,
      data: 'Something went wrong.'
    })
  }

  const token = await generateAccessToken(user.value!)
  const refreshToken = await generateRefreshToken(user.value!)

  res.cookie('qid', token, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
  res.cookie('rid', refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })

  return res.status(200).json({
    success: true,
    data: []
  })
}

export const register = async (req: RequestCustom, res: Response) => {
  const { name, email, username, password } = req.body

  const hashPassword = await bcrypt.hash(password, 10)

  const Users = req.database?.users!

  const isUserExists = await Users.findOne({ $or: [{ email }, { username }] })


  if (isUserExists) {
    return res.status(409).json({
      success: false,
      data: []
    })
  }

  const user = await Users.insertOne({
    name,
    avartar: null,
    email,
    username,
    password: hashPassword,
    products: [],
    deviceToken: null,
    createdAt: new Date(),
    updatedAt: null
  })


  const token = await generateAccessToken(user.ops[0])
  const refreshToken = await generateRefreshToken(user.ops[0])

  res.cookie('qid', token, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
  res.cookie('rid', refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })

  return res.status(201).json({
    success: true,
    data: {
      id: user.ops[0]._id,
      name: user.ops[0].name,
      email: user.ops[0].email,
      username: user.ops[0].username,
      avatar: user.ops[0].avartar,
      token: refreshToken
    }
  })
}

export const login = async (req: RequestCustom, res: Response) => {
  const { username, password } = req.body

  const Users = req.database?.users!

  const user = await Users.findOne({ username })

  if (!user) {
    return res.status(403).json({
      success: false,
      data: 'User is not exists.'
    })
  }

  const isMatched = await bcrypt.compare(password, user.password)

  if (!isMatched) {
    return res.status(401).json({
      success: false,
      data: 'Username or password is invalid.'
    })
  }

  const token = await generateAccessToken(user)
  const refreshToken = await generateRefreshToken(user)

  res.cookie('qid', token, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 15, signed: true })
  res.cookie('rid', refreshToken, { sameSite: 'lax', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, signed: true })

  return res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avartar,
      token: refreshToken
    }
  })
}

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('qid')
  res.clearCookie('rid')

  return res.status(200).json({
    success: true,
    data: []
  })
}

export const storeToken = async (req: RequestCustom, res: Response) => {
  const { token } = req.body

  const Token = req.database?.token

  await Token?.updateOne({ token }, { $set: { token } }, { upsert: true })

  return res.status(200).json({
    success: true,
    data: []
  })
}

export const updateDeviceToken = async (req: RequestCustom, res: Response) => {
  const { userId, deviceToken } = req.body

  const User = req.database?.users

  await User?.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { deviceToken } })

  return res.status(200).json({
    success: true,
    data: []
  })
}

export const getDeviceToken = async (req: RequestCustom, res: Response) => {
  const { userId } = req.body

  const User = req.database?.users

  const user = await User?.findOne({ _id: new ObjectId(userId) }, { projection: { deviceToken: 1 } })

  if (!user) {
    return res.status(403).json({
      success: false,
      data: []
    })
  }

  return res.status(200).json({
    success: true,
    data: user?.deviceToken
  })
}