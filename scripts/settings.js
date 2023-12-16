export default class Settings {
	#data = {
		clearNotesAfterValue: true,
		hideButtonsForCompletedNumbers: true
	}

	constructor(field, overlayElement) {
		this.field = field
		this.overlayElement = overlayElement

		this.overlayElement.querySelector('button.close').addEventListener('click', _event => {
			this.hide()
		})

		Object.assign(this.#data, JSON.parse(localStorage.getItem('settings')))

		//// Getters and setters are working

		const clearNotesAfterValueElement =
			this.overlayElement.querySelector('input[name="clear-notes-after-value"]')

		clearNotesAfterValueElement.checked = this.clearNotesAfterValue

		clearNotesAfterValueElement.addEventListener('change', event => {
			this.clearNotesAfterValue = event.target.checked
		})

		const hideButtonsForCompletedNumbersElement =
			this.overlayElement.querySelector('input[name="hide-buttons-for-completed-numbers"]')

		hideButtonsForCompletedNumbersElement.checked = this.hideButtonsForCompletedNumbers

		hideButtonsForCompletedNumbersElement.addEventListener('change', event => {
			this.hideButtonsForCompletedNumbers = event.target.checked
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

	get hideButtonsForCompletedNumbers() {
		return this.#data.hideButtonsForCompletedNumbers
	}

	set hideButtonsForCompletedNumbers(newValue) {
		this.#data.hideButtonsForCompletedNumbers = newValue

		if (newValue) {
			this.field.numberButtons.forEach(
				numberButton => this.field.checkNumberCompletion(numberButton.value)
			)
		} else {
			this.field.numberButtons.forEach(numberButton => numberButton.toggleCompletion(false))
		}

		this.#syncLocalStorage()
	}

	#syncLocalStorage() {
		localStorage.setItem('settings', JSON.stringify(this.#data))
	}
}
