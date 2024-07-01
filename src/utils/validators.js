export function validateId(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (!value) return '사용자 ID를 입력하세요.'
  if (value.length < 4) {
    return '사용할 ID는 4자 이상'
  }

  return null
}

export function validateName(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (!value) return '이름을 입력하세요.'

  return null
}

export function validateEmail(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (!value) return '이메일을 입력하세요.'

  const pattern = /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
  if (!pattern.test(value)) {
    return '올바르지 않은 이메일 형식입니다.'
  }

  return null
}

export function validatePhoneNumber(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (!value) return '전화번호를 입력해주세요'

  // regular expression to validate the email
  const pattern = /^010-\d{4}-\d{4}$/
  if (!pattern.test(value)) {
    return '정확한 전화번호를 입력해주세요.'
  }

  return null
}

export function validatePass(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (!value) return '비밀번호를 입력하세요.'

  if (value.length < 8) {
    return '비밀번호는 8자 이상 '
  }

  const regex = /^(?=.*?[A-Z])(?=.*?[0-9]){2}(?=.*?[!@#$&~*%^?]).{8,}$/
  if (!regex.test(value)) {
    return '비밀번호는 8자 이상, 대문자 1자, 숫자 2자 및 특수 대소문자 1자를 조합'
  }

  return null
}

export function validateRentryPass(oldValue, newValue) {
  newValue = newValue?.replaceAll(' ', '')

  // checking if the field is empty
  if (newValue == null || newValue.isEmpty) return '비밀번호를 다시 입력하세요.'

  //matching old and new password
  if (oldValue != newValue) return '비밀번호가 일치하지 않습니다.'

  return null
}

export function validateCountry(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (!value) return '국가를 선택하세요.'

  return null
}

export function validateForNoneEmpty(value, name) {
  value = value?.replaceAll(' ', '')

  if (value == null || value.isEmpty) {
    return `${name} 입력하세요.`
  }

  return null
}
