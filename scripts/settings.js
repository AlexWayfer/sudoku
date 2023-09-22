export default class Settings {
	#data = {
		clearNotesAfterValue: true
	}

	constructor(overlayElement) {
		this.overlayElement = overlayElement

		this.overlayElement.querySelector('button.close').addEventListener('click', _event => {
			this.hide()
		})

		Object.assign(this.#data, JSON.parse(localStorage.getItem('settings')))

		//// Getters and setters are working

		this.clearNotesAfterValue ??= true

		const clearNotesAfterValueElement =
			this.overlayElement.querySelector('input[name="clear-notes-after-value"]')

		clearNotesAfterValueElement.checked = this.clearNotesAfterValue

		clearNotesAfterValueElement.addEventListener('change', event => {
			this.clearNotesAfterValue = event.target.checked
		})
	}

	show() {
		this.overlayElement.classList.remove('hidden')
	}

	hide() {
		this.overlayElement.classList.add('hidden')
	}

	get clearNotesAfterValue() {
		return this.#data.clearNotesAfterValue
	}

	set clearNotesAfterValue(newValue) {
		this.#data.clearNotesAfterValue = newValue
		this.#syncLocalStorage()
	}

	#syncLocalStorage() {
		localStorage.setItem('settings', JSON.stringify(this.#data))
	}
}
