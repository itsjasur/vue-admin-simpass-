export const SIDEMENUNAMES = [
  '나의 정보',
  '사용자 관리',
  '요금제 관리',
  '신청서 접수현황',
  '판매점 가입현황',
  '판매점 거래현황',
  '상담사 개통 문의현황',
  '렌탈가입 신청서',
  '가입/번호이동 신청서'
]

export const MEMBER_STATUSES = [
  { label: '사용중', value: 'Y' },
  { label: '미사용', value: 'N' },
  { label: '삭제', value: 'D' },
  { label: '승인대기', value: 'W' }
]

export const COUNTRIES = [
  { value: 'CN', label: '중국' },
  { value: 'VN', label: '베트남' },
  { value: 'ID', label: '인도네시아' },
  { value: 'KH', label: '캄보디아' },
  { value: 'MN', label: '몽골' },
  { value: 'MM', label: '미얀마' },
  { value: 'TH', label: '태국' },
  { value: 'PH', label: '필리핀' },
  { value: 'HK', label: '홍콩' },
  { value: 'NP', label: '네팔' },
  { value: 'TW', label: '대만' },
  { value: 'BD', label: '방글라데시' },
  { value: 'LK', label: '스리랑카' },
  { value: 'ID', label: '인도' },
  { value: 'MY', label: '말레이시아' },
  { value: 'UZ', label: '우즈베키스탄' },
  { value: 'KZ', label: '카자흐스탄' },
  { value: 'RU', label: '러시아' },
  { value: 'US', label: '미국' },
  { value: 'KR', label: '대한민국' },
  { value: 'EN', label: '영어권 국가' }
]

export const USER_ROLES = [
  {
    id: 1,
    label: '관리자',
    code: 'ROLE_ADMIN',
    state: 'hidden',
    checked: false,
    high: [],
    low: ['ALL']
  },
  {
    id: 2,
    label: '담당자',
    code: 'ROLE_MANAGER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN'],
    low: [
      'ROLE_USER',
      'ROLE_OPEN_MANAGER',
      'ROLE_OPEN_MEMBER',
      'ROLE_EXP_MANAGER',
      'ROLE_EXP_MEMBER',
      'ROLE_MALL_MANAGER',
      'ROLE_MALL_MEMBER'
    ]
  },
  {
    id: 3,
    label: '사용자',
    code: 'ROLE_USER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    low: ['ROLE_OPEN_MEMBER', 'ROLE_EXP_MEMBER', 'ROLE_MALL_MEMBER']
  },

  //
  //개통
  {
    id: 4,
    label: '개통관리자',
    code: 'ROLE_OPEN_ADMIN',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN'],
    low: ['ROLE_OPEN_MANAGER', 'ROLE_OPEN_MEMBER']
  },
  {
    id: 5,
    label: '개통담당자',
    code: 'ROLE_OPEN_MANAGER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OPEN_ADMIN'],
    low: ['ROLE_OPEN_MEMBER']
  },
  {
    id: 6,
    label: '개통사용자',
    code: 'ROLE_OPEN_MEMBER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER', 'ROLE_OPEN_ADMIN', 'ROLE_OPEN_MANAGER'],
    low: []
  },

  //해외배송
  {
    id: 7,
    label: '해외배송관리자',
    code: 'ROLE_EXP_ADMIN',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN'],
    low: ['ROLE_EXP_MANAGER', 'ROLE_EXP_MEMBER']
  },
  {
    id: 8,
    label: '해외배송담당자',
    code: 'ROLE_EXP_MANAGER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EXP_ADMIN'],
    low: ['ROLE_EXP_MEMBER']
  },
  {
    id: 9,
    label: '해외배송사용자',
    code: 'ROLE_EXP_MEMBER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER', 'ROLE_EXP_ADMIN', 'ROLE_EXP_MANAGER'],
    low: []
  },
  //쇼핑몰
  {
    id: 10,
    label: '쇼핑몰관리자',
    code: 'ROLE_MALL_ADMIN',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN'],
    low: ['ROLE_MALL_MANAGER', 'ROLE_MALL_MEMBER']
  },
  {
    id: 11,
    label: '쇼핑몰담당자',
    code: 'ROLE_MALL_MANAGER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_MALL_ADMIN'],
    low: ['ROLE_MALL_MEMBER']
  },
  {
    id: 12,
    label: '쇼핑몰사용자',
    code: 'ROLE_MALL_MEMBER',
    state: 'active',
    checked: false,
    high: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER', 'ROLE_MALL_ADMIN', 'ROLE_MALL_MANAGER'],
    low: []
  }
]

export const CARRIERS = [
  { cd: '', label: '전체' },
  { cd: 'KT', label: 'KT' },
  { cd: 'SK', label: 'SKT' },
  { cd: 'LG', label: 'LG U+' }
]

export const PLANTYPES = [
  { cd: 'PO', label: '후불' },
  { cd: 'PR', label: '선불' }
]

export const MVNO_CODES = {
  FRT: '프리티',
  HVS: '핼로 모바일',
  ISM: '인스 모바일',
  KTM: 'KT M모바일',
  KTS: 'KT Sky Life',
  SVM: 'SK 7모바일',
  UPM: 'U+ 유모바일',
  HPM: '한패스 모바일',
  CDM: '코드 모바일'
}
export const CARRIER_CODES = { KT: 'KT', SK: 'SKT', LG: 'LG U+' }
export const AGENT_CODES = { SJ: '에스제이', BP: '바로폼' }

export const USIM_ORDER_STATUSES = {
  confirmed: '주문확인',
  shipped: '배송중',
  delivered: '발송완료',
  failed: '취소'
}
export const USIM_ORDER_STATUS_COLORS = {
  confirmed: 'green',
  shipped: 'orange',
  delivered: 'grey',
  failed: 'red'
}
