import { Input } from 'antd';
import type { InputTextI } from './interfaces/input-text.interface';

export const VBInputText = ({ label, placeholder, hasError, errorMessage, value, setValue }: InputTextI) => {
	return (
		<div className='vb-input'>
			<label
			className='vb-input__label'
				htmlFor={label}
			>
				{label}
			</label>


			<Input
				className='vb-input__input'
				placeholder={placeholder}
				status={`${hasError ? 'error' : ''}`}
				value={value}
				onChange={e => setValue(e.target.value)}
			/>

			{ 
				hasError && 
				<strong className='vb-input__error-message'>
					{errorMessage}
				</strong>
			}

		</div>
	)
}
