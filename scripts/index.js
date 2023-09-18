import Field from './field.js'

document.addEventListener('DOMContentLoaded', _event => {
	const field = new Field(3, document.querySelector('.field'))

	field.fill()

	document.querySelector('.loading').classList.add('hidden')
	field.element.classList.remove('transparent')
	document.querySelector('body > .links').classList.remove('transparent')

	document.querySelector('.controls .new-game').addEventListener('click', _event => {
		if (confirm('Do you want to reset this game and start a new one?')) {
			field.clear()
			field.fill()
		}
	})

	document.querySelector('.controls .restart').addEventListener('click', _event => {
		if (confirm('Do you want to restart this game?')) {
			field.reset()
		}
	})

	document.addEventListener('keydown', event => {
		// console.debug(`field keydown, key = ${event.key}`)

		switch (event.key) {
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				const selectedCell = field.getSelectedCell()
				if (selectedCell) selectedCell.value = event.key
				break;
			case 'w':
			case 'ArrowUp':
				field.moveSelection(-1, 0)
				break;
			case 'a':
			case 'ArrowLeft':
				field.moveSelection(0, -1)
				break;
			case 's':
			case 'ArrowDown':
				field.moveSelection(1, 0)
				break;
			case 'd':
			case 'ArrowRight':
				field.moveSelection(0, 1)
				break;
		}
	})
})

window.addEventListener('beforeunload', event => {
	event.preventDefault()

	return event.returnValue = 'The current game will be lost. Are you sure?'
}, { capture: true })
