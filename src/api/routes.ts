import { Router } from 'express';
import multer from 'multer';

import { createOrderController } from '@/api/controllers/order.controller';
import { validate } from '@/api/middlewares/validate.middleware';
import { getOrdersSchema } from '@/api/schemas/order.schema';
import { OrderUseCase } from '@/application/usecases/order.usecase';

export const createRouter = (orderUseCase: OrderUseCase) => {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });
  const { uploadFile, getOrders } = createOrderController(orderUseCase);

  /**
   * @swagger
   * tags:
   *   name: Orders
   *   description: API para gerenciamento de pedidos
   */

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Importa um arquivo de pedidos
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Arquivo processado e dados salvos com sucesso
   *       400:
   *         description: Nenhum arquivo enviado
   *   get:
   *     summary: Retorna uma lista de pedidos
   *     tags: [Orders]
   *     parameters:
   *       - in: query
   *         name: orderId
   *         schema:
   *           type: integer
   *         description: ID do pedido para filtrar
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Data de início para filtrar (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Data de fim para filtrar (YYYY-MM-DD)
   *       - in: query
   *         name: productId
   *         schema:
   *           type: integer
   *         description: ID do produto para filtrar
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [order_id, total, date]
   *         description: Campo para ordenação dos resultados.
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Ordem da ordenação (ascendente ou descendente).
   *     responses:
   *       200:
   *         description: Lista de pedidos retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/UserResponseDto'
   */
  router.post('/orders', upload.single('file'), uploadFile);
  router.get('/orders', validate(getOrdersSchema), getOrders);

  return router;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductResponseDto:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *         value:
 *           type: string
 *     OrderResponseDto:
 *       type: object
 *       properties:
 *         order_id:
 *           type: integer
 *         total:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductResponseDto'
 *     UserResponseDto:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         orders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderResponseDto'
 */
