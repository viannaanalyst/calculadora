import { useState, useRef, useEffect } from 'react'

const InputMonetario = ({ value, onChange, label, placeholder = '0,00' }) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (value === 0 && inputValue === '') {
      return
    }
    
    if (value > 0 && inputValue === '') {
      setInputValue(formatToDisplay(value))
    }
  }, [value])

  const formatToDisplay = (num) => {
    if (!num || num === 0) return ''
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e) => {
    let raw = e.target.value
    
    raw = raw.replace(/\D/g, '')
    
    if (raw === '') {
      setInputValue('')
      onChange(0)
      return
    }
    
    const cents = parseInt(raw, 10)
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    
    setInputValue(formatted)
    onChange(cents / 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && inputValue === '') {
      e.preventDefault()
    }
  }

  const handleFocus = () => {
    if (value > 0) {
      const raw = Math.round(value * 100).toString()
      setInputValue(raw)
    }
  }

  const handleBlur = () => {
    if (value > 0) {
      setInputValue(formatToDisplay(value))
    } else {
      setInputValue('')
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
          R$
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-600 focus:border-transparent
                     transition-all duration-200 outline-none
                     hover:border-gray-400
                     text-gray-900 font-medium"
        />
      </div>
    </div>
  )
}

export default InputMonetario
