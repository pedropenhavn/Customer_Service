# Sistema de Clientes - Frontend React

Este é o frontend React para o sistema de gerenciamento de clientes, desenvolvido com Material-UI e integrado ao backend Laravel.

## 🚀 Funcionalidades

- **Autenticação completa**: Login e registro de usuários
- **Dashboard interativo**: Estatísticas e gráficos dos clientes
- **Listagem de clientes**: Tabela com filtros avançados e paginação
- **Interface responsiva**: Design moderno e adaptável
- **Navegação intuitiva**: Menu lateral e breadcrumbs

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend Laravel rodando na porta 8000

## 🛠️ Instalação

1. **Instalar dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurar proxy:**
   O proxy já está configurado no `package.json` para apontar para `http://localhost:8000`

3. **Executar o projeto:**
   ```bash
   npm start
   ```

4. **Acessar a aplicação:**
   Abra [http://localhost:3000](http://localhost:3000) no navegador

## 🔧 Configuração do Backend

Certifique-se de que o backend Laravel está configurado corretamente:

1. **Executar migrações:**
   ```bash
   php artisan migrate
   ```

2. **Executar seeders:**
   ```bash
   php artisan db:seed
   ```

3. **Iniciar o servidor Laravel:**
   ```bash
   php artisan serve
   ```

## 👤 Usuários Padrão

Após executar os seeders, os seguintes usuários estarão disponíveis:

- **Administrador:**
  - Email: `admin@admin.com`
  - Senha: `password`

- **Usuário Teste:**
  - Email: `user@test.com`
  - Senha: `password`

## 📱 Funcionalidades Principais

### Dashboard
- Estatísticas gerais dos clientes
- Gráficos de distribuição por status
- Evolução temporal dos clientes
- Cards informativos

### Lista de Clientes
- Tabela com paginação
- Filtros avançados (CNPJ, origem, status, flag, datas)
- Visualização detalhada de cada cliente
- Expansão de linhas para ver dados completos

### Autenticação
- Login com email e senha
- Registro de novos usuários
- Logout seguro
- Proteção de rotas

## 🎨 Tecnologias Utilizadas

- **React 18**: Framework principal
- **Material-UI**: Componentes de interface
- **React Router**: Navegação
- **Axios**: Requisições HTTP
- **Recharts**: Gráficos e visualizações
- **Context API**: Gerenciamento de estado

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.js          # Tela de login/registro
│   │   ├── Dashboard.js      # Dashboard principal
│   │   ├── ClientsList.js    # Lista de clientes
│   │   ├── Layout.js         # Layout com navegação
│   │   └── ProtectedRoute.js # Rota protegida
│   ├── contexts/
│   │   └── AuthContext.js    # Contexto de autenticação
│   ├── services/
│   │   └── api.js           # Configuração da API
│   └── App.js               # Componente principal
```

## 🔒 Segurança

- Autenticação baseada em sessões Laravel
- Rotas protegidas para usuários autenticados
- Validação de formulários
- Tratamento de erros de API

## 🚀 Deploy

Para fazer o build de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `build/`.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do Laravel e React, ou entre em contato com a equipe de desenvolvimento.
