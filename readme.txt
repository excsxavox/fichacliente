Fichacliente — monorepo (workspaces)

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

Producción (sirve solo el BFF; el front se despliega como estáticos de frontend/dist):
  npm run start

Variables: ver server/.env.example y frontend/.env.example
