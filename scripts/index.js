import Field from './field.js'

document.addEventListener('DOMContentLoaded', _event => {
	const field = new Field(3, document.querySelector('.field'))

	field.fill()

	document.addEventListener('keydown', event => {
		// console.debug(`document keydown, key = ${event.key}, event = `, event)

		const selectedCell = field.getSelectedCell()

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
				if (selectedCell) {
					if (field.isNotesMode) {
						selectedCell.toggleNoteWithHistory(event.key)
					} else {
						selectedCell.setValueWithHistory(event.key)
					}
				}
				break
			case 'w':
			case 'ArrowUp':
				field.moveSelection(-1, 0)
				break
			case 'a':
			case 'ArrowLeft':
				field.moveSelection(0, -1)
				break
			case 's':
			case 'ArrowDown':
				field.moveSelection(1, 0)
				break
			case 'd':
			case 'ArrowRight':
				field.moveSelection(0, 1)
				break
			case 'Delete':
			case 'Backspace':
				selectedCell?.erase()
				break
			case 'n':
				field.toggleNotesMode()
				break
			case 'z':
				if (event.ctrlKey && !event.shiftKey) {
					field.undo()
				}
				break
			case 'Z':
				if (event.ctrlKey && event.shiftKey) {
					field.redo()
				}
				break
			case 'y':
				if (event.ctrlKey) {
					field.redo()
				}
				break
		}
	})
})

window.addEventListener('beforeunload', event => {
	event.preventDefault()

	return event.returnValue = 'The current game will be lost. Are you sure?'
}, { capture: true })
