const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
const pool = require('./db'); // Conexão com banco de dados

// Carrega as configurações dos filtros
let filterConfig = JSON.parse(fs.readFileSync('filterConfig.json', 'utf8'));
console.log('🎭 Configuração dos filtros carregada:', JSON.stringify(filterConfig, null, 2));
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuração do multer (gerencia upload de arquivos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Permite requisições de qualquer lugar
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Registra todas as requisições no console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

// Rota pra testar se o servidor tá funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Pega todas as fotos do banco
app.get('/api/fotos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fotos ORDER BY data_criacao DESC');
    
    // Adiciona a URL completa pra acessar cada foto
    const fotosComUrl = result.rows.map(foto => ({
      ...foto,
      caminhoUrl: `http://${req.get('host')}${foto.caminho}`
    }));
    
    res.json(fotosComUrl);
  } catch (err) {
    console.error('Erro ao listar fotos:', err);
    res.status(500).json({ erro: 'Erro ao listar fotos' });
  }
});
// Rota de upload de imagem
app.post('/api/fotos/upload', upload.single('imagem'), async (req, res) => {
  try {
    console.log('Requisição de upload recebida');
    console.log('Arquivo:', req.file ? req.file.filename : 'Nenhum arquivo');
    console.log('Body:', req.body);
    
    const { nome, filtro } = req.body;
    let caminho = `/uploads/${req.file.filename}`;
    const uploadPath = path.join('uploads', req.file.filename);
    
    // Se tem filtro, compor a imagem
    if (filtro && filtro !== 'ORIGINAL') {
      try {
        console.log('Aplicando filtro:', filtro);
        const filterPath = path.join('assets', `${filtro.toLowerCase()}.png`);
        
        if (fs.existsSync(filterPath)) {
          // Obter dimensões da imagem
          const metadata = await sharp(uploadPath).metadata();
          
          // Compor a imagem com o filtro
          await sharp(uploadPath)
            .composite([{
              input: filterPath,
              top: 0,
              left: 0,
            }])
            .toFile(uploadPath);
          
          console.log('Filtro aplicado com sucesso');
        } else {
          console.log('Arquivo do filtro não encontrado:', filterPath);
        }
      } catch (filterError) {
        console.error('Erro ao aplicar filtro:', filterError);
        // Continuar mesmo se o filtro falhar
      }
    }
    
    const result = await pool.query(
      'INSERT INTO fotos (nome, caminho, favorita) VALUES ($1, $2, $3) RETURNING *',
      [nome, caminho, false]
    );
    
    console.log('Foto salva com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao fazer upload:', err);
    res.status(500).json({ erro: 'Erro ao fazer upload', mensagem: err.message });
  }
});

