export default class NumberButton {
	constructor(field, value) {
		this.field = field
		this.value = value

		this.element = document.createElement('button')

		this.element.innerText = this.value

		this.element.addEventListener('click', _event => {
			const selectedCell = this.field.getSelectedCell()

			if (selectedCell) {
				if (this.field.isNotesMode) {
					selectedCell.toggleNoteWithHistory(this.value)
				} else {
					selectedCell.setValueWithHistory(this.value)
				}
				this.field.playSoundEffect('click')
			} else {
				alert('First — select a cell, then press a button with number.')
			}
		})
	}

	toggleCompletion(value) {
		this.element.classList.toggle('completed', value)
	}
}
