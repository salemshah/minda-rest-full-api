import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import SwaggerParser from '@apidevtools/swagger-parser';

export default async function swaggerLoader(app: Application): Promise<void> {
  try {
    const swaggerDocument = await SwaggerParser.bundle('src/docs/swagger.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (error) {
    console.error('Failed to load or resolve YAML file:', error);
  }
}
