export const FILTER_CONFIG = {
  GATO: {
    scale: 1.1, // 110%
    offsetX: 0,
    offsetY: 0,
  },
  ORELHA: {
    scale: 2.5, // 250%
    offsetX: 0,
    offsetY: -150, // Posição no topo
  },
  OCULOS: {
    scale: 0.9, // 90%
    offsetX: 0,
    offsetY: -80, // Posição dos olhos
  },
  BIGODE: {
    scale: 0.8, // 80%
    offsetX: 0,
    offsetY: -20,
  },
  CHAPEU: {
    scale: 0.85, // 85%
    offsetX: 0,
    offsetY: -160, // Topo da cabeça
  },
  COROA: {
    scale: 0.45, // 45%
    offsetX: 0,
    offsetY: -140,
  },
  CORACOES: {
    scale: 0.7, // 70%
    offsetX: 0,
    offsetY: -150,
  },
};

export const getFilterConfig = (filterName) => {
  return FILTER_CONFIG[filterName] || FILTER_CONFIG.GATO;
};
