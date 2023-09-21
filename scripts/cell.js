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

		this.valueElement = this.element.querySelector('.value')

		this.notes = {}
	}

	get value() {
		return this.#value
	}

	set value(newValue) {
		this.#value = newValue

		if (this.isFilled) {
			//// Probably we should rely on initially generated schema here

			const
				takenValues = this.getTakenValues(),
				//// `some` is for String and Integer comparison
				isMistake = newValue && takenValues.some(takenValue => takenValue == newValue)

			// console.debug('takenValues = ', takenValues)
			// console.debug('newValue = ', newValue)
			// console.debug(
			// 	'takenValues.some(takenValue => takenValue == newValue) = ',
			// 	takenValues.some(takenValue => takenValue == newValue)
			// )

			this.valueElement.classList.toggle('mistake', isMistake)

			this.square.field.eraseButtonElement.disabled = !newValue

			this.valueElement.innerText = newValue

			if (!isMistake) this.square.field.checkCompletion()
		}
	}

	setValueWithHistory(newValue) {
		if (this.isPreFilled) {
			alert("You can't change pre-filled cells.")
			return
		}

		const oldValue = this.value

		if (oldValue == newValue) return

		const notesValues = Object.keys(this.notes)

		for (const noteValue in this.notes) {
			this.toggleNote(noteValue)
		}

		this.value = newValue

		this.square.field.historyPush({
			action: 'setValue', cell: this, oldValue, newValue, notesValues
		})
	}

	toggleNote(value) {
		if (this.notes[value]) {
			this.notes[value].remove()
			delete this.notes[value]
		} else {
			const noteElement = document.createElement('span')

			noteElement.classList.add('note')

			const cssSize = `calc(100% / ${this.square.size})`

			noteElement.style.top = `calc(${Math.floor((value - 1) / this.square.size)} * ${cssSize})`
			noteElement.style.left = `calc(${(value - 1) % this.square.size} * ${cssSize})`
			noteElement.style.width = cssSize
			noteElement.style.height = cssSize

			noteElement.innerText = value

			this.element.append(noteElement)

			this.notes[value] = noteElement
		}
	}

	toggleNotes(values) {
		values.forEach(value => this.toggleNote(value))
	}

	toggleNoteWithHistory(value) {
		this.toggleNote(value)

		this.square.field.historyPush({ action: 'toggleNote', cell: this, value })
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
		this.valueElement.innerText = this.value
	}

	reset() {
		this.element.classList.remove('selected')
		this.valueElement.classList.remove('mistake')
		if (!this.isPreFilled) this.value = null
	}

	erase() {
		if (this.isPreFilled) {
			alert("You can't erase pre-filled cells.")
			return
		}

		if (!this.value) return

		this.valueElement.classList.remove('mistake')
		this.setValueWithHistory(null)
	}

	clear() {
		this.isFilled = false
		this.element.classList.remove('pre-filled')
		this.valueElement.classList.remove('mistake')
		this.element.classList.remove('selected')
		this.value = null
		this.valueElement.innerText = null
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
