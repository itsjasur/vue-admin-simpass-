export const getTodaysDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const birthdayPattern = {
  date: true,
  delimiter: '-',
  datePattern: ['y', 'm', 'd'],
  strictDate: true,
}

export const birthdayPatternFull = {
  date: true,
  delimiter: '-',
  datePattern: ['Y', 'm', 'd'],
  strictDate: true,
}

export const datePattern = {
  date: true,
  delimiter: '-',
  datePattern: ['Y', 'm', 'd'],
  // dateMin: '1930-01-01',
  // dateMax: getTodaysDate(),
}

export const phoneNumberPattern = {
  phone: true,
  phoneRegionCode: 'KR',
  delimiter: '-',
}

export const businessNumberPattern = {
  delimiter: '-',
  blocks: [3, 2, 5],
  numericOnly: true,
}
