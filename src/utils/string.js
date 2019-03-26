export function camelize (string) {
  return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
}

export function b64ToString (string) {
  return decodeURIComponent(atob(string).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
