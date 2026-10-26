import type { FC } from 'hono/jsx'
import { DAY_KEYS, DAY_LABEL, CHANGE_KIND_LABEL, fmtRangeKo, kstDate, kstWeekDates } from '../data/schedules'
import type { DoctorSchedule, ScheduleChange, DayKey } from '../data/schedules'

const shortDate = (s: string) => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`

/** 해당 날짜에 걸친 변동 (휴진·시간변경 우선) */
function changeOn(changes: ScheduleChange[], date: string): ScheduleChange | undefined {
  const hits = changes.filter((c) => c.start_date <= date && c.end_date >= date && c.kind !== 'notice')
  return hits.find((c) => c.kind === 'off') || hits[0]
}

// ============= 원장 프로필 상단 진료시간표 =============
export const DoctorTimetable: FC<{ name: string; schedule: DoctorSchedule; changes: ScheduleChange[] }> = ({ name, schedule, changes }) => {
  const week = kstWeekDates()
  const today = kstDate()
  const mine = changes.filter((c) => c.doctor_slug === schedule.slug && c.end_date >= today)
  return (
    <section class="dtt" id="schedule" aria-labelledby="dtt-title">
      <div class="dtt__head">
        <h2 id="dtt-title" class="dtt__title"><i class="fas fa-calendar-days"></i> {name} 원장 진료시간</h2>
        <span class="dtt__week">이번 주 {shortDate(week.mon)} ~ {shortDate(week.sun)}</span>
      </div>
      <div class="dtt__grid" role="table" aria-label={`${name} 원장 요일별 진료시간`}>
        {DAY_KEYS.map((k: DayKey) => {
          const base = schedule.weekly[k]
          const date = week[k]
          const ch = changeOn(mine, date)
          const isToday = date === today
          let state = base ? 'on' : 'off'
          let time = base ? `${base.start} ~ ${base.end}` : '진료 없음'
          let tag = ''
          if (ch?.kind === 'off') { state = 'closed'; time = '휴진'; tag = '임시' }
          else if (ch?.kind === 'change' && ch.start_time && ch.end_time) { state = 'changed'; time = `${ch.start_time} ~ ${ch.end_time}`; tag = '변경' }
          return (
            <div class={`dtt__cell dtt__cell--${state}${isToday ? ' is-today' : ''}`} role="row">
              <span class="dtt__day" role="rowheader">{DAY_LABEL[k]}<em>{shortDate(date)}</em>{isToday && <b>오늘</b>}</span>
              <span class="dtt__time" role="cell">{time}{tag && <i class="dtt__tag">{tag}</i>}</span>
            </div>
          )
        })}
      </div>
      {mine.length > 0 && (
        <ul class="dtt__changes" aria-label="진료시간 변동 안내">
          {mine.map((c) => (
            <li class={`dtt__change dtt__change--${c.kind}`}>
              <strong>{CHANGE_KIND_LABEL[c.kind] || '안내'}</strong>
              <span class="dtt__change-date">{fmtRangeKo(c.start_date, c.end_date)}</span>
              {c.kind === 'change' && c.start_time && c.end_time && <span class="dtt__change-time">{c.start_time} ~ {c.end_time}</span>}
              {c.message && <span class="dtt__change-msg">{c.message}</span>}
            </li>
          ))}
        </ul>
      )}
      {schedule.note && <p class="dtt__note"><i class="fas fa-circle-info"></i> {schedule.note}</p>}
      <p class="dtt__foot">
        진료 일정은 사정에 따라 바뀔 수 있습니다. 방문 전 <a href="tel:0318318620">031-831-8620</a>으로 확인해 주시면 정확합니다.
      </p>
    </section>
  )
}

// ============= 의료진 목록: 전체 원장 요일별 진료표 =============
export const AllDoctorsTimetable: FC<{ doctors: { slug: string; name: string; photo?: string }[]; schedules: Record<string, DoctorSchedule> }> = ({ doctors, schedules }) => (
  <div class="att" id="schedule">
    <div class="att__scroll">
      <table class="att__table">
        <caption>정원한의원 원장별 요일 진료 안내 (평일 08:30~20:00 · 주말·공휴일 08:30~15:00)</caption>
        <thead>
          <tr>
            <th scope="col">원장</th>
            {DAY_KEYS.map((k) => <th scope="col">{DAY_LABEL[k]}</th>)}
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => {
            const s = schedules[d.slug]
            return (
              <tr>
                <th scope="row"><a href={`/doctors/${d.slug}#schedule`}>{d.name}</a></th>
                {DAY_KEYS.map((k) => {
                  const v = s?.weekly[k]
                  return <td class={v ? 'on' : ''}>{v ? <span>{v.start}<br />~{v.end}</span> : <span aria-label="진료 없음">·</span>}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    <p class="att__note">원장 이름을 누르면 이번 주 진료시간과 임시 변동 안내를 확인할 수 있습니다.</p>
  </div>
)
