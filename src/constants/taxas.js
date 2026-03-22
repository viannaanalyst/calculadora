export const TAXAS_ASAAS = {
  pix: {
    taxaFixa: 1.99,
    taxaFixaPromocional: 0.99,
  },
  boleto: {
    taxaFixa: 1.99,
  },
  cartao: {
    taxaFixa: 0.49,
    parcelas: {
      '1x': { percentual: 2.99, percentualPromocional: 1.99 },
      '2x-6x': { percentual: 3.49, percentualPromocional: 2.49 },
      '7x-12x': { percentual: 3.99, percentualPromocional: 2.99 },
    },
  },
  antecipacao: {
    parcelado: { normal: 1.7, automatico: 1.6 },
    avista: { normal: 1.25, automatico: 1.15 },
  },
}

export const IMPOSTO_PADRAO = 15.5

export const PARCELAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export const FORMAS_PAGAMENTO = [
  { id: 'pix', nome: 'PIX', icone: 'zap', cor: 'green' },
  { id: 'boleto', nome: 'Boleto', icone: 'file-text', cor: 'yellow' },
  { id: 'cartao', nome: 'Cartão de Crédito', icone: 'credit-card', cor: 'blue' },
]
