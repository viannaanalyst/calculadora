import { useState, useEffect, useCallback } from 'react'
import { Calculator, Settings, Info, SplitSquareHorizontal } from 'lucide-react'
import InputMonetario from './components/InputMonetario'
import SeletorFormaPagamento from './components/SeletorFormaPagamento'
import SeletorParcelas from './components/SeletorParcelas'
import ToggleConfig from './components/ToggleConfig'
import ResultadoDetalhado from './components/ResultadoDetalhado'
import SeletorMultiFormas from './components/SeletorMultiFormas'
import ResultadoMultiFormas from './components/ResultadoMultiFormas'
import { calcularPrecoFinal } from './utils/calculos'
import { calcularMultiFormas } from './utils/calculosMulti'
import { IMPOSTO_PADRAO } from './constants/taxas'

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

function App() {
  const [modoMultiFormas, setModoMultiFormas] = useState(false)
  const [valorDesejado, setValorDesejado] = useState(0)
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [parcelas, setParcelas] = useState(1)
  const [config, setConfig] = useState(getConfigInicial)
  const [resultado, setResultado] = useState(null)
  const [multiFormas, setMultiFormas] = useState([])
  const [resultadosMulti, setResultadosMulti] = useState([])

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
    if (modoMultiFormas) {
      if (multiFormas.length > 0 && multiFormas.some(f => f.valor > 0)) {
        const resultados = calcularMultiFormas({
          formas: multiFormas,
          imposto: config.imposto,
          usarTaxaPromocional: config.usarTaxaPromocional,
          usarAntecipacao: config.usarAntecipacao,
          usarAntecipacaoAutomatica: config.usarAntecipacaoAutomatica,
        })
        setResultadosMulti(resultados.filter(r => r.preco > 0))
      } else {
        setResultadosMulti([])
      }
    } else {
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
    }
  }, [valorDesejado, formaPagamento, parcelas, config, modoMultiFormas, multiFormas])

  const isCartao = formaPagamento === 'cartao'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calculator className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Calculadora de Precificação
                </h1>
                <p className="text-sm text-gray-500">
                  Calcule quanto cobrar considerando taxas do Asaas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 p-1 bg-gray-100 rounded-xl sm:w-fit">
            <button
              onClick={() => setModoMultiFormas(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                !modoMultiFormas
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info size={18} />
              Forma Única
            </button>
            <button
              onClick={() => setModoMultiFormas(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                modoMultiFormas
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SplitSquareHorizontal size={18} />
              Múltiplas Formas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            {!modoMultiFormas ? (
              <>
                <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info size={20} className="text-blue-600" />
                    Quanto você quer receber?
                  </h2>
                  
                  <InputMonetario
                    value={valorDesejado}
                    onChange={setValorDesejado}
                    label="Valor líquido desejado"
                    placeholder="R$ 0,00"
                  />
                </section>

                <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Forma de Pagamento
                  </h2>
                  
                  <SeletorFormaPagamento
                    value={formaPagamento}
                    onChange={setFormaPagamento}
                  />
                  
                  <div className="mt-4">
                    <SeletorParcelas
                      value={parcelas}
                      onChange={setParcelas}
                      visible={isCartao}
                    />
                  </div>
                </section>
              </>
            ) : (
              <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <SplitSquareHorizontal size={20} className="text-blue-600" />
                  Distribuir entre formas de pagamento
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Informe quanto o cliente pagará em cada forma de pagamento
                </p>
                
                <SeletorMultiFormas
                  formas={multiFormas}
                  onChange={setMultiFormas}
                />
              </section>
            )}

            <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings size={20} className="text-gray-400" />
                Configurações
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imposto (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.imposto}
                    onChange={(e) => atualizarConfig({ imposto: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-blue-600 focus:border-transparent
                               transition-all duration-200 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Impostos sobre o faturamento (ex: ISS, PIS, COFINS)
                  </p>
                </div>

                {formaPagamento === 'pix' && !modoMultiFormas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa fixa PIX (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={config.taxaFixaPix}
                      onChange={(e) => atualizarConfig({ taxaFixaPix: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-blue-600 focus:border-transparent
                                 transition-all duration-200 outline-none"
                    />
                  </div>
                )}

                {isCartao && !modoMultiFormas && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <ToggleConfig
                      checked={config.usarTaxaPromocional}
                      onChange={(v) => atualizarConfig({ usarTaxaPromocional: v })}
                      label="Usar taxas promocionais"
                      description="Menores taxas para cartão (1x: 1,99% | 2-6x: 2,49% | 7-12x: 2,99%)"
                    />

                    <ToggleConfig
                      checked={config.usarAntecipacao}
                      onChange={(v) => atualizarConfig({ usarAntecipacao: v })}
                      label="Antecipar recebimento"
                      description="Receber antes do prazo padrão de liquidação"
                    />

                    {config.usarAntecipacao && (
                      <div className="ml-8 animate-fadeIn">
                        <ToggleConfig
                          checked={config.usarAntecipacaoAutomatica}
                          onChange={(v) => atualizarConfig({ usarAntecipacaoAutomatica: v })}
                          label="Antecipação automática (taxa reduzida)"
                          description="Taxa menor: 1,6% parcelado / 1,15% à vista"
                        />
                      </div>
                    )}
                  </div>
                )}

                {modoMultiFormas && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <ToggleConfig
                      checked={config.usarTaxaPromocional}
                      onChange={(v) => atualizarConfig({ usarTaxaPromocional: v })}
                      label="Usar taxas promocionais"
                      description="Aplica taxas promocionais para cartão de crédito"
                    />

                    <ToggleConfig
                      checked={config.usarAntecipacao}
                      onChange={(v) => atualizarConfig({ usarAntecipacao: v })}
                      label="Antecipar recebimento"
                      description="Considerar taxa de antecipação para cartão"
                    />

                    {config.usarAntecipacao && (
                      <div className="ml-8 animate-fadeIn">
                        <ToggleConfig
                          checked={config.usarAntecipacaoAutomatica}
                          onChange={(v) => atualizarConfig({ usarAntecipacaoAutomatica: v })}
                          label="Antecipação automática (taxa reduzida)"
                          description="Taxa menor: 1,6% parcelado / 1,15% à vista"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resultado
            </h2>
            {!modoMultiFormas ? (
              <ResultadoDetalhado resultado={resultado} config={config} />
            ) : (
              <ResultadoMultiFormas resultados={resultadosMulti} config={config} />
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>
          Cálculos baseados nas taxas do Asaas. Valores sujeitos a alterações.
        </p>
      </footer>
    </div>
  )
}

export default App
