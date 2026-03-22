import { useState } from 'react'
import { 
  Copy, 
  Check, 
  Download, 
  DollarSign, 
  Receipt, 
  CreditCard, 
  Zap,
  AlertCircle
} from 'lucide-react'
import { formatarMoeda, formatarPorcentagem } from '../utils/formatters'
import { TAXAS_ASAAS } from '../constants/taxas'

const ResultadoDetalhado = ({ resultado, config }) => {
  const [copiado, setCopiado] = useState(false)

  if (!resultado) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">
          Digite o valor que deseja receber para ver o cálculo
        </p>
      </div>
    )
  }

  if (resultado.erro) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <p className="font-medium">{resultado.erro}</p>
        </div>
      </div>
    )
  }

  const copiarValor = async () => {
    try {
      await navigator.clipboard.writeText(resultado.preco.toFixed(2))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const exportarPDF = () => {
    const data = new Date().toLocaleDateString('pt-BR')
    const hora = new Date().toLocaleTimeString('pt-BR')
    
    const conteudo = `
=====================================
    SIMULAÇÃO DE PRECIFICAÇÃO
=====================================

Data: ${data} às ${hora}

--- ENTRADA ---
Valor desejado (líquido): ${formatarMoeda(resultado.valorDesejado)}
Imposto configurado: ${formatarPorcentagem(config.imposto)}
Forma de pagamento: ${resultado.formaPagamento === 'pix' ? 'PIX' : resultado.formaPagamento === 'boleto' ? 'Boleto' : `Cartão ${resultado.parcelas}x`}

--- TAXAS APLICADAS ---
Taxa fixa: ${formatarMoeda(resultado.taxaFixa)}
${resultado.taxaPercentual ? `Taxa do cartão: ${formatarPorcentagem(resultado.taxaPercentual)}` : ''}
${resultado.taxaAntecipacao ? `Taxa antecipação: ${formatarPorcentagem(resultado.taxaAntecipacao)}` : ''}
Imposto: ${formatarMoeda(resultado.valorImposto)}

--- RESULTADO ---
VALOR A COBRAR: ${formatarMoeda(resultado.preco)}
Valor líquido final: ${formatarMoeda(resultado.valorLiquido)}

=====================================
Gerado por Calculadora de Precificação
=====================================
`
    
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `simulacao-${data.replace(/\//g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isPix = resultado.formaPagamento === 'pix'
  const isBoleto = resultado.formaPagamento === 'boleto'
  const isCartao = resultado.formaPagamento === 'cartao'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Valor a cobrar do cliente</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl sm:text-4xl font-bold">
            {formatarMoeda(resultado.preco)}
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

      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign size={18} className="text-gray-400" />
            <span className="text-sm">Valor desejado</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatarMoeda(resultado.valorDesejado)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Receipt size={18} className="text-orange-400" />
            <span className="text-sm">Imposto ({formatarPorcentagem(config.imposto)})</span>
          </div>
          <span className="font-medium text-orange-600">
            - {formatarMoeda(resultado.valorImposto)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard size={18} className="text-purple-400" />
            <span className="text-sm">
              Taxa fixa ({isPix ? 'PIX' : isBoleto ? 'Boleto' : 'Cartão'})
            </span>
          </div>
          <span className="font-medium text-purple-600">
            - {formatarMoeda(resultado.taxaFixa)}
          </span>
        </div>

        {isCartao && resultado.taxaPercentual > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCard size={18} className="text-red-400" />
              <span className="text-sm">
                Taxa cartão ({formatarPorcentagem(resultado.taxaPercentual)} + R$ 0,49)
              </span>
            </div>
            <span className="font-medium text-red-600">
              - {formatarMoeda(resultado.taxaCartaoValor)}
            </span>
          </div>
        )}

        {resultado.taxaAntecipacao > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Zap size={18} className="text-yellow-500" />
              <span className="text-sm">
                Antecipação ({formatarPorcentagem(resultado.taxaAntecipacao)})
              </span>
            </div>
            <span className="font-medium text-yellow-600">
              - {formatarMoeda(resultado.taxaAntecipacaoValor)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between py-3 bg-green-50 -mx-4 sm:-mx-6 px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-2 text-green-700">
            <Check size={20} className="text-green-600" />
            <span className="font-medium">Valor líquido final</span>
          </div>
          <span className="text-lg font-bold text-green-700">
            {formatarMoeda(resultado.valorLiquido)}
          </span>
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
          Exportar Simulação
        </button>
      </div>

      {isPix && (
        <div className="bg-green-50 border-t border-green-100 px-4 sm:px-6 py-3">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <Zap size={16} />
            PIX é mais barato — sem taxa percentual!
          </p>
        </div>
      )}
    </div>
  )
}

export default ResultadoDetalhado
