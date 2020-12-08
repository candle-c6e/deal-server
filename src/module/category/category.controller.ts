import { Response } from "express";
import { RequestCustom } from "../../lib/types";

export const categories = async (req: RequestCustom, res: Response) => {

  const categories = await req.database?.categories.aggregate([
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        title: 1,
        image: {
          $concat: [`${process.env.BASE_URL}/uploads/category/`, "$image"]
        },
        createdAt: 1
      }
    },
    {
      $sort: {
        createdAt: 1
      }
    }
  ]).toArray()

  return res.status(200).json({
    success: true,
    data: categories
  })
}

export const createCategory = async (req: RequestCustom, res: Response) => {
  const { title } = req.body
  const file = req.files as any

  const Category = req.database?.categories
  const category = await Category?.insertOne({
    title,
    image: file[0].filename,
    createdAt: new Date()
  })

  return res.status(201).json({
    success: true,
    data: category?.insertedId
  })
}