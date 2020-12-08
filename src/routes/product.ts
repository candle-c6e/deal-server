import { Router } from 'express'
import { schemaCreateProduct, schemaDeleteImage, schemaDeleteProduct, schemaEditProduct } from '../module/product/product.validation'
import { validateWithSchema } from '../middleware/validation'
import { Product } from '../module'
import uploads from '../middleware/uploads'
import resizeImage from '../middleware/resizeImage'
import authentication from '../middleware/auth'

const router = Router()

router
  .get('/all/:page', Product.products)
  .get('/search/:text/:page', Product.searchProduct)
  .get('/feature-products', Product.featureProducts)
  .get('/category/:categoryTitle/:page', Product.productByCategory)
  .get('/detail/:id', authentication, Product.productById)
  .get('/user/:page', authentication, Product.productByUserId)
  .get('/:slug', authentication, Product.product)
  .post('/', authentication, uploads.any(), resizeImage('product'), validateWithSchema(schemaCreateProduct), Product.createProduct)
  .patch('/', authentication, uploads.any(), resizeImage('product'), validateWithSchema(schemaEditProduct), Product.editProduct)
  .delete('/', authentication, validateWithSchema(schemaDeleteProduct), Product.deleteProduct)
  .delete('/image', authentication, validateWithSchema(schemaDeleteImage), Product.deleteProductImage)

export default router