import path from "path";
import multer from "multer";

const uploadFile = multer({
  storage: multer.diskStorage({}),
  fileFilter: (_req, file, cb: any) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
})

export default uploadFile