export function isAuthenticated() {
  return localStorage.getItem('isAuthenticated') === 'true'
}

export function login() {
  localStorage.setItem('isAuthenticated', 'true')
}

export function logout() {
  localStorage.removeItem('isAuthenticated')
}
