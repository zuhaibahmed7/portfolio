import { readFile } from 'fs/promises';
import { join } from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  const openapiPath = join(process.cwd(), 'public', 'openapi.json');
  const content = await readFile(openapiPath, 'utf8');
  
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'public, max-age=86400');
  response.status(200).send(content);
}