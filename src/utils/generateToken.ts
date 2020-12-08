import jwt from 'jsonwebtoken'
import { User } from "../lib/types"

export const generateAccessToken = async (user: User) => {
  const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.SECRET_ACCESS_TOKEN!, { expiresIn: '15m' })
  return token
}

export const generateRefreshToken = async (user: User) => {
  const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.SECRET_REFRESH_TOKEN!, { expiresIn: '7d' })
  return token
}
