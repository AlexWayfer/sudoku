document.addEventListener('DOMContentLoaded', _event => {
	const
		fieldElement = document.querySelector('table.field')

	//// https://stackoverflow.com/a/65714624/2630849
	const rowElements = (new Array(9)).fill(null).map(_element => {
		const rowElement = document.createElement('tr')

		const cellElements = (new Array(9)).fill(null).map(_element => {
			const cellElement = document.createElement('td')

			return cellElement
		})

		rowElement.append(...cellElements)

		return rowElement
	})

	fieldElement.append(...rowElements)
})
