import type { FC } from 'hono/jsx'
import { Page, PageHero } from '../components/Layout'
import { DOCTORS, getDoctor } from '../data/doctors'
import { getTreatment } from '../data/treatments'
import { CLINIC } from '../data/clinic'
import { personSchema, breadcrumbSchema } from '../lib/schema'
import { metaTrim } from '../lib/seo'

export const DoctorListPage: FC = () => (
  <Page
    title="의료진 소개 — 오산 정원한의원 (한의사 8인 진료)"
    description="오산 정원한의원 의료진을 소개합니다. 한방내과 전문의 심원석 대표원장을 비롯한 8인의 한의사가 주력 분야별로 표준화된 진료를 제공합니다."
    path="/doctors"
    jsonLd={breadcrumbSchema([{ name: '홈', url: '/' }, { name: '의료진', url: '/doctors' }])}
  >
    <PageHero
      title="의료진"
      desc="한방내과 전문의 대표원장을 비롯한 8인의 한의사가 주력 분야별로 진료합니다."
      breadcrumb={[{ label: '의료진' }]}
    />
    <section class="section">
      <div class="wrap">
        <div class="doc-grid">
          {DOCTORS.map((d, i) => (
            <a class="doc-card" href={`/doctors/${d.slug}`} data-reveal data-reveal-delay={String(i + 1)}>
              <div class="doc-card__photo">
                {d.photo ? <img src={d.photo} alt={`${d.name} ${d.title}`} width="400" height="500" loading="lazy" decoding="async" /> : <i class="fas fa-user-doctor"></i>}
              </div>
              <div class="doc-card__body">
                <div class="doc-card__role">{d.title}</div>
                <div class="doc-card__name">{d.name}</div>
                <div class="doc-card__spec">{d.specialty}</div>
                {d.motto && <div class="doc-card__motto">“{d.motto}”</div>}
                <span class="tx-card__more">프로필 보기 <i class="fas fa-arrow-right"></i></span>
              </div>
            </a>
          ))}
        </div>

        {/* 표준화 진료 안내 */}
        <div class="std-care" style="margin-top:80px" data-reveal>
          <div class="std-care__head">
            <span class="eyebrow eyebrow--center">표준화된 진료</span>
            <h2>어느 원장님께 진료받으셔도<br /><span class="serif" style="color:var(--brand-2)">같은 기준의 진료</span></h2>
            <p>
              정원한의원은 8인의 한의사가 함께 진료하는 한의원입니다. 각 원장이 교통사고·추나,
              다이어트·소아, 부인과, 내과·뇌신경 등 주력 분야를 맡아 깊이를 더하고, 다인 체제에서도
              진료의 일관성을 지키기 위해 원내에서는 검증된 표준 치료 프로토콜을 적용합니다.
              어느 원장님께 진료받으시더라도 같은 기준의 진료를 받으실 수 있도록 노력하고 있습니다.
            </p>
          </div>
          <div class="std-care__grid">
            {[
              { icon: 'fa-user-doctor', title: '분야별 전문 진료', desc: '교통사고·추나, 다이어트·소아, 부인과, 내과·뇌신경 등 각 원장이 주력 분야를 맡습니다.' },
              { icon: 'fa-clipboard-check', title: '검증된 표준 프로토콜', desc: '원내에서 합의된 표준 치료 프로토콜을 적용해 진료의 일관성을 지킵니다.' },
              { icon: 'fa-equals', title: '같은 기준의 진료', desc: '어느 원장님께 진료받으시더라도 동일한 기준으로 진료받으실 수 있도록 노력합니다.' },
            ].map((f, i) => (
              <div class="std-care__item" data-reveal data-reveal-delay={String(i + 1)}>
                <div class="std-care__icon"><i class={`fas ${f.icon}`}></i></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div class="std-care__cta">
            <a href="/reservation" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 진료 예약하기</a>
          </div>
        </div>
      </div>
    </section>
  </Page>
)

export const DoctorDetailPage: FC<{ slug: string }> = ({ slug }) => {
  const d = getDoctor(slug)
  if (!d) {
    return (
      <Page title="의료진을 찾을 수 없습니다" description="요청하신 의료진 정보를 찾을 수 없습니다." path="/doctors">
        <PageHero title="의료진 정보를 찾을 수 없습니다" breadcrumb={[{ label: '의료진', href: '/doctors' }]} />
        <section class="section"><div class="wrap text-center"><a href="/doctors" class="btn btn-primary">의료진 목록</a></div></section>
      </Page>
    )
  }
  const txs = d.treatments.map((t) => getTreatment(t)).filter(Boolean)
  return (
    <Page
      title={`${d.name} ${d.title} — 오산 정원한의원`}
      description={metaTrim(`${CLINIC.nameFull} ${d.name} ${d.title}. ${d.specialty}. ${d.intro}`, 155)}
      path={`/doctors/${slug}`}
      ogType="profile"
      jsonLd={[
        personSchema(slug),
        breadcrumbSchema([
          { name: '홈', url: '/' },
          { name: '의료진', url: '/doctors' },
          { name: d.name, url: `/doctors/${slug}` },
        ]),
      ].filter(Boolean) as object[]}
    >
      <PageHero
        title={`${d.name} ${d.title}`}
        desc={d.motto ? `“${d.motto}”` : d.specialty}
        breadcrumb={[{ label: '의료진', href: '/doctors' }, { label: d.name }]}
      />
      <section class="section">
        <div class="wrap">
          <div class="doc-profile">
            <div class="doc-profile__photo" data-reveal>
              {d.photo ? (
                <img src={d.photo} alt={`${d.name} ${d.title}`} width="600" height="750" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover" />
              ) : (
                <div class="doc-portrait doc-portrait--full">
                  <span class="doc-portrait__mono">{d.name.charAt(0)}</span>
                  <i class="fas fa-user-doctor doc-portrait__ico"></i>
                  <div class="doc-portrait__info">
                    <strong>{d.name} <span>{d.title}</span></strong>
                    <em>{d.specialty}</em>
                  </div>
                </div>
              )}
            </div>
            <div data-reveal data-reveal-delay="1">
              <div class="article" style="margin-bottom:40px">
                <div class="answer" style="font-size:17px">{d.intro}</div>
              </div>

              <div class="cred-block">
                <h2 class="cred-block__title"><i class="fas fa-graduation-cap" style="margin-right:8px"></i>학력</h2>
                <ul>{d.education.map((e) => <li>{e}</li>)}</ul>
              </div>
              <div class="cred-block">
                <h2 class="cred-block__title"><i class="fas fa-briefcase-medical" style="margin-right:8px"></i>경력</h2>
                <ul>{d.career.map((e) => <li>{e}</li>)}</ul>
              </div>
              <div class="cred-block">
                <h2 class="cred-block__title"><i class="fas fa-certificate" style="margin-right:8px"></i>자격·학회 활동</h2>
                <ul>{d.memberships.map((e) => <li>{e}</li>)}</ul>
              </div>

              {d.papers && d.papers.length > 0 && (
                <div class="cred-block">
                  <h2 class="cred-block__title"><i class="fas fa-file-lines" style="margin-right:8px"></i>논문</h2>
                  <ul>{d.papers.map((e) => <li>{e}</li>)}</ul>
                </div>
              )}

              {d.research && d.research.length > 0 && (
                <div class="cred-block">
                  <h2 class="cred-block__title"><i class="fas fa-flask" style="margin-right:8px"></i>참여 연구</h2>
                  <ul>{d.research.map((e) => <li>{e}</li>)}</ul>
                </div>
              )}

              {/* 인링크: 주력 진료 */}
              <div class="cred-block">
                <h2 class="cred-block__title"><i class="fas fa-notes-medical" style="margin-right:8px"></i>주요 진료</h2>
                <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px">
                  {txs.map((t) => (
                    <a href={`/treatments/${t!.slug}`} style="background:var(--brand-soft);color:var(--brand);padding:9px 18px;border-radius:999px;font-size:14px;font-weight:700;transition:all .3s">
                      <i class={`fas ${t!.icon}`} style="margin-right:6px"></i>{t!.shortName}
                    </a>
                  ))}
                </div>
              </div>

              {/* 인링크: 치료 사례 */}
              <div class="cred-block">
                <h2 class="cred-block__title"><i class="fas fa-images" style="margin-right:8px"></i>치료 사례</h2>
                <p style="font-size:15px;color:var(--ink-2);margin:6px 0 12px">{d.name} 원장이 직접 진료한 치료 사례를 확인하실 수 있습니다.</p>
                <a href={`/cases/gallery?doctor=${d.slug}`} class="btn btn-light"><i class="fas fa-camera"></i> {d.name} 원장 치료 사례 보기</a>
              </div>

              <a href="/reservation" class="btn btn-primary" style="margin-top:24px"><i class="fas fa-calendar-check"></i> {d.name} 원장 진료 예약</a>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}
