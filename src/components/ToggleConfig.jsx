const ToggleConfig = ({ 
  checked, 
  onChange, 
  label, 
  description,
  disabled = false 
}) => {
  return (
    <label className={`
      flex items-start gap-3 cursor-pointer group
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 rounded-full transition-all duration-200
          ${disabled 
            ? 'bg-gray-200' 
            : 'bg-gray-300 group-hover:bg-gray-400'
          }
          peer-checked:bg-blue-600 peer-checked:group-hover:bg-blue-700
        `} />
        <div className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
          transition-all duration-200
          peer-checked:translate-x-5
        `} />
      </div>
      <div className="flex-1">
        <span className={`
          text-sm font-medium
          ${disabled ? 'text-gray-400' : 'text-gray-700'}
        `}>
          {label}
        </span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}

export default ToggleConfig
