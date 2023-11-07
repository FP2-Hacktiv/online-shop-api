import express from 'express';
import { getAll, addProduct, updateProduct, deleteProduct, getProduct } from '../controllers/ProductController.js';
import PermissionMiddleware from '../middlewares/PermissionMiddleware.js';
const router = express.Router();

router.route('/').get(getAll).post(PermissionMiddleware, addProduct);
router.route('/:id').get(getProduct);
router.route('/:id').patch( PermissionMiddleware, updateProduct).delete(PermissionMiddleware, deleteProduct);

export default router;
