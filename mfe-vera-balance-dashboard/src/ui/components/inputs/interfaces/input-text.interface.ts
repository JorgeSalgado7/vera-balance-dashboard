export interface InputTextI {
  value: string
  setValue: (value: string) => void
	label: string
	placeholder?: string
	hasError: boolean
	errorMessage: string
}
