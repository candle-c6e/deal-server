import crypto from 'crypto'
import path from "path";
import { NextFunction, Request, Response } from 'express'
import { UPLOAD_PATH } from "../constants";
import sharp from 'sharp'

export default (dest: string) => async (req: Request, _res: Response, next: NextFunction) => {
  const uploadFiles = []
  const files = req.files as any

  if (files.length) {
    for (let file of files) {
      const ext = path.extname(file.originalname);
      const now = Date.now()
      const randomByte = crypto.randomBytes(10).toString('hex')
      const newFilename = randomByte + now + ext
      if (ext !== '.png') {
        await sharp(file.path).jpeg({ quality: 50 }).blur(10).toFile(UPLOAD_PATH + dest + '/' + 'thumbnail_' + newFilename)
        await sharp(file.path).jpeg({ quality: 80 }).toFile(UPLOAD_PATH + dest + '/' + newFilename)
      }

      uploadFiles.push({
        url: newFilename,
        thumbnail: 'thumbnail_' + newFilename
      })
    }
  }

  (req.files as any) = uploadFiles

  return next()
}