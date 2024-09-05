export function validateId(value) {
  value = value?.replaceAll(' ', '') // remove spaces (if any)

  // check if the field is empty
  if (!value) return '사용자 ID를 입력하세요.'

  // check length (at least 4 characters)
  if (value.length < 4) return '사용할 ID는 4자 이상'

  // regular expression to match only English letters and digits
  const isValidFormat = /^[a-zA-Z0-9]+$/.test(value)

  if (!isValidFormat) return 'ID는 영문자와 숫자만 사용할 수 있습니다.'
  // all checks passed
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

  const regex = /^(?=.*?[a-zA-Z])(?=.*?[0-9]){2}(?=.*?[!@#$&~*%^?]).{8,}$/

  if (!regex.test(value)) {
    return '비밀번호는 8자 이상, 대/소문자 1자, 숫자 2자 및 특수 대소문자 1자를 조합'
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

export function validateForNoneEmpty(value, name) {
  value = value?.replaceAll(' ', '')

  if (value == null || value.isEmpty || value === '') {
    return `${name} 입력하세요.`
  }

  return null
}

//date as '24-08-31'
export function validateShortBirthday(value) {
  // checking if the field is empty
  if (value == null || value.isEmpty || value === '') return '생년월일 입력하세요.'

  // Check if the format is correct (YY-MM-DD)
  if (!/^\d{2}-\d{2}-\d{2}$/.test(value)) {
    return 'YY-MM-DD 형식으로 입력해주세요.'
  }

  return null
}

//date as '2024-08-31'
export function validateBirthday(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (value == null || value.isEmpty || value === '') return '생년월일 입력하세요.'

  // Check if the format is correct (YY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'YYYY-MM-DD 형식으로 입력해주세요.'
  }

  return null
}

//date as '08/31'
export function expiryDate(value) {
  value = value?.replaceAll(' ', '')

  // checking if the field is empty
  if (value == null || value.isEmpty || value === '') return '카드유효기간을 입력하세요.'

  // Check if the format is correct (YY-MM-DD)
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return '카드유효기간을 정확하게 입력하세요.'
  }

  return null
}

export function validateEmpty(value, error) {
  value = value?.replaceAll(' ', '')

  if (value == null || value.isEmpty || value === '') {
    return error
  }

  return null
}

export function validate010phoneNumber(value, error) {
  // Remove all spaces from the input
  value = value?.replaceAll(' ', '')

  if (value == null || value === '') {
    return error
  }

  // Check if the format is correct (0XX-XXX-XXXX or 0XX-XXXX-XXXX)
  if (!/^0\d{1,2}(-|)\d{3,4}-\d{4}$/.test(value)) {
    return '번호를 정확하게 입력하세요.'
  }

  return null
}
