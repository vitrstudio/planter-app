export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export function showError(message: string) {
  const errorDiv = document.getElementById('error')
  if (errorDiv) {
    errorDiv.textContent = message
    errorDiv.style.display = 'block'
    setTimeout(() => {
      errorDiv.style.display = 'none'
    }, 3000)
  }
}
