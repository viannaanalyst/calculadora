import { Zap, FileText, CreditCard } from 'lucide-react'
import { FORMAS_PAGAMENTO } from '../constants/taxas'

const icones = {
  zap: Zap,
  'file-text': FileText,
  'credit-card': CreditCard,
}

const coresClasses = {
  green: 'bg-green-50 border-green-500 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-500 text-yellow-700',
  blue: 'bg-blue-50 border-blue-500 text-blue-700',
}

const coresInativas = {
  green: 'hover:bg-green-50 hover:border-green-300',
  yellow: 'hover:bg-yellow-50 hover:border-yellow-300',
  blue: 'hover:bg-blue-50 hover:border-blue-300',
}

const SeletorFormaPagamento = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Forma de Pagamento
      </label>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {FORMAS_PAGAMENTO.map((forma) => {
          const IconeComponent = icones[forma.icone]
          const isSelected = value === forma.id
          
          return (
            <button
              key={forma.id}
              onClick={() => onChange(forma.id)}
              className={`
                flex flex-col items-center justify-center p-3 sm:p-4
                border-2 rounded-lg transition-all duration-200
                ${isSelected 
                  ? coresClasses[forma.cor]
                  : `border-gray-200 ${coresInativas[forma.cor]}`
                }
              `}
            >
              <IconeComponent 
                size={24} 
                className={isSelected ? '' : 'text-gray-400'}
              />
              <span className={`mt-2 text-xs sm:text-sm font-medium
                ${isSelected ? '' : 'text-gray-600'}`}>
                {forma.nome}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SeletorFormaPagamento
