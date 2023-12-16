export default class NumberButton {
	#completed = false
	#selected = false

	constructor(field, value) {
		this.field = field
		this.value = value

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

	get completed() {
		return this.#completed
	}

	set completed(newValue) {
		this.#completed = newValue
		this.element.classList.toggle('completed', newValue)

		if (newValue && this.selected) this.selected = false
	}

	get selected() {
		return this.#selected
	}

	set selected(newValue) {
		this.#selected = newValue
		this.element.classList.toggle('selected', newValue)
	}
}
