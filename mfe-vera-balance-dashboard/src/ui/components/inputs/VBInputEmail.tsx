import { useId } from 'react'
import { Input } from 'antd'
import type { InputTextI } from './interfaces/input-text.interface'

export const VBInputEmail = ({ label, placeholder, hasError, errorMessage, value, setValue, disabled, autoComplete }: InputTextI) => {
  const id = useId()

  return (
    <div className="vb-input">
      <label className="vb-input__label" htmlFor={id}>{label}</label>
      <Input
        id={id}
        className="vb-input__input"
        type="email"
        autoComplete={autoComplete ?? 'email'}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={event => setValue(event.target.value)}
        status={hasError ? 'error' : undefined}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && (
        <strong id={`${id}-error`} className="vb-input__error-message" role="alert">
          {errorMessage}
        </strong>
      )}
    </div>
  )
}
