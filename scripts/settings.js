export default class Settings {
	#data = {
		clearNotesAfterValue: true,
		hideButtonsForCompletedNumbers: true,
		confirmationOnPageReload: true
	}

	constructor(field, overlayElement) {
		this.field = field
		this.overlayElement = overlayElement

		this.overlayElement.querySelector('button.close').addEventListener('click', _event => {
			this.hide()
		})

		Object.assign(this.#data, JSON.parse(localStorage.getItem('settings')))

		// console.debug('this.#data = ', this.#data)

		//// Getters and setters are working

		this.#defineCheckboxSetting('clearNotesAfterValue')

		this.#defineCheckboxSetting('hideButtonsForCompletedNumbers')

		this.#defineCheckboxSetting('confirmationOnPageReload')
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

	get confirmationOnPageReload() {
		return this.#data.confirmationOnPageReload
	}

	set confirmationOnPageReload(newValue) {
		this.#data.confirmationOnPageReload = newValue
		this.#syncLocalStorage()
	}

	#defineCheckboxSetting(settingName) {
		const
			checkboxName = settingName.split(/(?=[A-Z])/).map(string => string.toLowerCase()).join('-'),
			checkboxElement = this.overlayElement.querySelector(`input[name="${checkboxName}"]`)

		checkboxElement.checked = this[settingName]

		checkboxElement.addEventListener('change', event => {
			this[settingName] = event.target.checked
		})
	}

	#syncLocalStorage() {
		localStorage.setItem('settings', JSON.stringify(this.#data))
	}
}
