import { useState } from 'react'
import { Plus, Trash2, Zap, FileText, CreditCard, ArrowRight } from 'lucide-react'
import { FORMAS_PAGAMENTO } from '../constants/taxas'

const icones = {
  pix: Zap,
  boleto: FileText,
  cartao: CreditCard,
}

const cores = {
  pix: 'border-green-400 bg-green-50',
  boleto: 'border-yellow-400 bg-yellow-50',
  cartao: 'border-blue-400 bg-blue-50',
}

const SeletorMultiFormas = ({ formas, onChange }) => {
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false)

  const adicionarForma = (formaId) => {
    if (formas.some(f => f.tipo === formaId)) {
      setMostrarOpcoes(false)
      return
    }
    
    onChange([...formas, { tipo: formaId, valor: 0 }])
    setMostrarOpcoes(false)
  }

  const removerForma = (formaId) => {
    onChange(formas.filter(f => f.tipo !== formaId))
  }

  const atualizarValor = (formaId, valor) => {
    onChange(formas.map(f => 
      f.tipo === formaId ? { ...f, valor } : f
    ))
  }

  const formasDisponiveis = FORMAS_PAGAMENTO.filter(
    f => !formas.some(forma => forma.tipo === f.id)
  )

  const total = formas.reduce((acc, f) => acc + f.valor, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Valor por forma de pagamento
        </span>
        <span className="text-sm text-gray-500">
          Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {formas.map((forma) => {
        const Icone = icones[forma.tipo]
        const infoForma = FORMAS_PAGAMENTO.find(f => f.id === forma.tipo)
        
        return (
          <div key={forma.tipo} className={`border-2 rounded-lg p-3 ${cores[forma.tipo]}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icone size={18} />
              <span className="font-medium text-sm">{infoForma.nome}</span>
              <button
                onClick={() => removerForma(forma.tipo)}
                className="ml-auto p-1 hover:bg-white/50 rounded"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                R$
              </span>
              <input
                type="text"
                value={forma.valor > 0 ? forma.valor.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  const valor = raw ? parseInt(raw) / 100 : 0
                  atualizarValor(forma.tipo, valor)
                }}
                placeholder="0,00"
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )
      })}

      {mostrarOpcoes && formasDisponiveis.length > 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Adicionar forma de pagamento:</p>
          <div className="flex flex-wrap gap-2">
            {formasDisponiveis.map((forma) => {
              const Icone = icones[forma.id]
              return (
                <button
                  key={forma.id}
                  onClick={() => adicionarForma(forma.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 
                             rounded-full text-sm hover:border-blue-400 transition-colors"
                >
                  <Icone size={14} />
                  {forma.nome}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!mostrarOpcoes && formasDisponiveis.length > 0 && (
        <button
          onClick={() => setMostrarOpcoes(true)}
          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed 
                     border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 
                     hover:text-blue-600 transition-colors"
        >
          <Plus size={16} />
          Adicionar outra forma de pagamento
        </button>
      )}

      {formas.length > 0 && total > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
          <ArrowRight size={16} />
          <span>Valor total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      )}
    </div>
  )
}

export default SeletorMultiFormas
