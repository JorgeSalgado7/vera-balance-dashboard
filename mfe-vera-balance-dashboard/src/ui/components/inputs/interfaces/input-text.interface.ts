export interface InputTextI {
  disabled?: boolean
  autoComplete?: string
  value: string
  setValue: (value: string) => void
	label: string
	placeholder?: string
	hasError: boolean
	errorMessage: string
}
