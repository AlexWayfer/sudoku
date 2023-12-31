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

		this.element.cell = this

		this.element.addEventListener('ontouchstart' in window ? 'touchstart' : 'mousedown', _event => {
			// console.debug('_event = ', _event)

			this.square.field.pressingCell = this
			this.#pressEvent()
		})

		if ('ontouchstart' in window) {
			this.element.addEventListener('touchmove', event => {
				// console.debug('event = ', event)

				event.preventDefault()

				const
					elementFromPoint = document.elementFromPoint(
						event.changedTouches[0].clientX, event.changedTouches[0].clientY
					),
					targetCellElement = elementFromPoint.closest('.field table td'),
					targetCell = targetCellElement?.cell

				// console.debug('targetElement = ', targetCellElement)
				// console.debug('targetCell = ', targetCell)
				// console.debug('this.square.field.pressingCell = ', this.square.field.pressingCell)

				if (
					!targetCell ||
						!this.square.field.pressingCell ||
						this.square.field.pressingCell == targetCell
				) {
					return
				}

				this.square.field.pressingCell = targetCell
				targetCell.#pressEvent()
			})
		} else {
			this.element.addEventListener('mousemove', _event => {
				// console.debug('_event = ', _event)

				if (!this.square.field.pressingCell || this.square.field.pressingCell == this) return

				this.square.field.pressingCell = this
				this.#pressEvent()
			})
		}

		this.valueElement = this.element.querySelector('.value')

		this.notes = {}
	}

	get value() {
		return this.#value
	}

	set value(newValue) {
		const oldValue = this.#value

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

			if (newValue) this.square.field.checkNumberCompletion(newValue)
			if (oldValue) this.square.field.checkNumberCompletion(oldValue)

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

		const notesByCells = new Map()

		notesByCells.set(this, Object.keys(this.notes))

		for (const noteValue in this.notes) {
			this.toggleNote(noteValue)
		}

		if (this.square.field.settings.clearNotesAfterValue) {
			const takenCells = this.#getTakenCells()

			takenCells.forEach(takenCell => {
				if (takenCell.notes[newValue]) {
					takenCell.toggleNote(newValue)
					notesByCells.set(takenCell, [newValue])
				}
			})
		}

		this.value = newValue

		this.square.field.historyPush({
			action: 'setValue', cell: this, oldValue, newValue, notesByCells
		})
	}

	toggleNote(value) {
		if (this.notes[value]) {
			this.notes[value].remove()
			delete this.notes[value]
		} else {
			if (this.isPreFilled) {
				alert("You can't place notes for pre-filled cells.")
				return
			}

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

	input(value) {
		if (this.square.field.isNotesMode) {
			this.toggleNoteWithHistory(value)
		} else {
			this.setValueWithHistory(value)
		}
		this.square.field.playSoundEffect('click')
	}

	getTakenValues() {
		return this.#getTakenCells().map(cell => cell.value)
	}

	fill() {
		this.isFilled = true
		if (this.value) this.element.classList.add('pre-filled')
		this.valueElement.innerText = this.value
	}

	reset() {
		this.element.classList.remove('selected')
		this.valueElement.classList.remove('mistake')
		if (!this.isPreFilled) {
			this.value = null
			this.#clearNotes()
		}
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

		this.#clearNotes()
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

	#clearNotes() {
		for (const noteValue in this.notes) {
			this.notes[noteValue].remove()
		}
		this.notes = {}
	}

	#pressEvent() {
		this.square.field.selectedCell = this

		if (!this.square.field.settings.fastMode) return

		const selectedNumberButton = this.square.field.selectedNumberButton

		if (!selectedNumberButton) return

		this.input(this.square.field.selectedNumberButton.value)
	}

	#getTakenCells() {
		return [
			...this.#getTakenSquareCells(),
			...this.#getTakenRowCells(),
			...this.#getTakenColumnCells()
		]
	}

	#getTakenSquareCells() {
		return this.square.cells.flat().filter(cell => cell != this)
	}

	#getTakenRowCells() {
		return this.square.field.squares[this.square.row].flatMap(
			square => square.cells[this.row].filter(cell => cell != this)
		)
	}

	#getTakenColumnCells() {
		return this.square.field.squares.map(rowSquares => rowSquares[this.square.column])
			.flatMap(
				square => square.cells.map(rowCells => rowCells[this.column]).filter(cell => cell != this)
			)
	}
}
