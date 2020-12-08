import { Router } from 'express'
import { schemaCreate } from '../module/category/category.validation'
import { validateWithSchema } from '../middleware/validation'
import { Category } from '../module'
import uploadFile from '../middleware/upload'

const router = Router()

router
  .get('/', Category.categories)
  .post('/', uploadFile('category').any(), validateWithSchema(schemaCreate), Category.createCategory)

export default router