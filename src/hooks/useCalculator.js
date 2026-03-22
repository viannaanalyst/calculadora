import { useState, useEffect, useCallback } from 'react'
import { calcularPrecoFinal } from '../utils/calculos'
import { IMPOSTO_PADRAO } from '../constants/taxas'

const STORAGE_KEY = 'calculadora-config'

const getConfigInicial = () => {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo) return JSON.parse(salvo)
  } catch (e) {
    console.error('Erro ao carregar configurações:', e)
  }
  return {
    imposto: IMPOSTO_PADRAO,
    taxaFixaPix: 1.99,
    usarTaxaPromocional: false,
    usarAntecipacao: false,
    usarAntecipacaoAutomatica: false,
  }
}

export const useCalculator = () => {
  const [valorDesejado, setValorDesejado] = useState(0)
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [parcelas, setParcelas] = useState(1)
  const [config, setConfig] = useState(getConfigInicial)
  const [resultado, setResultado] = useState(null)

  const atualizarConfig = useCallback((novosValores) => {
    setConfig(prev => {
      const novaConfig = { ...prev, ...novosValores }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novaConfig))
      } catch (e) {
        console.error('Erro ao salvar configurações:', e)
      }
      return novaConfig
    })
  }, [])

  useEffect(() => {
    if (valorDesejado > 0) {
      const calc = calcularPrecoFinal({
        valorDesejado,
        imposto: config.imposto,
        formaPagamento,
        parcelas,
        usarTaxaPromocional: config.usarTaxaPromocional,
        usarAntecipacao: config.usarAntecipacao,
        usarAntecipacaoAutomatica: config.usarAntecipacaoAutomatica,
      })
      setResultado({
        preco: calc.preco,
        ...calc.breakdown,
        formaPagamento,
        parcelas,
      })
    } else {
      setResultado(null)
    }
  }, [valorDesejado, formaPagamento, parcelas, config])

  return {
    valorDesejado,
    setValorDesejado,
    formaPagamento,
    setFormaPagamento,
    parcelas,
    setParcelas,
    config,
    atualizarConfig,
    resultado,
  }
}

export default useCalculator
