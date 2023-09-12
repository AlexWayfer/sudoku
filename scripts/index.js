import Field from './field.js'

document.addEventListener('DOMContentLoaded', _event => {
	const
		fieldElement = document.querySelector('table.field')

	const field = new Field(3, fieldElement)

	field.fill()
})
