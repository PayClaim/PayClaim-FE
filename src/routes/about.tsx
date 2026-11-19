import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  FileText,
  Plane,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CtaBand, IconTile, LandingFooter, LandingHeader } from '.'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

const APP = 'CAKRA'
// const COMPANY = 'Perusahaan'
const HELP_EMAIL = 'servicedesk@mii.co.id'

const card =
  'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
const muted = 'text-slate-500 dark:text-slate-400'
const wrap = 'mx-auto w-full max-w-6xl px-5'

export function AboutPage() {
  const h2 = 'mb-3 mt-10 text-xl font-semibold tracking-tight first:mt-0'
  const p = `mb-3 ${muted}`
  const principles: [string, string, LucideIcon][] = [
    [
      'Transparent',
      'Status and the reasons behind decisions are clearly visible to the requester.',
      FileText,
    ],
    [
      'Role-based',
      'Everyone only sees the data that is relevant to them.',
      ShieldCheck,
    ],
    ['Traceable', 'Decision history is stored for auditing.', CalendarDays],
  ]

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <LandingHeader />
        <main>
          <div className={`${wrap} pt-8`}>
            <section className="rounded-3xl border border-blue-200 bg-linear-to-br from-blue-100 via-sky-50 to-blue-200 p-7 sm:p-10 dark:border-blue-900 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                About {APP}
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight">
                Handling claims and business trips should be simple.
              </h1>
              <p className={`mt-4 max-w-2xl ${muted}`}>
                {APP} is an internal company application that brings together
                two processes: employee benefit reimbursement and business trip
                proposals.
              </p>
            </section>
          </div>

          <div className={`${wrap} max-w-3xl py-12`}>
            <h2 className={h2}>Why this application was built</h2>
            <p className={p}>
              Previously, claim and business trip requests were scattered across
              forms, emails, and chat messages. Employees found it hard to know
              where their request stood, managers struggled to track their
              queue, and HR and Finance had to compile everything manually.
            </p>
            <p className={p}>
              {APP} brings it all together: one request, one history, and one
              approval path that every relevant party can see.
            </p>

            <h2 className={h2}>Two main modules</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className={`${card} p-5`}>
                <IconTile icon={Receipt} />
                <h3 className="mt-3 font-semibold">Benefit reimbursement</h3>
                <p className={`mt-1 text-sm ${muted}`}>
                  Employees submit claims against the benefits they are entitled
                  to. Limits follow the rules for each department and position,
                  and the balance decreases as claims are approved.
                </p>
              </article>
              <article className={`${card} p-5`}>
                <IconTile icon={Plane} />
                <h3 className="mt-3 font-semibold">Trip proposal</h3>
                <p className={`mt-1 text-sm ${muted}`}>
                  Business trips are submitted as proposals containing the
                  destination, schedule, budget, participants, and PIC. Once
                  approved, trip expenses are claimed and linked to that
                  proposal.
                </p>
              </article>
            </div>

            <h2 className={h2}>How approval works</h2>
            <ol className={`mb-3 list-decimal space-y-2 pl-5 ${muted}`}>
              <li>
                The request goes to the direct manager as the first level.
              </li>
              <li>
                If there are further levels, the request is forwarded in
                sequence. Each approver can approve or reject and add notes.
              </li>
              <li>
                A rejection at any level stops the process, and the reason is
                visible to the requester.
              </li>
              <li>
                Once all levels have approved, the request is ready for payment
                processing by Finance.
              </li>
            </ol>
            <p className={p}>
              Every decision is stored along with the approver's name, level,
              notes, and time.
            </p>

            <h2 className={h2}>Our principles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {principles.map(([t, d, Icon]) => (
                <article key={t} className={`${card} p-5`}>
                  <IconTile icon={Icon} />
                  <h3 className="mt-3 font-semibold">{t}</h3>
                  <p className={`mt-1 text-sm ${muted}`}>{d}</p>
                </article>
              ))}
            </div>

            <h2 className={h2}>Data and privacy</h2>
            <p className={p}>
              The application stores request data, supporting attachments, and
              approval history. Access is restricted by role, and attachments
              are used only to verify claims.
            </p>

            <h2 className={h2}>Need help?</h2>
            <p className={p}>
              Contact{' '}
              <a
                className="text-blue-600 hover:underline dark:text-blue-300"
                href={`mailto:${HELP_EMAIL}`}
              >
                {HELP_EMAIL}
              </a>
              . The official rules on benefit amounts and business travel follow
              the company policy currently in effect.
            </p>
          </div>

          <div className={`${wrap} pb-14`}>
            <CtaBand
              title={`Start using ${APP}`}
              text="Sign in with your company account."
            />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
