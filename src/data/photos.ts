// ============================================================
// 원장 제공 사진 (2026-11-09 구글 문서 '홈페이지 수정 요청 사항') — WebP 변환본 크기표
// 원본 JPG 는 레포에 두지 않는다. 문서에서 원장이 잘라 둔 영역 그대로 자른 뒤 1200w(+600w) 로 저장.
// ============================================================

export interface SitePhoto { src: string; sm?: string; width: number; height: number; alt: string; cap?: string }

const SIZES: Record<string, { src: string; sm?: string; width: number; height: number }> = {
  'hwt/first-visit-1': { src: '/static/img/hwt/first-visit-1.webp', sm: '/static/img/hwt/first-visit-1-600.webp', width: 1200, height: 1599 },
  'hwt/first-visit-2': { src: '/static/img/hwt/first-visit-2.webp', sm: '/static/img/hwt/first-visit-2-600.webp', width: 1200, height: 1599 },
  'hwt/first-visit-3': { src: '/static/img/hwt/first-visit-3.webp', sm: '/static/img/hwt/first-visit-3-600.webp', width: 1200, height: 1299 },
  'hwt/acupuncture-1': { src: '/static/img/hwt/acupuncture-1.webp', sm: '/static/img/hwt/acupuncture-1-600.webp', width: 1200, height: 1599 },
  'hwt/acupuncture-2': { src: '/static/img/hwt/acupuncture-2.webp', sm: '/static/img/hwt/acupuncture-2-600.webp', width: 1200, height: 1599 },
  'hwt/chuna-1': { src: '/static/img/hwt/chuna-1.webp', sm: '/static/img/hwt/chuna-1-600.webp', width: 1200, height: 900 },
  'hwt/chuna-2': { src: '/static/img/hwt/chuna-2.webp', sm: '/static/img/hwt/chuna-2-600.webp', width: 1200, height: 1599 },
  'hwt/chuna-3': { src: '/static/img/hwt/chuna-3.webp', sm: '/static/img/hwt/chuna-3-600.webp', width: 1200, height: 1599 },
  'hwt/herbal-1': { src: '/static/img/hwt/herbal-1.webp', sm: '/static/img/hwt/herbal-1-600.webp', width: 1200, height: 1599 },
  'hwt/herbal-2': { src: '/static/img/hwt/herbal-2.webp', sm: '/static/img/hwt/herbal-2-600.webp', width: 1200, height: 1599 },
  'hwt/herbal-3': { src: '/static/img/hwt/herbal-3.webp', sm: '/static/img/hwt/herbal-3-600.webp', width: 1200, height: 1599 },
  'hwt/car-accident-1': { src: '/static/img/hwt/car-accident-1.webp', sm: '/static/img/hwt/car-accident-1-600.webp', width: 1200, height: 1091 },
  'hwt/car-accident-2': { src: '/static/img/hwt/car-accident-2.webp', sm: '/static/img/hwt/car-accident-2-600.webp', width: 1200, height: 1117 },
  'hwt/diet-1': { src: '/static/img/hwt/diet-1.webp', sm: '/static/img/hwt/diet-1-600.webp', width: 1100, height: 720 },
  'hwt/diet-2': { src: '/static/img/hwt/diet-2.webp', sm: '/static/img/hwt/diet-2-600.webp', width: 1200, height: 1599 },
  'hwt/diet-3': { src: '/static/img/hwt/diet-3.webp', sm: '/static/img/hwt/diet-3-600.webp', width: 899, height: 624 },
  'tools/acupuncture-1': { src: '/static/img/tools/acupuncture-1.webp', sm: '/static/img/tools/acupuncture-1-600.webp', width: 1200, height: 1599 },
  'tools/acupuncture-2': { src: '/static/img/tools/acupuncture-2.webp', sm: '/static/img/tools/acupuncture-2-600.webp', width: 1200, height: 1599 },
  'tools/acupuncture-3': { src: '/static/img/tools/acupuncture-3.webp', sm: '/static/img/tools/acupuncture-3-600.webp', width: 1200, height: 1198 },
  'tools/acupotomy-1': { src: '/static/img/tools/acupotomy-1.webp', width: 668, height: 702 },
  'tools/pharmacopuncture-1': { src: '/static/img/tools/pharmacopuncture-1.webp', sm: '/static/img/tools/pharmacopuncture-1-600.webp', width: 1200, height: 1206 },
  'tools/pharmacopuncture-2': { src: '/static/img/tools/pharmacopuncture-2.webp', sm: '/static/img/tools/pharmacopuncture-2-600.webp', width: 1200, height: 1208 },
  'tools/pharmacopuncture-jukyeom': { src: '/static/img/tools/pharmacopuncture-jukyeom.webp', sm: '/static/img/tools/pharmacopuncture-jukyeom-600.webp', width: 1200, height: 1066 },
  'tools/pharmacopuncture-bee': { src: '/static/img/tools/pharmacopuncture-bee.webp', sm: '/static/img/tools/pharmacopuncture-bee-600.webp', width: 1200, height: 938 },
  'tools/pharmacopuncture-placenta': { src: '/static/img/tools/pharmacopuncture-placenta.webp', sm: '/static/img/tools/pharmacopuncture-placenta-600.webp', width: 1064, height: 1068 },
  'tools/thread-embedding-1': { src: '/static/img/tools/thread-embedding-1.webp', sm: '/static/img/tools/thread-embedding-1-600.webp', width: 1200, height: 968 },
  'tools/thread-embedding-2': { src: '/static/img/tools/thread-embedding-2.webp', sm: '/static/img/tools/thread-embedding-2-600.webp', width: 1200, height: 1121 },
  'tools/cupping-1': { src: '/static/img/tools/cupping-1.webp', sm: '/static/img/tools/cupping-1-600.webp', width: 1200, height: 951 },
  'tools/cupping-2': { src: '/static/img/tools/cupping-2.webp', sm: '/static/img/tools/cupping-2-600.webp', width: 1200, height: 1466 },
  'tools/moxibustion-1': { src: '/static/img/tools/moxibustion-1.webp', sm: '/static/img/tools/moxibustion-1-600.webp', width: 1200, height: 1074 },
  'tools/moxibustion-2': { src: '/static/img/tools/moxibustion-2.webp', sm: '/static/img/tools/moxibustion-2-600.webp', width: 1200, height: 1040 },
  'tools/moxibustion-3': { src: '/static/img/tools/moxibustion-3.webp', width: 548, height: 409 },
  'tools/chuna-1': { src: '/static/img/tools/chuna-1.webp', sm: '/static/img/tools/chuna-1-600.webp', width: 1200, height: 1015 },
  'tools/chuna-2': { src: '/static/img/tools/chuna-2.webp', sm: '/static/img/tools/chuna-2-600.webp', width: 1200, height: 873 },
  'tools/herbal-medicine-1': { src: '/static/img/tools/herbal-medicine-1.webp', sm: '/static/img/tools/herbal-medicine-1-600.webp', width: 1200, height: 999 },
  'tools/herbal-medicine-2': { src: '/static/img/tools/herbal-medicine-2.webp', width: 676, height: 505 },
  'tools/herbal-medicine-3': { src: '/static/img/tools/herbal-medicine-3.webp', sm: '/static/img/tools/herbal-medicine-3-600.webp', width: 1200, height: 1406 },
}

/** 사진 키(hwt/…, tools/…) + 대체텍스트(+캡션) → 렌더용 사진 객체 */
export const photo = (key: string, alt: string, cap?: string): SitePhoto => {
  const s = SIZES[key]
  if (!s) throw new Error(`unknown photo: ${key}`)
  return { ...s, alt, cap }
}
