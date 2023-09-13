import Field from './field.js'

document.addEventListener('DOMContentLoaded', _event => {
	const field = new Field(3, document.querySelector('.field'))

	field.fill()

	document.querySelector('.controls .new-game').addEventListener('click', _event => {
		field.clear()
		field.fill()
	})
})
