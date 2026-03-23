import { PARCELAS } from '../constants/taxas'

const SeletorParcelas = ({ value, onChange, visible }) => {
  if (!visible) return null

  return (
    <div className="w-full animate-fadeIn">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Parcelas
      </label>
      <div className="grid grid-cols-7 sm:grid-cols-7 gap-1">
        {PARCELAS.map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              py-2 px-3 rounded-lg border-2 transition-all duration-200
              text-sm font-medium
              ${value === num
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 hover:border-blue-300 text-gray-700'
              }
            `}
          >
            {num}x
          </button>
        ))}
      </div>
    </div>
  )
}

export default SeletorParcelas
