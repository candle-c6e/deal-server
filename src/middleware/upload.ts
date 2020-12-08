import path from "path";
import crypto from 'crypto'
import multer from "multer";
import { UPLOAD_PATH } from "../constants";

const storage = (dest: string) => multer.diskStorage({
  destination: (_req, _file, cb: any) => {
    const uploadPath = UPLOAD_PATH + dest
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const now = Date.now()
    cb(null, crypto.randomBytes(10).toString('hex') + now + ext);
  }
})

const uploadFile = (dest: string) => multer({
  storage: storage(dest),
  fileFilter: (_req, file, cb: any) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".svg") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
})

export default uploadFile