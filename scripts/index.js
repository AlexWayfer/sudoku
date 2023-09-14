import Field from './field.js'

document.addEventListener('DOMContentLoaded', _event => {
	const field = new Field(3, document.querySelector('.field'))

	field.fill()

	field.element.classList.remove('transparent')
	document.querySelector('body > .links').classList.remove('transparent')

	document.querySelector('.controls .new-game').addEventListener('click', _event => {
		if (confirm('Do you want to reset this game and start a new one?')) {
			field.clear()
			field.fill()
		}
	})
})

window.addEventListener('beforeunload', event => {
	event.preventDefault()

	return event.returnValue = 'The current game will be lost. Are you sure?'
}, { capture: true })
