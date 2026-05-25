# 🚀 Gerenciador de Tarefas - Rocketlog

API REST desenvolvida com Node.js para gerenciamento de usuários, equipes e tarefas, com autenticação JWT, controle de permissões e testes automatizados.

📌 Este projeto foi desenvolvido como parte de um desafio prático da Rocketseat, sendo implementado e aprimorado com funcionalidades adicionais, validações e testes completos.

---

## 🛠 Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (Autenticação)
- Zod (Validação)
- Jest + Supertest (Testes)

---

## ✅ Funcionalidades

### 👤 Usuários
- Criar usuário
- Validação de e-mail único
- Senha criptografada com bcrypt

### 🔐 Autenticação
- Login com JWT
- Proteção de rotas
- Identificação do usuário via token

### 👥 Teams
- Criar equipe (admin)
- Controle de acesso por role (admin / member)

### ✅ Tasks
- Criar tarefa
- Listar tarefas
- Atualizar tarefa
- Deletar tarefa
- Histórico de mudanças de status

---

## 🔐 Autenticação

Todas as rotas protegidas exigem:

Authorization: Bearer TOKEN

---

## 📌 Endpoints

### 👤 Users
- `POST /users` → Criar usuário

### 🔐 Auth
- `POST /sessions` → Login

### 👥 Teams
- `POST /teams` → Criar team (admin)
- `GET /teams`

### ✅ Tasks
- `POST /tasks`
- `GET /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

---

## ⚙️ Como rodar localmente

### 1. Clonar repositório
git clone https://github.com/soarezzgzs/Gerenciador-de-tarefas---Rocketlog.git

### 2. Instalar dependências
npm install

### 3. Criar arquivo .env
DATABASE_URL=""
JWT_SECRET=""

### 4. Rodar migrations
npx prisma migrate dev

### 5. Rodar servidor
npm run dev

### 6. Rodar teste
npm run test

---

🌐 API ONLINE
👉 https://gerenciador-de-tarefas-rocketlog.onrender.com

---

🧪 Testes

Testes E2E completos com Jest e Supertest
Fluxos testados:

Criar usuário
Login
Permissões
CRUD de tasks

---

📚 Observações

Arquitetura baseada em controllers + middlewares
Autenticação com JWT
Controle de acesso por roles
Banco de dados PostgreSQL com Prisma

---

💼 Autor
Leonardo Soares 🚀
