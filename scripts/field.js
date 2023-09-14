import { Square, SquareGenerateError } from './square.js'

export default class Field {
	constructor(squareSize, element) {
		this.squareSize = squareSize
		this.element = element

		this.width = this.squareSize
		this.height = this.squareSize

		this.rowSize = this.squareSize * this.width
		this.columnSize = this.squareSize * this.height

		this.schema = (new Array(this.rowSize * this.columnSize)).fill(null)

		this.squares = (new Array(this.height)).fill(null).map((_element, rowIndex) => {
			return (new Array(this.width)).fill(null).map((_element, columnIndex) => {
				return new Square(this, rowIndex, columnIndex)
			})
		})

		this.cellElements = []

		//// https://stackoverflow.com/a/65714624/2630849
		const rowElements = (new Array(this.columnSize)).fill(null).map(_element => {
			const rowElement = document.createElement('tr')

			const cellElements = (new Array(this.rowSize)).fill(null).map(_element => {
				const cellElement = document.createElement('td')

				cellElement.addEventListener('click', _event => {
					this.selectedCell = cellElement
				})

				this.cellElements.push(cellElement)

				return cellElement
			})

			rowElement.append(...cellElements)

			return rowElement
		})

		this.element.querySelector('table').append(...rowElements)

		const buttonElements = (new Array(this.rowSize)).fill(null).map((_element, index) => {
			const
				buttonElement = document.createElement('button'),
				buttonValue = index + 1

			buttonElement.innerText = buttonValue

			buttonElement.addEventListener('click', _event => {
				if (this.selectedCell) {
					if (this.selectedCell.classList.contains('pre-filled')) {
						alert("You can't change pre-filled cells.")
					} else {
						const schemaIndex = this.cellElements.indexOf(this.selectedCell)
						this.schema[schemaIndex] = this.selectedCell.innerText = buttonValue
					}
				} else {
					alert('First — select a cell, then press a button with number.')
				}
			})

			return buttonElement
		})

		this.element.querySelector('.buttons').append(...buttonElements)
	}

	get selectedCell() {
		return this.cellElements.find(cellElement => cellElement.classList.contains('selected'))
	}

	set selectedCell(newValue) {
		this.selectedCell?.classList?.remove('selected')
		newValue.classList.add('selected')
	}

	clear() {
		this.squares.forEach(squaresInRow => {
			squaresInRow.forEach(square => square.clear())
		})

		this.cellElements.forEach(cellElement => {
			cellElement.innerText = null
		})
	}

	fill() {
		this.#generate()

		//// TODO: Make this depending by difficulty
		this.schema = this.schema.map(value => {
			return Math.random() < 0.5 ? null : value
		})

		this.schema.forEach((value, index) => {
			const cellElement = this.cellElements[index]

			if (value) cellElement.classList.add('pre-filled')

			cellElement.innerText = value
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

			if (error instanceof SquareGenerateError && attempt < 5) {
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

			if (error instanceof SquareGenerateError && attempt < 3) {
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

			if (error instanceof SquareGenerateError && attempt < 3) {
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

			if (error instanceof SquareGenerateError && attempt < 3) {
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
