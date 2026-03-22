export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export const formatarPorcentagem = (valor, decimais = 2) => {
  return `${valor.toFixed(decimais)}%`
}

export const parseMoeda = (valor) => {
  if (!valor) return 0
  const numero = valor
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(numero) || 0
}

export const calcularMesesAntecipacao = (parcelas) => {
  return Math.max(0, parcelas - 1)
}
