import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Challenge API',
      version: '1.0.0',
      description: 'API para processamento e consulta de pedidos',
    },
  },
  apis: ['./src/api/routes.ts', './src/api/dtos/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
