import fs from 'fs'
import { Response } from "express";
import { ObjectId } from "mongodb";
import { AggreateFacet, RequestCustom } from "../../lib/types"
import Slug from 'slug'
import {
  ProductByCategoryModel,
  ProductByIdModel,
  ProductModel,
  ProductsModel,
  ProductByUserIdModel,
  SearchProductModel,
  FeatureProductsModel
} from "./product.model";
import { LIMIT, UPLOAD_PATH } from '../../constants';

export const products = async (req: RequestCustom, res: Response) => {
  const { page = 1 } = req.params

  const skip = (+page - 1) * LIMIT
  const limit = LIMIT

  const result: AggreateFacet[] | undefined = await req.database?.products.aggregate(ProductsModel(skip, limit)).toArray()

  if (!result || !result[0].products.length) {
    return res.status(403).json({
      success: false,
      data: {
        totalPages: 0,
        products: []
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      totalPages: result[0].totalPages[0].totalPages,
      products: result[0].products
    }
  })
}

export const searchProduct = async (req: RequestCustom, res: Response) => {
  const { text, page = 1 } = req.params

  const skip = (+page - 1) * LIMIT
  const limit = LIMIT
  const result: AggreateFacet[] | undefined = await req.database?.products.aggregate(SearchProductModel(text, skip, limit)).toArray()

  if (!result || !result[0].products.length) {
    return res.status(403).json({
      success: false,
      data: {
        totalPages: 0,
        products: []
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      totalPages: result[0].totalPages[0].totalPages,
      products: result[0].products
    }
  })
}

export const product = async (req: RequestCustom, res: Response) => {
  const { slug } = req.params
  const userId = req.userId

  if (!slug) {
    return res.status(500).json({
      success: false,
      data: "slug is required."
    })
  }

  const product = await req.database?.products.aggregate(ProductModel(slug)).toArray()

  if (!product?.length) {
    return res.status(403).json({
      success: false,
      data: "Product is not exists."
    })
  }

  if (String(product[0].userId) !== String(userId)) {
    return res.status(200).json({
      success: true,
      data: {
        action: false,
        product
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      action: true,
      product
    }
  })
}

export const productById = async (req: RequestCustom, res: Response) => {
  const { id } = req.params
  const userId = req.userId

  if (!id) {
    return res.status(500).json({
      success: false,
      data: "id is required."
    })
  }

  const product = await req.database?.products.aggregate(ProductByIdModel(id)).toArray()

  if (!product?.length) {
    return res.status(403).json({
      success: false,
      data: "Product is not exists."
    })
  }

  if (String(product[0].userId) !== String(userId)) {
    return res.status(200).json({
      success: true,
      data: {
        action: false,
        product
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      action: true,
      product
    }
  })
}

export const productByCategory = async (req: RequestCustom, res: Response) => {
  const { categoryTitle, page = 1 } = req.params

  const skip = (+page - 1) * LIMIT
  const limit = LIMIT

  const Category = req.database?.categories
  const Product = req.database?.products

  const category = await Category?.findOne({ title: categoryTitle }, { projection: { _id: 1 } })

  if (!category) {
    return res.status(203).json({
      success: false,
      data: 'Category is not exists.'
    })
  }

  const categoryId = String(category?._id)

  const result: AggreateFacet[] | undefined = await Product?.aggregate(ProductByCategoryModel(categoryId, skip, limit)).toArray()

  if (!result || !result[0].products.length) {
    return res.status(403).json({
      success: false,
      data: {
        totalPages: 0,
        products: []
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      totalPages: result[0].totalPages[0].totalPages,
      products: result[0].products
    }
  })
}

export const productByUserId = async (req: RequestCustom, res: Response) => {
  const { page = 1 } = req.params

  const skip = (+page - 1) * (LIMIT + 4)
  const limit = LIMIT + 4
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({
      success: false,
      data: 'You are not authorized.'
    })
  }

  const Product = req.database?.products

  const result: AggreateFacet[] | undefined = await Product?.aggregate(ProductByUserIdModel(userId, skip, limit)).toArray()

  if (!result || !result[0].products.length) {
    return res.status(403).json({
      success: false,
      data: {
        totalPages: 0,
        products: []
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: {
      totalPages: result[0].totalPages[0].totalPages,
      products: result[0].products
    }
  })
}

export const featureProducts = async (req: RequestCustom, res: Response) => {
  const products = await req.database?.products.aggregate(FeatureProductsModel()).toArray()

  return res.status(200).json({
    success: true,
    data: products
  })
}

export const createProduct = async (req: RequestCustom, res: Response) => {
  const userId = req.userId
  const { title, description, price, categoryId } = req.body
  const files = req.files as any

  const Product = req.database?.products
  const User = req.database?.users

  const slug: string = Slug(title)
  const isSlugExists = await Product?.findOne({ slug })

  if (isSlugExists) {
    return res.status(403).json({
      success: false,
      data: 'Title or slug is exists.'
    })
  }

  const product = await Product?.insertOne({
    title,
    categoryId: new ObjectId(categoryId),
    slug,
    userId: new ObjectId(userId),
    description,
    price: parseFloat(price),
    images: files,
    location: {
      latitude: null,
      longitude: null
    },
    status: "SELL",
    createdAt: new Date(),
    updatedAt: null
  })

  if (!product) {
    return res.status(500).json({
      success: false,
      data: "Something went wrong."
    })
  }

  await User?.updateOne({ _id: new ObjectId(userId) }, { $push: { products: new ObjectId(product.insertedId) } })

  return res.status(201).json({
    success: true,
    data: product.ops[0].slug
  })
}

export const editProduct = async (req: RequestCustom, res: Response) => {
  const userId = req.userId
  const { productId, title, description, price, status, categoryId } = req.body
  const files = req.files as any

  const Product = req.database?.products

  let product

  product = await Product?.findOne({ _id: new ObjectId(productId) })

  if (!product) {
    return res.status(403).json({
      success: false,
      data: 'Product is not exists.'
    })
  }

  const slug = Slug(title)
  const isSlugExists = await Product?.find({ slug, _id: { $ne: new ObjectId(productId) } }).toArray()

  if (isSlugExists?.length) {
    return res.status(403).json({
      success: false,
      data: 'Title or slug is exists.'
    })
  }

  if (String(product.userId) !== String(userId)) {
    return res.status(401).json({
      success: false,
      data: "You are not permitted."
    })
  }

  let query = {
    $set: {
      title,
      categoryId: new ObjectId(categoryId),
      slug: Slug(title),
      userId: new ObjectId(userId),
      description,
      price: parseFloat(price),
      location: {
        latitude: null,
        longitude: null
      },
      status,
      updatedAt: new Date()
    },
  }

  let productImages = files.length ? { $set: { images: [...product.images, ...files] } } : {}

  product = await Product?.findOneAndUpdate(
    { _id: new ObjectId(productId) },
    {
      ...query,
      ...productImages
    },
    { returnOriginal: false }
  )

  return res.status(200).json({
    success: true,
    data: product?.value?.slug
  })
}

export const deleteProduct = async (req: RequestCustom, res: Response) => {
  const userId = req.userId
  const { productId } = req.body

  const Product = req.database?.products
  const User = req.database?.users

  const product = await Product?.findOne({ _id: new ObjectId(productId) })

  if (!product) {
    return res.status(403).json({
      success: false,
      data: "Product is not exists."
    })
  }

  if (String(product.userId) !== String(userId)) {
    return res.status(401).json({
      success: false,
      data: "You are not permitted."
    })
  }

  for (let image of product.images) {
    await fs.promises.unlink(`${UPLOAD_PATH}/product/${image.url}`)
    await fs.promises.unlink(`${UPLOAD_PATH}/product/${image.thumbnail}`)
  }

  await Product?.deleteOne({ _id: new ObjectId(productId) })
  await User?.updateOne({ _id: new ObjectId(userId) }, { $pull: { products: new ObjectId(productId) } })

  return res.status(200).json({
    success: true,
    data: []
  })
}

export const deleteProductImage = async (req: RequestCustom, res: Response) => {
  const userId = req.userId
  const { productId, url } = req.body

  const Product = req.database?.products

  let product
  product = await Product?.findOne({ _id: new ObjectId(productId) })

  if (!product) {
    return res.status(403).json({
      success: false,
      data: "Product is not exists."
    })
  }

  if (String(product.userId) !== String(userId)) {
    return res.status(401).json({
      success: false,
      data: "You are not permitted."
    })
  }

  product = await Product?.findOneAndUpdate({ _id: new ObjectId(productId) }, { $pull: { images: { url } } })

  if (product?.ok) {
    await fs.promises.unlink(`${UPLOAD_PATH}/product/${url}`)
    await fs.promises.unlink(`${UPLOAD_PATH}/product/thumbnail_${url}`)
  }

  return res.status(200).json({
    success: true,
    data: []
  })
}