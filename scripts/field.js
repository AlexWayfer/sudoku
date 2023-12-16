import { Square, SquareGenerateError } from './square.js'
import Settings from './settings.js'
import NumberButton from './number-button.js'

export default class Field {
	constructor(squareSize, element) {
		this.squareSize = squareSize
		this.element = element

		this.width = this.squareSize
		this.height = this.squareSize

		this.rowSize = this.squareSize * this.width
		this.columnSize = this.squareSize * this.height

		//// Table

		const rowElements = (new Array(this.columnSize)).fill(null).map(_element => {
			const rowElement = document.createElement('tr')

			const cellElements = (new Array(this.rowSize)).fill(null).map(_element => {
				const
					cellElement = document.createElement('td'),
					cellValueElement = document.createElement('span')

				cellValueElement.classList.add('value')

				cellElement.append(cellValueElement)

				return cellElement
			})

			rowElement.append(...cellElements)

			return rowElement
		})

		this.tableElement = this.element.querySelector('table')

		this.tableElement.append(...rowElements)

		this.squares = []

		for (let rowIndex = 0; rowIndex < this.height; rowIndex++) {
			this.squares[rowIndex] ??= []

			for (let columnIndex = 0; columnIndex < this.width; columnIndex++) {
				// console.debug('this.squares = ', this.squares)

				this.squares[rowIndex][columnIndex] = new Square(this, rowIndex, columnIndex)
			}
		}

		//// Controls

		this.element.querySelector('.controls button.new-game').addEventListener('click', _event => {
			if (confirm('Do you want to reset this game and start a new one?')) {
				this.clear()
				this.fill()
			}
		})

		this.element.querySelector('.controls button.restart').addEventListener('click', _event => {
			if (confirm('Do you want to restart this game?')) {
				this.reset()
			}
		})

		//// Settings overlay

		this.settings = new Settings(this, this.element.querySelector('.overlay.settings'))

		this.element.querySelector('.controls button.settings').addEventListener('click', _event => {
			this.settings.show()
		})

		//// Difficulty setting

		const possibleDifficulties = [30, 40, 50, 60, 70, 80]

		//// Not `includes` for String and Integer compariso
		if (!possibleDifficulties.some(possibleDifficulty => possibleDifficulty == this.difficulty)) {
			this.difficulty = 50
		}

		const
			difficultySelectElement = this.element.querySelector('.controls select.difficulty'),
			difficultyOptionElements = possibleDifficulties.map(possibleDifficulty => {
				const optionElement = document.createElement('option')

				optionElement.value = possibleDifficulty
				optionElement.innerText = `${possibleDifficulty}%`
				if (possibleDifficulty == this.difficulty) optionElement.selected = true

				return optionElement
			})

		difficultySelectElement.replaceChildren(...difficultyOptionElements)

		difficultySelectElement.value = this.difficulty

		difficultySelectElement.addEventListener('change', _event => {
			const difficultyName = difficultySelectElement.selectedOptions[0].innerText

			if (
				confirm(
					`Do you want to reset this game and start a new one with ${difficultyName} difficulty?`
				)
			) {
				this.clear()
				this.difficulty = difficultySelectElement.value
				this.fill()
			} else {
				difficultySelectElement.value = this.difficulty
			}
		})

		//// Number buttons

		this.numberButtons = (new Array(this.rowSize)).fill(null).map((_element, index) => {
			const buttonValue = index + 1

			return new NumberButton(this, buttonValue)
		})

		this.element.querySelector('.buttons').append(
			...this.numberButtons.map(numberButton => numberButton.element)
		)

		//// Actions

		this.undoButtonElement = this.element.querySelector('.actions .undo')

		this.undoButtonElement.addEventListener('click', _event => {
			this.undo()
		})

		this.redoButtonElement = this.element.querySelector('.actions .redo')

		this.redoButtonElement.addEventListener('click', _event => {
			this.redo()
		})

		this.eraseButtonElement = this.element.querySelector('.actions .erase')

		this.eraseButtonElement.addEventListener('click', _event => {
			this.getSelectedCell()?.erase()
			this.history
		})

		this.notesButtonElement = this.element.querySelector('.actions .notes')

		this.notesButtonElement.addEventListener('click', _event => {
			this.toggleNotesMode()
		})

		//// Completed overlay

		this.completedOverlayElement = this.element.querySelector('.overlay.completed')

		this.completedOverlayElement.querySelector('button.new-game')
			.addEventListener('click', _event => {
				this.clear()
				this.fill()
				this.completedOverlayElement.classList.add('hidden')
			})
	}

