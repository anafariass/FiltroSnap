// Lista de todos os filtros disponiveis
export const FILTERS = {
  ORIGINAL: 'original',
  GATO: 'gato',
  ORELHA: 'orelha',
  OCULOS: 'oculos',
  BIGODE: 'bigode',
  CHAPEU: 'chapeu',
  COROA: 'coroa',
  CORACOES: 'coracoes',
};

// Converte o ID do filtro pro nome legal pra mostrar
export const getFilterName = (filter) => {
  const names = {
    original: 'Original',
    gato: 'Gato',
    orelha: 'Orelha',
    oculos: 'Óculos',
    bigode: 'Bigode',
    chapeu: 'Chapéu',
    coroa: 'Coroa',
    coracoes: 'Corações',
  };
  return names[filter] || 'Filtro';
};
