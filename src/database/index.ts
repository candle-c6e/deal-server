import mongodb from 'mongodb'
import { Database } from '../lib/types'

const url = process.env.DATABASE_URL || "mongodb://localhost:27017/deal"

const connectDatabase = async (): Promise<Database> => {
  try {
    const connect = await mongodb.connect(url, { useNewUrlParser: true })
    const db = connect.db('deal')

    return {
      users: db.collection('users'),
      products: db.collection('products'),
      categories: db.collection('categories'),
      token: db.collection('token')
    }
  } catch (error) {
    throw new Error(error)
  }
}

export default connectDatabase