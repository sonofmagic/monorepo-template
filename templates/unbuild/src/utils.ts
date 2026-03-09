const lowercaseLetterPattern = /[a-z]/g

export function format(str: string) {
  return str.replaceAll(lowercaseLetterPattern, s => s.toUpperCase())
}
