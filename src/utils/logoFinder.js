import ktLogo from '@/assets/logos/kt.png'
import sktLogo from '@/assets/logos/skt.png'
import lguLogo from '@/assets/logos/lgu.png'

export function logoFinder(carrierCd) {
  if (carrierCd === 'KT') return ktLogo
  if (carrierCd === 'SK') return sktLogo
  if (carrierCd === 'LG') return lguLogo
  return ''
}
