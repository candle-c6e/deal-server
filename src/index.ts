import dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import express, { NextFunction, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import connectDatabase from './database'
import { RequestCustom } from './lib/types'
import auth from './routes/auth'
import product from './routes/product'
import category from './routes/category'

const app = express()

app.use(async (req: RequestCustom, _res: Response, next: NextFunction) => {
  const database = await connectDatabase()
  req.database = database
  next()
})

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://172.20.10.4:19000",
    "http://192.168.1.51:19000",
    "http://192.168.1.51:19001",
  ],
  credentials: true
}))
app.use(helmet())
app.use(compression())
app.use(cookieParser(process.env.SECRET_COOKIE))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/uploads', express.static(path.resolve() + '/uploads'))

app.use('/api/auth', auth)
app.use('/api/product', product)
app.use('/api/category', category)

app.listen(6001, () => {
  console.log(`SERVER IS RUNNING ON 6001`)
})