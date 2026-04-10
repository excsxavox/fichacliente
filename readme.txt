Ficha Cliente — monorepo (BFF + SPA)

Requisitos: Node.js 20+

Instalar dependencias:
  npm install

Desarrollo (BFF en :3000 + Vite en :5173 con proxy a /health y /v1):
  npm run dev

Solo API:
  npm run dev -w server

Solo front:
  npm run dev -w frontend

Compilar:
  npm run build

Producción: el BFF se ejecuta con npm run start; el front se publica como estáticos (frontend/dist).

Variables: ver server/.env.example y frontend/.env.example

Stack API: TypeScript, Fastify 5, Zod. PII: src/security en el workspace server.
