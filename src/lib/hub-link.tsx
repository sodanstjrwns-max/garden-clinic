// =====================================================================
// "오산 한의원" 대표 키워드 → 홈(/)으로 모으는 내부 링크 (2026-10-08)
// - 정원한의원은 홈이 '오산 한의원' 대표 페이지(title 앞부분 일치). 앵커는 항상 정확히 "오산 한의원", nofollow 없음
// - 한 페이지에 '오산 한의원' 앵커 홈 링크 최대 2개(푸터 1 + 본문 1). 홈 자신에는 넣지 않는다.
// - 칼럼 상세 끝 안내 문장은 4가지 문형 중 slug 해시로 고정 선택(글마다 같은 문장 반복 방지)
// - 사실 정보는 clinic.ts·areas.ts 값만: 오산역 1번 출구 도보 약 5분, 전용주차장, 평일 오후 8시·주말·공휴일 오후 3시까지
// =====================================================================
import type { FC } from 'hono/jsx'

export const HUB_PATH = '/'
export const HUB_ANCHOR = '오산 한의원'

/** 푸터에 '오산 한의원' 홈 링크를 넣을지 — 홈 자신은 제외 */
export function footerHubLink(path?: string): boolean {
  return !!path && path !== HUB_PATH
}

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

const linkStyle = 'color:var(--brand);font-weight:700;text-decoration:underline;text-underline-offset:3px'

/** 본문 안 '오산 한의원' 앵커 링크 */
export const HubAnchor: FC = () => <a href={HUB_PATH} style={linkStyle}>{HUB_ANCHOR}</a>

/** 칼럼 상세 본문 끝(작성자 박스 위) 지역 안내 한 문장. seed = 글 slug */
export const ColumnHubNote: FC<{ seed: string; topic?: string }> = ({ seed, topic }) => {
  const what = topic ? `${topic} 상담` : '진료 상담'
  const forms = [
    <>정원한의원은 <HubAnchor />을 찾는 오산 시민분들께 {what} 일정과 진료시간을 안내합니다.</>,
    <><HubAnchor />을 찾으신다면 오산역 1번 출구에서 걸어서 약 5분 거리인 정원한의원의 위치와 전용주차장 안내를 먼저 확인해 보세요.</>,
    <>평일 저녁이나 주말에 <HubAnchor />을 알아보시는 분들을 위해 정원한의원은 평일 오후 8시, 주말·공휴일 오후 3시까지 진료합니다.</>,
    <>동탄·병점·평택 등 오산 인근에서 <HubAnchor />을 찾는 분들께 정원한의원의 의료진과 진료 과목을 한곳에 정리해 두었습니다.</>,
  ]
  return (
    <p class="col-hub-note" style="margin-top:32px;padding:16px 20px;border-left:4px solid var(--brand);background:var(--brand-soft);border-radius:0 12px 12px 0;font-size:15px;line-height:1.8;color:var(--ink-2)">
      {forms[hashSeed(seed) % forms.length]}
    </p>
  )
}
