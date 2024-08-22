import jsPDF from 'jspdf'

export const convertToPdfAndGetUrl = (base64Images) => {
  if (base64Images.length > 0) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

    const pdfWidth = doc.internal.pageSize.getWidth()
    const pdfHeight = doc.internal.pageSize.getHeight()

    base64Images.forEach((imgData, index) => {
      const imgProps = doc.getImageProperties(imgData)
      let imgWidth = pdfWidth
      let imgHeight = (imgProps.height * pdfWidth) / imgProps.width

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight
        imgWidth = (imgProps.width * pdfHeight) / imgProps.height
      }

      const x = (pdfWidth - imgWidth) / 2 // centers the image horizontally
      const y = (pdfHeight - imgHeight) / 2 // centers the image vertically

      doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)

      if (index < base64Images.length - 1) doc.addPage()
    })

    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    return pdfUrl
  }

  return null
}

export const formatDate = (today) => {
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function base64ToBlobUrl(base64Data) {
  let contentType = 'image/png' // Default content type set to PNG
  let raw = base64Data

  // Check if the base64 string includes the data URL prefix
  if (base64Data.startsWith('data:')) {
    const parts = base64Data.split(';base64,')
    contentType = parts[0].split(':')[1]
    raw = parts[1]
  }

  const byteCharacters = atob(raw)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: contentType })
  const url = URL.createObjectURL(blob)
  return url
}

// 최소 8자이상, 영문대문자 1개이상포함, 숫자 1개이상포함, 특수문자(! @ # $ & ~ * % ^ ?) 1개이상포함
// export const isValidPassword = (password) => {
//   const minLength = 8
//   const lowercasePattern = /[a-z]/
//   const uppercasePattern = /[A-Z]/
//   const numberPattern = /[0-9]/
//   const specialCharPattern = /[!@#$&~*%^?]/

//   if (password.length < minLength) {
//     return false
//   }
//   if (!uppercasePattern.test(password)) {
//     return false
//   }
//   if (!numberPattern.test(password)) {
//     return false
//   }
//   if (!specialCharPattern.test(password)) {
//     return false
//   }
//   return true
// }

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
// await delay(3000)
