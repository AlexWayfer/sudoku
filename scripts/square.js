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
				const cell = this.cells[rowIndex][columnIndex]

				let availableValues =
					(new Array(Math.pow(this.size, 2))).fill(null).map((_element, index) => index + 1)

				const takenValues = cell.getTakenValues()

				availableValues = availableValues.filter(value => {
					//// `some` is for String and Integer comparison
					return !takenValues.some(takenValue => takenValue == value)
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

				cell.value = availableValues[Math.floor(Math.random() * availableValues.length)]
			}
		}
	}

	clear() {
		this.cells.flat().map(cell => cell?.clear())
	}
}

export { Square, SquareGenerateError }
