export default class Cell {
	#value = null

	constructor(square, row, column) {
		this.square = square
		this.row = row
		this.column = column

		this.rowIndex = this.square.row * this.square.size + row
		this.columnIndex = this.square.column * this.square.size + column

		this.isFilled = false

		this.element = this.square.field.tableElement.querySelector(
			`tr:nth-child(${this.rowIndex + 1}) td:nth-child(${this.columnIndex + 1})`
		)

		this.element.addEventListener('click', _event => {
			this.square.field.selectedCell = this
		})
	}

	get value() {
		return this.#value
	}

	set value(newValue) {
		if (this.isPreFilled) {
			alert("You can't change pre-filled cells.")
			return
		}

		this.#value = newValue

		if (this.isFilled) {
			//// Probably we should rely on initially generated schema here

			const
				takenValues = this.getTakenValues(),
				//// `some` is for String and Integer comparison
				isMistake = takenValues.some(takenValue => takenValue == newValue)

			// console.debug('takenValues = ', takenValues)
			// console.debug('newValue = ', newValue)
			// console.debug(
			// 	'takenValues.some(takenValue => takenValue == newValue) = ',
			// 	takenValues.some(takenValue => takenValue == newValue)
			// )

			this.element.classList.toggle('mistake', isMistake)

			this.element.innerText = newValue

			if (!isMistake) this.square.field.checkCompletion()
		}
	}

	getTakenValues() {
		const
			squareValues =
				this.square.cells.flat().map(cell => {
					if (cell != this) return cell.value
				}),
			rowSquares = this.square.field.squares[this.square.row],
			rowValues =
				rowSquares.flatMap(square => {
					return square.cells[this.row].map(cell => {
						if (cell != this) return cell.value
					})
				}),
			columnSquares = this.square.field.squares.map(rowSquares => rowSquares[this.square.column]),
			columnValues =
				columnSquares.flatMap(square => {
					return square.cells.map(rowCells => {
						const cell = rowCells[this.column]
						if (cell != this) return cell.value
					})
				})

		// console.debug('squareValues = ', squareValues)
		// console.debug('rowValues = ', rowValues)
		// console.debug('columnValues = ', columnValues)

		return [...squareValues, ...rowValues, ...columnValues]
	}

	fill() {
		this.isFilled = true
		if (this.value) this.element.classList.add('pre-filled')
		this.element.innerText = this.value
	}

	reset() {
		this.element.classList.remove('selected')
		this.element.classList.remove('mistake')
		if (!this.isPreFilled) this.value = null
	}

	erase() {
		if (this.isPreFilled) {
			alert("You can't erase pre-filled cells.")
			return
		}

		this.element.classList.remove('mistake')
		this.value = null
	}

	clear() {
		this.isFilled = false
		this.element.classList.remove('pre-filled')
		this.value = null
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