	get difficulty() {
		return localStorage.getItem('difficulty')
	}

	set difficulty(newValue) {
		localStorage.setItem('difficulty', newValue)
	}

	get isNotesMode() {
		return this.notesButtonElement.classList.contains('enabled')
	}

	toggleNotesMode() {
		this.notesButtonElement.classList.toggle('enabled')
	}

	historyPush(entry) {
		if (this.historyIndex < this.history.length - 1) {
			this.history.splice(this.historyIndex + 1)
		}

		this.history.push(entry)
		this.historyIndex++

		this.undoButtonElement.disabled = false
		this.redoButtonElement.disabled = true

		// console.debug('this.history = ', this.history)
		// console.debug('this.historyIndex = ', this.historyIndex)
	}

	undo() {
		// console.debug('this.history = ', this.history)
		// console.debug('this.historyIndex = ', this.historyIndex)

		const currentChange = this.history[this.historyIndex]

		//// Button should be disabled, but we have key bindings
		if (!currentChange) return

		switch (currentChange.action) {
			case 'setValue':
				this.selectedCell = currentChange.cell
				currentChange.cell.value = currentChange.oldValue
				currentChange.notesByCells.forEach((notes, cell) => {
					cell.toggleNotes(notes)
				})
				break
			case 'toggleNote':
				this.selectedCell = currentChange.cell
				currentChange.cell.toggleNote(currentChange.value)
				break
			default:
				throw `Unexpected action in history: '${currentChange.action}'`
		}

		this.historyIndex--

		this.redoButtonElement.disabled = false

		if (this.historyIndex < 0) this.undoButtonElement.disabled = true
	}

	redo() {
		const currentChange = this.history[this.historyIndex + 1]

		//// Button should be disabled, but we have key bindings
		if (!currentChange) return

		switch (currentChange.action) {
			case 'setValue':
				this.selectedCell = currentChange.cell
				currentChange.cell.value = currentChange.newValue
				currentChange.notesByCells.forEach((notes, cell) => {
					cell.toggleNotes(notes)
				})
				break
			case 'toggleNote':
				this.selectedCell = currentChange.cell
				currentChange.cell.toggleNote(currentChange.value)
				break
			default:
				throw `Unexpected action in history: '${currentChange.action}'`
		}

		this.historyIndex++

		this.undoButtonElement.disabled = false

		if (this.historyIndex + 1 > this.history.length - 1) this.redoButtonElement.disabled = true
	}

	getSelectedCell() {
		let result = null
		for (let square of this.squares.flat()) {
			for (let cell of square.cells.flat()) {
				if (cell.isSelected) {
					result = cell
					break
				}
			}
			if (result) break
		}
		return result
	}

	set selectedCell(newCell) {
		const selectedCell = this.getSelectedCell()

		if (selectedCell) selectedCell.unselect()

		newCell.select()

		this.eraseButtonElement.disabled = newCell.isPreFilled || !newCell.value
	}

	moveSelection(rowDiff, columnDiff) {
		const selectedCell = this.getSelectedCell()

		if (!selectedCell) {
			this.selectedCell = this.squares[0][0].cells[0][0]
			return
		}

		const
			maxRow = this.height * this.squareSize - 1,
			maxColumn = this.width * this.squareSize - 1,
			newRow = Math.min(Math.max(selectedCell.rowIndex + rowDiff, 0), maxRow),
			newColumn = Math.min(Math.max(selectedCell.columnIndex + columnDiff, 0), maxColumn)

		this.selectedCell =
			this.squares[Math.floor(newRow / this.squareSize)][Math.floor(newColumn / this.squareSize)]
				.cells[newRow % this.squareSize][newColumn % this.squareSize]
	}