// Recebe a foto em base64 (formato que o app mobile manda)
app.post('/api/fotos/upload-base64', async (req, res) => {
  try {
    console.log('Requisição de upload base64 recebida');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    const { nome, filtro, filterConfig: receivedConfig, imagem } = req.body;

    if (!nome || !imagem) {
      return res.status(400).json({ erro: 'Nome e imagem são obrigatórios' });
    }

    // Cria um nome único pra foto
    const filename = `imagem_${Date.now()}.jpg`;
    const uploadPath = path.join('uploads', filename);

    // Converte base64 em arquivo de imagem
    const base64Data = imagem.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Salva a foto no servidor
    fs.writeFileSync(uploadPath, buffer);

    // Se tem filtro, aplica ele na foto
    if (filtro && filtro !== 'ORIGINAL') {
      try {
        console.log('Aplicando filtro base64:', filtro);
        const filterPath = path.join('assets', `${filtro.toLowerCase()}.png`);
        console.log('Caminho completo do filtro:', filterPath);
        console.log('Arquivo existe?', fs.existsSync(filterPath));

        if (fs.existsSync(filterPath)) {
          console.log('Arquivo do filtro existe:', filterPath);
          
          // Mostra info do arquivo
          const stats = fs.statSync(filterPath);
          console.log('Data de modificação do arquivo:', stats.mtime);
          console.log('Tamanho do arquivo:', stats.size, 'bytes');
          
          // Pega o tamanho da foto
          const metadata = await sharp(uploadPath).metadata();
          console.log('Dimensões da imagem:', metadata.width, 'x', metadata.height);
          
          // Pega as configs do filtro (tamanho e posição) do arquivo de configuração
          const configKey = filtro.toUpperCase(); // Converte pra maiúscula
          let config = filterConfig[configKey] || { scale: 0.9, offsetX: 0, offsetY: 0 };
          console.log('Configuração do filtro usada:', config);
          
          // Limita o scale pra não ultrapassar 99% da imagem (permite valores grandes)
          if (config.scale > 0.99) {
            config.scale = 0.99;
            console.log('Scale limitado a 99%');
          }
          
          // Calcula o tamanho do filtro
          const filterWidth = Math.round(metadata.width * config.scale);
          const filterHeight = Math.round(metadata.height * config.scale);
          
          // Redimensiona o filtro pra caber na foto
          const filterBuffer = await sharp(filterPath)
            .resize(filterWidth, filterHeight, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();
          
          // Obter dimensões reais do filtro redimensionado
          const resizedFilterMeta = await sharp(filterBuffer).metadata();
          
          // Calcular posição (centro + offset)
          const centerX = Math.round((metadata.width - resizedFilterMeta.width) / 2);
          const centerY = Math.round((metadata.height - resizedFilterMeta.height) / 2);
          const posX = Math.max(0, centerX + (config.offsetX || 0));
          const posY = Math.max(0, centerY + (config.offsetY || 0));
          
          console.log(`Posicionando filtro em X:${posX}, Y:${posY}, Tamanho real:${resizedFilterMeta.width}x${resizedFilterMeta.height}`);
          
          // Cria arquivo temporário pra trabalhar
          const tempPath = uploadPath + '.temp';
          
          // Coloca o filtro em cima da foto
          await sharp(uploadPath)
            .composite([{
              input: filterBuffer,
              top: posY,
              left: posX,
            }])
            .jpeg({ quality: 95 })
            .toFile(tempPath);
          
          // Substitui a foto original pela que tem o filtro
          fs.unlinkSync(uploadPath);
          fs.renameSync(tempPath, uploadPath);

          console.log('Filtro aplicado com sucesso');
        } else {
          console.log('Arquivo do filtro não encontrado:', filterPath);
        }
      } catch (filterError) {
        console.error('Erro ao aplicar filtro:', filterError);
      }
    }

    // Salva a info da foto no banco de dados
    const result = await pool.query(
      'INSERT INTO fotos (nome, caminho, favorita) VALUES ($1, $2, $3) RETURNING *',
      [nome, `/uploads/${filename}`, false]
    );

    console.log('Foto salva com sucesso (base64):', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao fazer upload base64:', err);
    res.status(500).json({ erro: 'Erro ao fazer upload', mensagem: err.message });
  }
});

// Pega uma foto específica pelo ID
app.get('/api/fotos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM fotos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Foto não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao obter foto:', err);
    res.status(500).json({ erro: 'Erro ao obter foto' });
  }
});

// Criar nova foto
app.post('/api/fotos', async (req, res) => {
  try {
    const { nome, caminho } = req.body;
    
    if (!nome || !caminho) {
      return res.status(400).json({ erro: 'Nome e caminho são obrigatórios' });
    }
    
    const result = await pool.query(
      'INSERT INTO fotos (nome, caminho, favorita) VALUES ($1, $2, $3) RETURNING *',
      [nome, caminho, false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar foto:', err);
    res.status(500).json({ erro: 'Erro ao criar foto' });
  }
});

// Marca ou desmarca foto como favorita
app.put('/api/fotos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { favorita } = req.body;
    
    if (typeof favorita !== 'boolean') {
      return res.status(400).json({ erro: 'Campo "favorita" deve ser booleano' });
    }
    
    const result = await pool.query(
      'UPDATE fotos SET favorita = $1 WHERE id = $2 RETURNING *',
      [favorita, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Foto não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar foto:', err);
    res.status(500).json({ erro: 'Erro ao atualizar foto' });
  }
});

// Apaga uma foto
app.delete('/api/fotos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM fotos WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Foto não encontrada' });
    }
    
    res.json({ mensagem: 'Foto deletada com sucesso', foto: result.rows[0] });
  } catch (err) {
    console.error('Erro ao deletar foto:', err);
    res.status(500).json({ erro: 'Erro ao deletar foto' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
