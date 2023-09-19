import { Square, SquareGenerateError } from './square.js'

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
				return document.createElement('td')
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

		//// TODO: Load from local storage
		this.difficulty = 50

		const difficultySelectElement = this.element.querySelector('.controls select.difficulty')

		difficultySelectElement.value = this.difficulty

		difficultySelectElement.addEventListener('change', event => {
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

		const buttonElements = (new Array(this.rowSize)).fill(null).map((_element, index) => {
			const
				buttonElement = document.createElement('button'),
				buttonValue = index + 1

			buttonElement.innerText = buttonValue

			buttonElement.addEventListener('click', _event => {
				const selectedCell = this.getSelectedCell()

				if (selectedCell) {
					selectedCell.value = buttonValue
				} else {
					alert('First — select a cell, then press a button with number.')
				}
			})

			return buttonElement
		})

		this.element.querySelector('.buttons').append(...buttonElements)

		//// Actions

		this.element.querySelector('.actions .erase').addEventListener('click', _event => {
			this.getSelectedCell()?.erase()
		})

		//// Completed overlay

		this.completedOverlayElement = this.element.querySelector('.completed-overlay')

		this.element.querySelector('.completed-overlay .new-game').addEventListener('click', _event => {
			this.clear()
			this.fill()
			this.completedOverlayElement.classList.add('hidden')
		})
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

	set selectedCell(newValue) {
		const selectedCell = this.getSelectedCell()
		if (selectedCell) selectedCell.unselect()
		newValue.select()
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

	checkCompletion() {
		if (this.squares.flat().every(square => square.checkCompletion())) {
			this.completedOverlayElement.classList.remove('hidden')
		}
	}

	reset() {
		this.squares.flat().forEach(square => square.reset())
	}

	clear() {
		this.squares.flat().forEach(square => square.clear())
	}

	fill() {
		this.#generate()

		this.squares.flat().forEach(square => {
			square.cells.flat().forEach(cell => {
				if (Math.random() < (this.difficulty / 100)) {
					cell.value = null
				}
				cell.fill()
			})
		})
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
