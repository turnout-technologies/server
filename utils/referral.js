function salt(length) {
  let result = ''
  const characters = '0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

module.exports.generateReferral = ({ firstName, lastName}) => {
  let targetLength = 10
  let code = ''

  const first = firstName.length
  const last = lastName.length

  const firstTarget = 2
  const lastTarget = 2

  if (first < firstTarget) {
    code += firstName
    targetLength -= first
  } else {
    code += firstName.slice(0, firstTarget).toLowerCase()
    targetLength -= firstTarget
  }

  if (last < lastTarget) {
    code += lastName
    targetLength -= last
  } else {
    code += lastName.slice(0, lastTarget).toLowerCase()
    targetLength -= lastTarget
  }

  return code + salt(targetLength)
}
