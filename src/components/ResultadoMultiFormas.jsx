import { useState } from 'react'
import { 
  Copy, 
  Check, 
  Download, 
  Zap, 
  FileText, 
  CreditCard,
  ArrowDown,
  AlertCircle
} from 'lucide-react'
import { formatarMoeda, formatarPorcentagem } from '../utils/formatters'
import { TAXAS_ASAAS } from '../constants/taxas'

const icones = {
  pix: Zap,
  boleto: FileText,
  cartao: CreditCard,
}

const cores = {
  pix: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  boleto: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  cartao: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
}

const ResultadoMultiFormas = ({ resultados, config }) => {
  const [copiado, setCopiado] = useState(false)

  if (!resultados || resultados.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">
          Adicione formas de pagamento e valores para ver o cálculo
        </p>
      </div>
    )
  }

  const totalBruto = resultados.reduce((acc, r) => acc + r.preco, 0)
  const totalLiquido = resultados.reduce((acc, r) => acc + r.valorLiquido, 0)
  const totalTaxas = resultados.reduce((acc, r) => acc + r.totalTaxas, 0)
  const totalDesejado = resultados.reduce((acc, r) => acc + r.valorDesejado, 0)

  const copiarValor = async () => {
    try {
      await navigator.clipboard.writeText(totalBruto.toFixed(2))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const exportarPDF = () => {
    const data = new Date().toLocaleDateString('pt-BR')
    const hora = new Date().toLocaleTimeString('pt-BR')
    
    let conteudo = `
=====================================
    SIMULAÇÃO DE PRECIFICAÇÃO
        MÚLTIPLAS FORMAS DE PAGAMENTO
=====================================

Data: ${data} às ${hora}
Imposto: ${formatarPorcentagem(config.imposto)}

`
    
    resultados.forEach((r) => {
      conteudo += `
--- ${r.formaNome} ---
Valor desejado: ${formatarMoeda(r.valorDesejado)}
Valor a cobrar: ${formatarMoeda(r.preco)}
Taxas: ${formatarMoeda(r.totalTaxas)}
Valor líquido: ${formatarMoeda(r.valorLiquido)}
`
    })

    conteudo += `
=====================================
RESUMO TOTAL
=====================================
Valor total a cobrar: ${formatarMoeda(totalBruto)}
Total de taxas: ${formatarMoeda(totalTaxas)}
Valor líquido total: ${formatarMoeda(totalLiquido)}

Gerado por Calculadora de Precificação
=====================================
`
    
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `simulacao-multipla-${data.replace(/\//g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Valor total a cobrar do cliente</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl sm:text-4xl font-bold">
            {formatarMoeda(totalBruto)}
          </span>
          <button
            onClick={copiarValor}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 
                       hover:bg-white/30 rounded-lg transition-all duration-200"
          >
            {copiado ? (
              <>
                <Check size={18} />
                <span className="text-sm hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span className="text-sm hidden sm:inline">Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {resultados.map((r) => {
          const Icone = icones[r.formaPagamento]
          const cor = cores[r.formaPagamento]
          
          return (
            <div key={r.formaPagamento} className={`${cor.bg} border ${cor.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Icone size={20} className={cor.text} />
                <h3 className={`font-semibold ${cor.text}`}>{r.formaNome}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor desejado:</span>
                  <span className="font-medium">{formatarMoeda(r.valorDesejado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor a cobrar:</span>
                  <span className="font-bold text-lg">{formatarMoeda(r.preco)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Taxa fixa:</span>
                    <span>- {formatarMoeda(r.taxaFixa)}</span>
                  </div>
                  {r.taxaPercentual > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Taxa cartão ({formatarPorcentagem(r.taxaPercentual)}):</span>
                      <span>- {formatarMoeda(r.taxaCartaoValor)}</span>
                    </div>
                  )}
                  {r.taxaAntecipacao > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Antecipação ({formatarPorcentagem(r.taxaAntecipacao)}):</span>
                      <span>- {formatarMoeda(r.taxaAntecipacaoValor)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Imposto ({formatarPorcentagem(r.imposto)}):</span>
                    <span>- {formatarMoeda(r.valorImposto)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Líquido:</span>
                  <span className="font-bold text-green-600">{formatarMoeda(r.valorLiquido)}</span>
                </div>
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-2 py-3 border-t-2 border-gray-300 mt-4">
          <ArrowDown size={20} className="text-gray-400" />
          <span className="font-medium text-gray-700">Resumo Geral</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Valor desejado (líquido):</span>
            <span className="font-medium">{formatarMoeda(totalDesejado)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total de taxas:</span>
            <span className="font-medium text-red-600">- {formatarMoeda(totalTaxas)}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Valor líquido total:</span>
            <span className="font-bold text-green-700">{formatarMoeda(totalLiquido)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <button
          onClick={exportarPDF}
          className="w-full flex items-center justify-center gap-2 py-3 
                     bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200
                     text-gray-700 font-medium"
        >
          <Download size={18} />
          Exportar Simulação Completa
        </button>
      </div>
    </div>
  )
}

export default ResultadoMultiFormas
