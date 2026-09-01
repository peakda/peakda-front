const errorTitle = document.querySelector('#error-title')
const retryButton = document.querySelector('#retry-button')

errorTitle?.focus()

retryButton?.addEventListener('click', () => {
  retryButton.disabled = true
  retryButton.textContent = '다시 연결하는 중…'
  window.location.reload()
})
