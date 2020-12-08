import { Request } from "express";
import { ObjectId, Collection } from "mongodb";

interface Image {
  url: string
  thumbnail: string
}

interface Location {
  latitude: string | null
  longitude: string | null
}

interface Category {
  _id: ObjectId
  title: string
  image: string
  createdAt: Date
}

type ProductStatus = "SELL" | "SOLD" | "CLOSE"

interface Product {
  _id: ObjectId
  userId: ObjectId
  categoryId: ObjectId
  title: string
  slug: string
  description: string
  price: number
  images: Image[] | []
  location: Location
  status: ProductStatus
  createdAt: Date
  updatedAt: Date | null
}

export interface User {
  _id: ObjectId
  name: string
  avartar: string | null
  email: string | null
  username: string
  password: string
  deviceToken: string | null
  products: ObjectId[]
  createdAt: Date
  updatedAt: Date | null
}

export interface Token {
  _id: ObjectId
  token: string
}

export interface RequestCustom extends Request {
  database?: Database
  userId?: string
}

export interface AggreateFacet {
  [key: string]: any
}

export interface Database {
  users: Collection<User>
  products: Collection<Product>
  categories: Collection<Category>
  token: Collection<Token>
}