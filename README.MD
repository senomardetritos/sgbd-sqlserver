# Database Management System (SGBD) - SQL Server
Um Sistema de Gerenciamento de Banco de Dados para SQL Server desenvolvido com uma arquitetura moderna, utilizando Python + Flask no back-end e React + Vite no front-end.

## 📋 Índice
- Visão Geral
- Pré-requisitos
- Configuração do Projeto
- Instalação e Execução
- Funcionalidades
- Estrutura do Projeto

## 🚀 Visão Geral
Este projeto oferece uma interface web intuitiva para gerenciar bancos de dados SQL Server, permitindo operações completas de CRUD (Create, Read, Update, Delete) através de uma aplicação web responsiva.

## ⚙️ Pré-requisitos
Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Docker** e **Docker Compose**
- **Python** 3.8 ou superior
- **Node.js** 16 ou superior
- **npm** ou **yarn**

## 🔧 Configuração do Projeto
### 1. Configuração do Banco de Dados (Docker)
O banco de dados SQL Server pode ser configurado através do arquivo docker-compose.yml:

```bash
docker-compose up -d
```

### 2. Configuração do Back-end (API)
Na pasta api/, crie um arquivo .env com as seguintes variáveis de ambiente:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_USERNAME=SA
DB_PASSWORD=SUA_SENHA_AQUI
```

### 3. Configuração do Front-end (App)
Na pasta app/, crie um arquivo .env.development com a URL da API:

```env
VITE_API_URL=http://127.0.0.1:5000
```

## 🛠️ Instalação e Execução
### Instalação de Dependências
**Back-end (API):**

```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

**Front-end (App):**

```bash
cd app
npm install
```

### Execução da Aplicação
É necessário executar ambos os serviços simultaneamente. Abra dois terminais:

**Terminal 1 - Back-end:**

```bash
cd api
npm run dev
```

**Terminal 2 - Front-end:**

```bash
cd app
npm run dev
```

## 📍 Acesso à Aplicação
Após a inicialização, acesse a aplicação em:
[http://localhost:5173/](http://localhost:5173/)

## ✨ Funcionalidades

### Gerenciamento de Bancos de Dados
- Criar novos bancos de dados
- Excluir bancos de dados existentes

### Gerenciamento de Tabelas
- Criar novas tabelas
- Excluir tabelas existentes

### Gerenciamento de Campos
- Adicionar novos campos às tabelas
- Alterar propriedades dos campos
- Excluir campos existentes

### Gerenciamento de Registros
- Adicionar novos registros
- Alterar registros existentes
- Excluir registros

## 📁 Estrutura do Projeto

```
projeto/
├── api/                 # Back-end (Python + Flask)
│   ├── .env            # Variáveis de ambiente do back-end
│   └── ...
├── app/                # Front-end (React + Vite)
│   ├── .env.development # Variáveis de ambiente do front-end
│   └── ...
└── docker-compose.yml  # Configuração do SQL Server
```
