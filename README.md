# 📸 FiltroSnap

Um aplicativo mobile de câmera com filtros em tempo real, construído com React Native e Expo.

### Softwares Obrigatórios

1. **Node.js** (v16 ou superior)
   - Download: https://nodejs.org/
   - Verifique a instalação: `node --version`

2. **npm** (geralmente vem com Node.js)
   - Verifique: `npm --version`

3. **PostgreSQL** (banco de dados)
   - Download: https://www.postgresql.org/download/
   - Durante a instalação, defina uma senha para o usuário `postgres`
   - Verifique a instalação abrindo o pgAdmin ou usando: `psql --version`

4. **Git** (opcional, mas recomendado)
   - Download: https://git-scm.com/

## 📥 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/filtrosnap.git
cd filtrosnap
```

### 2. Configurar o Backend

#### 2.1 Instalar dependências do backend

```bash
cd backend
npm install
```

#### 2.2 Configurar o banco de dados PostgreSQL

Abra o pgAdmin ou use o terminal para criar o banco de dados:

```bash
psql -U postgres
```

Digite a senha do postgres quando pedido, depois execute:

```sql
CREATE DATABASE filtrosnap;
\c filtrosnap
CREATE TABLE fotos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  caminho VARCHAR(255) NOT NULL,
  favorita BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Depois, saia com `\q`.

#### 2.3 Criar arquivo .env

Na pasta `backend`, crie um arquivo chamado `.env`:

```
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=filtrosnap
PORT=3000
```

### 3. Configurar o Frontend

#### 3.1 Instalar dependências do frontend

```bash
cd frontend
npm install
```

#### 3.2 Configurar a URL do servidor

Abra `frontend/config.js` e mude o IP para o seu IP local:

```javascript
const API_URL = "http://SEU_IP_LOCAL:3000/api";
export default API_URL;
```

**Como encontrar seu IP:**

- **Windows**: Execute `ipconfig` no terminal e procure por "IPv4 Address"

## 🚀 Como Rodar

### 1. Inicie o Backend

Em uma janela de terminal (na pasta `backend`):

```bash
npm start
```

Você deve ver:

```
Servidor rodando na porta 3000
```

### 2. Inicie o Frontend (em outra janela de terminal)

Na pasta `frontend`:

```bash
npm start
```

Isso abrirá o Expo DevTools no navegador. Escaneie o QR code com o Expo Go (disponível na App Store ou Play Store).

## 📁 Estrutura do Projeto

```
filtrosnap/
├── backend/
│   ├── assets/               # Imagens PNG dos filtros
│   ├── uploads/              # Fotos capturadas salvas
│   ├── db.js                 # Conexão com banco de dados
│   ├── init-db.js            # Script de inicialização do BD
│   ├── server.js             # Servidor Express com processamento de filtros
│   ├── filterConfig.json     # Configuração de filtros para salvamento
│   ├── package.json          # Dependências do backend
│   └── .env                  # Variáveis de ambiente (não comitar)
│
├── frontend/
│   ├── App.js                        # Componente principal com navegação
│   ├── config.js                     # Configuração da URL da API
│   ├── package.json                  # Dependências do frontend
│   ├── assets/                       # Ícones e imagens
│   ├── components/
│   │   ├── CameraScreen.js           # Tela de câmera com preview em tempo real
│   │   └── GalleryScreen.js          # Tela de galeria com grid 2 colunas
│   ├── services/
│   │   └── api.js                    # Cliente API com upload de fotos
│   └── utils/
│       ├── filters.js                # Definições dos filtros
│       └── filterConfig.js           # Config centralizada de tamanho/posição
│
└── README.md                 # Este arquivo
```

## 📚 Tecnologias Utilizadas

- **Frontend**: React Native, Expo, React Hooks
- **Backend**: Node.js, Express, PostgreSQL, Sharp (processamento de imagens)
- **Ícones**: Font Awesome
- **HTTP**: Axios

## 🎨 Filtros Disponíveis

1. **Gato** 🐱 - Rosto de gato
2. **Orelha** 👂 - Orelhas de gato
3. **Óculos** 👓 - Óculos escuros
4. **Bigode** 👨 - Bigode clássico
5. **Chapéu** 🎩 - Chapéu topo
6. **Coroa** 👑 - Coroa real
7. **Corações** 💕 - Corações flutuantes

## ⚙️ Personalizar Filtros

Todos os filtros são configuráveis no arquivo `frontend/utils/filterConfig.js`:

```javascript
export const FILTER_CONFIG = {
  GATO: {
    scale: 1.1, // Tamanho do filtro (1.0 = 100%)
    offsetX: 0, // Posição horizontal em pixels
    offsetY: 0, // Posição vertical em pixels
  },
  // ... outros filtros
};
```

## 📋 Checklist de Funcionalidades

- ✅ Câmera em tempo real com filtros
- ✅ 7 filtros diferentes com preview individual
- ✅ Galeria com grid 2 colunas
- ✅ Marcar/desmarcar favoritos
- ✅ Deletar fotos
- ✅ Persistência com PostgreSQL
- ✅ Interface estilo Instagram
- ✅ Sincronização frontend/backend de filtros
- ✅ Comentários e documentação em português

