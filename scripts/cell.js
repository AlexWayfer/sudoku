export default class Cell {
	#value = null

	constructor(square, row, column) {
		this.isFilled = false

		const
			rowIndex = square.row * square.size + row,
			columnIndex = square.column * square.size + column

		this.element = square.field.tableElement.querySelector(
			`tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`
		)

		this.element.addEventListener('click', _event => {
			square.field.selectedCell = this
		})
	}

	get value() {
		return this.#value
	}

	set value(newValue) {
		this.#value = newValue
		if (this.isFilled) this.element.innerText = newValue
	}

	fill() {
		this.isFilled = true
		if (this.value) this.element.classList.add('pre-filled')
		this.element.innerText = this.value
	}

	clear() {
		this.isFilled = false
		this.value = null
		this.element.classList.remove('pre-filled')
		this.element.innerText = null
	}

	get isPreFilled() {
		return this.element.classList.contains('pre-filled')
	}

	get isSelected() {
		return this.element.classList.contains('selected')
	}

	select() {
		this.element.classList.add('selected')
	}

	unselect() {
		this.element.classList.remove('selected')
	}
}
