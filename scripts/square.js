import SquareGenerateError from './square-generate-error.js'

class Square {
	constructor(field, row, column) {
		this.field = field
		this.row = row
		this.column = column

		// console.debug('this.field = ', this.field)

		this.size = this.field.squareSize

		this.startIndex =
			row * Math.pow(this.size, 2) * this.field.width + column * this.size

		this.indexes = (new Array(this.size)).fill(null).map((_element, index) => {
			const rowStartIndex = this.startIndex + index * this.field.rowSize

			return [rowStartIndex, rowStartIndex + this.size]
		})
	}

	generate(attempt = 1) {
		// console.debug('square generate')
		// console.debug('this.size = ', this.size)

		for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
			for (let columnIndex = 0; columnIndex < this.size; columnIndex++) {
				let availableValues =
					(new Array(Math.pow(this.size, 2)))
						.fill(null)
						.map((_element, index) => index + 1)

				// console.debug('availableValues = ', availableValues)

				const
					schemaIndex = this.startIndex + rowIndex * this.field.rowSize + columnIndex,
					rowStartIndex = Math.floor(schemaIndex / this.field.rowSize) * this.field.rowSize,
					row =
						this.field.schema.slice(rowStartIndex, rowStartIndex + this.field.rowSize),
					column =
						this.field.schema.slice(0, schemaIndex)
							.filter((_element, index) => index % 9 == schemaIndex % 9),
					square = this.indexes.flatMap(range => this.field.schema.slice(...range))

				// console.debug('row = ', row)
				// console.debug('square = ', square)
				// console.debug('schemaIndex = ', schemaIndex)

				availableValues = availableValues.filter(element => {
					// return true
					return !row.includes(element) && !column.includes(element) && !square.includes(element)
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

				this.field.schema[schemaIndex] =
					availableValues[Math.floor(Math.random() * availableValues.length)]
			}
		}
	}

	clear() {
		this.indexes.forEach(range => {
			this.field.schema.fill(null, ...range)
		})
	}
}

export { Square, SquareGenerateError }
