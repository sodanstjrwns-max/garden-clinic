import type { FC } from 'hono/jsx'

/* ============================================================
   庭園 벡터 모션 그래픽 컴포넌트
   - 모든 SVG는 stroke 기반 라인 드로잉 (currentColor)
   - .in 클래스(스크롤 리빌)가 붙으면 stroke-dashoffset 드로우 애니메이션
   ============================================================ */

/** 히어로 좌하단 — 큰 보태니컬 가지 (라인 드로잉) */
export const HeroBranch: FC = () => (
  <svg
    class="hero__branch svg-draw"
    viewBox="0 0 420 520"
    fill="none"
    aria-hidden="true"
  >
    {/* 메인 줄기 */}
    <path d="M60 510 C 90 420, 70 330, 110 250 C 145 180, 130 110, 170 40" stroke-width="2.5" />
    {/* 좌측 가지 + 잎 */}
    <path d="M92 380 C 60 350, 30 345, 8 355" stroke-width="2" />
    <path d="M8 355 C 28 330, 62 332, 92 380 Z" stroke-width="1.8" class="leaf-fill" />
    <path d="M118 240 C 80 215, 48 215, 22 228" stroke-width="2" />
    <path d="M22 228 C 46 200, 86 203, 118 240 Z" stroke-width="1.8" class="leaf-fill" />
    {/* 우측 가지 + 잎 */}
    <path d="M85 440 C 125 420, 155 422, 180 438" stroke-width="2" />
    <path d="M180 438 C 158 408, 118 410, 85 440 Z" stroke-width="1.8" class="leaf-fill" />
    <path d="M105 300 C 150 280, 185 284, 212 302" stroke-width="2" />
    <path d="M212 302 C 188 268, 142 272, 105 300 Z" stroke-width="1.8" class="leaf-fill" />
    <path d="M148 130 C 190 112, 222 116, 248 134" stroke-width="2" />
    <path d="M248 134 C 224 100, 180 105, 148 130 Z" stroke-width="1.8" class="leaf-fill" />
    {/* 끝 새순 */}
    <path d="M170 40 C 178 24, 192 14, 210 10" stroke-width="2" />
    <circle cx="214" cy="9" r="4" class="bud" />
  </svg>
)

/** 섹션 디바이더 — 가로 덩굴 장식 (스크롤 시 좌→우 드로우) */
export const GardenDivider: FC<{ tone?: 'light' | 'dark' }> = ({ tone = 'light' }) => (
  <div class={`garden-divider garden-divider--${tone}`} data-reveal aria-hidden="true">
    <svg class="svg-draw" viewBox="0 0 600 48" fill="none" preserveAspectRatio="xMidYMid meet">
      {/* 덩굴 줄기 */}
      <path d="M10 24 C 80 8, 140 40, 210 24 C 280 8, 340 40, 410 24 C 480 8, 540 40, 590 24" stroke-width="1.6" />
      {/* 잎들 */}
      <path d="M105 22 C 95 8, 78 6, 66 12 C 76 24, 94 26, 105 22 Z" stroke-width="1.4" class="leaf-fill" />
      <path d="M310 26 C 320 40, 337 42, 349 36 C 339 24, 321 22, 310 26 Z" stroke-width="1.4" class="leaf-fill" />
      <path d="M495 22 C 485 8, 468 6, 456 12 C 466 24, 484 26, 495 22 Z" stroke-width="1.4" class="leaf-fill" />
      {/* 중앙 꽃봉오리 */}
      <circle cx="300" cy="24" r="5.5" stroke-width="1.6" class="bud-ring" />
      <circle cx="300" cy="24" r="2" class="bud" />
    </svg>
  </div>
)

/** 플로팅 잎 파티클 — 히어로에 떠다니는 작은 잎들 */
export const FloatingLeaves: FC = () => (
  <div class="floating-leaves" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg class={`f-leaf f-leaf--${i}`} viewBox="0 0 32 32" fill="none">
        <path
          d="M26 6 C 14 6, 6 14, 6 26 C 18 26, 26 18, 26 6 Z"
          stroke="currentColor"
          stroke-width="1.5"
          fill="currentColor"
          fill-opacity="0.12"
        />
        <path d="M9 23 C 14 18, 19 13, 23 9" stroke="currentColor" stroke-width="1" />
      </svg>
    ))}
  </div>
)

/** 작은 잎 마크 — 아이콘 대체용 */
export const LeafMark: FC = () => (
  <svg class="leaf-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M19 5 C 10 5, 5 10, 5 19 C 14 19, 19 14, 19 5 Z"
      stroke="currentColor"
      stroke-width="1.6"
      fill="currentColor"
      fill-opacity="0.15"
    />
    <path d="M7 17 C 11 13, 14 10, 17 7" stroke="currentColor" stroke-width="1.2" />
  </svg>
)
