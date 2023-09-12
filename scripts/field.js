import { Square, SquareFillError } from './square.js'

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

				this.cellElements.push(cellElement)

				return cellElement
			})

			rowElement.append(...cellElements)

			return rowElement
		})

		this.element.append(...rowElements)
	}

	fill() {
		const fillingStart = performance.now()
		this.#fillDiagonalSquares()
		console.debug(`Field filling time is ${performance.now() - fillingStart} ms`)
	}

	#fillDiagonalSquares(attempt = 1) {
		console.debug('fill diagonal squares')

		const squares = [[0, 0], [1, 1], [2, 2]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.fill())

			this.#fillHorizontalSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareFillError && attempt < 10) {
				console.debug('refill diagonal squares')

				this.#fillDiagonalSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#fillCrossSquares(attempt = 1) {
		console.debug('fill cross squares')

		const squares = [[1, 0], [1, 2], [0, 1], [2, 1]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.fill())

			this.#fillRestSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareFillError && attempt < 5) {
				console.debug('refill cross squares')

				this.#fillCrossSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#fillHorizontalSquares(attempt = 1) {
		console.debug('fill horizontal squares')

		const squares = [[1, 0], [1, 2]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.fill())

			this.#fillVerticalSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareFillError && attempt < 3) {
				console.debug('refill horizontal squares')

				this.#fillHorizontalSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#fillVerticalSquares(attempt = 1) {
		console.debug('fill vertical squares')

		const squares = [[0, 1], [2, 1]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.fill())

			this.#fillRestSquares()
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareFillError && attempt < 3) {
				console.debug('refill vertical squares')

				this.#fillVerticalSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#fillRestSquares(attempt = 1) {
		console.debug('fill rest squares')

		const squares = [[0, 2], [2, 0]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.fill())
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareFillError && attempt < 3) {
				console.debug('refill rest squares')

				this.#fillRestSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}

	#fillAllRestSquares(attempt = 1) {
		console.debug('fill all rest squares')

		const squares =
			[[1, 0], [1, 2], [0, 1], [2, 1], [0, 2], [2, 0]].map(([y, x]) => this.squares[y][x])

		try {
			squares.forEach(square => square.fill())
		} catch(error) {
			squares.forEach(square => square.clear())

			if (error instanceof SquareFillError && attempt < 10) {
				console.debug('refill all rest squares')

				this.#fillAllRestSquares(attempt + 1)
			} else {
				throw error
			}
		}
	}
}