	playSoundEffect(name) {
		if (!this.settings.playSoundEffects) return

		const audio = new Audio(`sounds/${name}.mp3`)
		audio.play()
	}

	checkNumberCompletion(newValue) {
		// console.debug('newValue = ', newValue)
		// console.debug('typeof newValue = ', typeof newValue)

		if (!this.settings.hideButtonsForCompletedNumbers) return

		this.numberButtons.find(numberButton => numberButton.value == newValue).toggleCompletion(
			this.squares.flat().every(
				square => square.cells.flat().some(cell => cell.value == newValue)
			)
		)
	}

	checkCompletion() {
		if (this.squares.flat().every(square => square.checkCompletion())) {
			this.completedOverlayElement.classList.remove('hidden')
			this.playSoundEffect('completion')
		}
	}

	reset() {
		this.squares.flat().forEach(square => square.reset())

		this.#resetHistory()

		this.eraseButtonElement.disabled = true
	}

	clear() {
		//// It has no time to appear while generating occupies all resources
		// document.querySelector('body > .links').classList.add('transparent')
		// this.element.classList.add('transparent')
		// document.querySelector('.loading').classList.remove('hidden')

		this.squares.flat().forEach(square => square.clear())
	}

	fill() {
		this.#resetHistory()

		this.eraseButtonElement.disabled = true

		this.#generate()

		this.squares.flat().forEach(square => {
			square.cells.flat().forEach(cell => {
				if (Math.random() < (this.difficulty / 100)) {
					cell.value = null
				}
				cell.fill()
			})
		})

		document.querySelector('.loading').classList.add('hidden')
		this.element.classList.remove('transparent')
		document.querySelector('body > .links').classList.remove('transparent')
	}

	#resetHistory() {
		this.history = []
		this.historyIndex = -1

		this.undoButtonElement.disabled = true
		this.redoButtonElement.disabled = true
	}

	#generate() {
		const generatingStart = performance.now()

		this.#generateDiagonalSquares()

		console.debug(`Field generating time is ${performance.now() - generatingStart} ms`)
	}

	#generateDiagonalSquares(attempt = 1) {
		console.debug('generate diagonal squares')

		const squares = [[0, 0], [1, 1], [2, 2]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.generate())

			this.#generateHorizontalSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareGenerateError && attempt < 10) {
				console.debug('regenerate diagonal squares')

				this.#generateDiagonalSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#generateCrossSquares(attempt = 1) {
		console.debug('generate cross squares')

		const squares = [[1, 0], [1, 2], [0, 1], [2, 1]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.generate())

			this.#generateRestSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareGenerateError && attempt < 10) {
				console.debug('regenerate cross squares')

				this.#generateCrossSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#generateHorizontalSquares(attempt = 1) {
		console.debug('generate horizontal squares')

		const squares = [[1, 0], [1, 2]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.generate())

			this.#generateVerticalSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareGenerateError && attempt < 10) {
				console.debug('regenerate horizontal squares')

				this.#generateHorizontalSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#generateVerticalSquares(attempt = 1) {
		console.debug('generate vertical squares')

		const squares = [[0, 1], [2, 1]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.generate())

			this.#generateRestSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareGenerateError && attempt < 10) {
				console.debug('regenerate vertical squares')

				this.#generateVerticalSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#generateRestSquares(attempt = 1) {
		console.debug('generate rest squares')

		const squares = [[0, 2], [2, 0]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.generate())
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareGenerateError && attempt < 10) {
				console.debug('regenerate rest squares')

				this.#generateRestSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#generateAllRestSquares(attempt = 1) {
		console.debug('generate all rest squares')

		const squares =
			[[1, 0], [1, 2], [0, 1], [2, 1], [0, 2], [2, 0]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.generate())
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareGenerateError && attempt < 10) {
				console.debug('regenerate all rest squares')

				this.#generateAllRestSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}
}
