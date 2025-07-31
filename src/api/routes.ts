import { Router } from 'express';
import multer from 'multer';
import { uploadFile, getOrders } from './controller';
import { validate } from './middlewares/validate.middleware';
import { getOrdersSchema } from './schemas/order.schema';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('file'), uploadFile);
router.get('/orders', validate(getOrdersSchema), getOrders);

export default router;
