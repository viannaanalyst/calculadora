import { TAXAS_ASAAS } from '../constants/taxas'
import { calcularMesesAntecipacao } from './formatters'

export const calcularMultiFormas = ({
  formas,
  imposto,
  usarTaxaPromocional,
  usarAntecipacao,
  usarAntecipacaoAutomatica,
}) => {
  const resultados = []

  formas.forEach((forma) => {
    const resultado = calcularFormaUnica({
      valorDesejado: forma.valor,
      formaPagamento: forma.tipo,
      parcelas: forma.parcelas || 1,
      imposto,
      usarTaxaPromocional,
      usarAntecipacao,
      usarAntecipacaoAutomatica,
    })

    resultados.push({
      formaPagamento: forma.tipo,
      formaNome: forma.tipo === 'pix' ? 'PIX' : forma.tipo === 'boleto' ? 'Boleto' : `Cartão ${forma.parcelas || 1}x`,
      ...resultado,
    })
  })

  return resultados
}

const calcularFormaUnica = ({
  valorDesejado,
  formaPagamento,
  parcelas,
  imposto,
  usarTaxaPromocional,
  usarAntecipacao,
  usarAntecipacaoAutomatica,
}) => {
  if (valorDesejado <= 0) {
    return {
      preco: 0,
      valorDesejado: 0,
      valorImposto: 0,
      taxaFixa: 0,
      taxaPercentual: 0,
      taxaCartaoValor: 0,
      taxaAntecipacao: 0,
      taxaAntecipacaoValor: 0,
      totalTaxas: 0,
      valorLiquido: 0,
    }
  }

  const impostoDecimal = imposto / 100

  if (formaPagamento === 'pix') {
    return calcularPixOuBoleto({
      valorDesejado,
      impostoDecimal,
      taxaFixa: usarTaxaPromocional 
        ? TAXAS_ASAAS.pix.taxaFixaPromocional 
        : TAXAS_ASAAS.pix.taxaFixa,
    })
  }

  if (formaPagamento === 'boleto') {
    return calcularPixOuBoleto({
      valorDesejado,
      impostoDecimal,
      taxaFixa: TAXAS_ASAAS.boleto.taxaFixa,
    })
  }

  if (formaPagamento === 'cartao') {
    return calcularCartao({
      valorDesejado,
      impostoDecimal,
      parcelas,
      usarTaxaPromocional,
      usarAntecipacao,
      usarAntecipacaoAutomatica,
    })
  }

  return {
    preco: 0,
    valorDesejado,
    valorImposto: 0,
    taxaFixa: 0,
    taxaPercentual: 0,
    taxaCartaoValor: 0,
    taxaAntecipacao: 0,
    taxaAntecipacaoValor: 0,
    totalTaxas: 0,
    valorLiquido: 0,
  }
}

const calcularPixOuBoleto = ({ valorDesejado, impostoDecimal, taxaFixa }) => {
  const preco = (valorDesejado + taxaFixa) / (1 - impostoDecimal)
  const valorImposto = preco * impostoDecimal
  const valorLiquido = preco - valorImposto - taxaFixa
  const totalTaxas = valorImposto + taxaFixa

  return {
    preco,
    valorDesejado,
    valorImposto,
    taxaFixa,
    taxaPercentual: 0,
    taxaCartaoValor: 0,
    taxaAntecipacao: 0,
    taxaAntecipacaoValor: 0,
    totalTaxas,
    valorLiquido,
  }
}

const calcularCartao = ({
  valorDesejado,
  impostoDecimal,
  parcelas,
  usarTaxaPromocional,
  usarAntecipacao,
  usarAntecipacaoAutomatica,
}) => {
  const { taxaPercentual, taxaFixa } = obterTaxasCartao(parcelas, usarTaxaPromocional)
  const taxaPercentualDecimal = taxaPercentual / 100

  let taxaAntecipacaoDecimal = 0
  let taxaAntecipacaoTotal = 0

  if (usarAntecipacao) {
    const meses = calcularMesesAntecipacao(parcelas)
    const taxaAntecipacaoMensal = parcelas === 1
      ? (usarAntecipacaoAutomatica 
          ? TAXAS_ASAAS.antecipacao.avista.automatico 
          : TAXAS_ASAAS.antecipacao.avista.normal)
      : (usarAntecipacaoAutomatica 
          ? TAXAS_ASAAS.antecipacao.parcelado.automatico 
          : TAXAS_ASAAS.antecipacao.parcelado.normal)
    
    taxaAntecipacaoDecimal = (taxaAntecipacaoMensal * meses) / 100
    taxaAntecipacaoTotal = taxaAntecipacaoMensal * meses
  }

  const divisor = 1 - impostoDecimal - taxaPercentualDecimal - taxaAntecipacaoDecimal

  if (divisor <= 0) {
    return {
      preco: Infinity,
      valorDesejado,
      valorImposto: 0,
      taxaFixa,
      taxaPercentual,
      taxaCartaoValor: 0,
      taxaAntecipacao: taxaAntecipacaoTotal,
      taxaAntecipacaoValor: 0,
      totalTaxas: Infinity,
      valorLiquido: 0,
      erro: 'Taxas muito altas para o valor informado',
    }
  }

  const preco = (valorDesejado + taxaFixa) / divisor
  const valorImposto = preco * impostoDecimal
  const taxaCartaoValor = preco * taxaPercentualDecimal
  const taxaAntecipacaoValor = preco * taxaAntecipacaoDecimal
  const valorLiquido = preco - valorImposto - taxaCartaoValor - taxaAntecipacaoValor - taxaFixa
  const totalTaxas = valorImposto + taxaCartaoValor + taxaAntecipacaoValor + taxaFixa

  return {
    preco,
    valorDesejado,
    valorImposto,
    taxaFixa,
    taxaPercentual,
    taxaCartaoValor,
    taxaAntecipacao: taxaAntecipacaoTotal,
    taxaAntecipacaoValor,
    totalTaxas,
    valorLiquido,
  }
}

const obterTaxasCartao = (parcelas, usarTaxaPromocional) => {
  const { cartao } = TAXAS_ASAAS

  let percentual
  if (parcelas === 1) {
    percentual = usarTaxaPromocional 
      ? cartao.parcelas['1x'].percentualPromocional 
      : cartao.parcelas['1x'].percentual
  } else if (parcelas >= 2 && parcelas <= 6) {
    percentual = usarTaxaPromocional 
      ? cartao.parcelas['2x-6x'].percentualPromocional 
      : cartao.parcelas['2x-6x'].percentual
  } else {
    percentual = usarTaxaPromocional 
      ? cartao.parcelas['7x-12x'].percentualPromocional 
      : cartao.parcelas['7x-12x'].percentual
  }

  return {
    taxaPercentual: percentual,
    taxaFixa: cartao.taxaFixa,
  }
}
