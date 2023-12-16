export default class NumberButton {
	constructor(field, value) {
		this.field = field
		this.value = value

		this.completed = false
		this.selected = false

		this.element = document.createElement('button')

		this.element.innerText = this.value

		this.element.addEventListener('click', _event => {
			if (this.field.settings.fastMode) {
				this.field.selectedNumberButton = this
			} else {
				const selectedCell = this.field.getSelectedCell()

				if (selectedCell) {
					selectedCell.input(this.value)
				} else {
					alert('First — select a cell, then press a button with number.')
				}
			}
		})
	}

	toggleCompletion(value) {
		this.completed = value
		this.element.classList.toggle('completed', value)

		if (value && this.selected) this.toggleSelection(false)
	}

	toggleSelection(value) {
		this.selected = value
		this.element.classList.toggle('selected', value)
	}
}
