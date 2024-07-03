export function logoFinder(carrierCd) {
  if (carrierCd === 'KT') return 'src/assets/logos/kt.png'
  if (carrierCd === 'SK') return 'src/assets/logos/skt.png'
  if (carrierCd === 'LG') return 'src/assets/logos/lgu.png'
  return ''
}
