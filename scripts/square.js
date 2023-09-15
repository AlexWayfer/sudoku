import SquareGenerateError from './square-generate-error.js'
import Cell from './cell.js'

class Square {
	constructor(field, row, column) {
		this.field = field
		this.row = row
		this.column = column

		this.size = this.field.squareSize

		this.cells = (new Array(this.size)).fill(null).map((_element, rowIndex) => {
			return (new Array(this.size)).fill(null).map((_element, columnIndex) => {
				return new Cell(this, rowIndex, columnIndex)
			})
		})
	}

	generate(attempt = 1) {
		// console.debug(`square (${this.row}, ${this.column}) generate, attempt = ${attempt}`)

		for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
			for (let columnIndex = 0; columnIndex < this.size; columnIndex++) {
				let availableValues =
					(new Array(Math.pow(this.size, 2))).fill(null).map((_element, index) => index + 1)

				const
					squaresRow = this.field.squares[this.row].slice(0, this.field.width),
					row = squaresRow.flatMap(
						square => square.cells[rowIndex].map(cell => cell.value)
					),
					squaresColumn = this.field.squares.map(squaresRow => squaresRow[this.column]),
					column = squaresColumn.flatMap(
						square => square.cells.map(cellsRow => cellsRow[columnIndex].value)
					),
					square = this.cells.flat().map(cell => cell.value)

				// console.debug('row = ', row)
				// console.debug('column = ', column)
				// console.debug('square = ', square)

				availableValues = availableValues.filter(value => {
					return !row.includes(value) && !column.includes(value) && !square.includes(value)
				})

				// console.debug('availableValues = ', availableValues)

				if (availableValues.length == 0) {
					this.clear()

					if (attempt < 10) {
						return this.generate(attempt + 1)
					} else {
						throw new SquareGenerateError()
					}
				}

				this.cells[rowIndex][columnIndex].value =
					availableValues[Math.floor(Math.random() * availableValues.length)]
			}
		}
	}

	clear() {
		this.cells.flat().map(cell => cell?.clear())
	}
}

export { Square, SquareGenerateError }
