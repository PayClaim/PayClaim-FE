import { createFileRoute, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Gift,
  Plane,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

/* ====== Konfigurasi (ubah sesuai perusahaan) ====== */
const APP = 'CAKRA'
const LOGIN_URL = '/login'
const HELP_EMAIL = 'servicedesk@mii.co.id'

interface Feature {
  title: string
  desc: string
  icon: LucideIcon
}
interface Faq {
  q: string
  a: string
}

const FEATURES: Feature[] = [
  {
    title: 'Benefit claim',
    desc: 'Request reimbursement for medical, eyeglass, transport, and other benefits with invoice attachment.',
    icon: Receipt,
  },
  {
    title: 'Clear benefit balance',
    desc: 'View the remaining balance, limit, and expired period of every benefit before creating a request.',
    icon: Gift,
  },
  {
    title: 'Business trip proposals',
    desc: 'Create trip proposals with destination, date, budget, and participants in one form.',
    icon: Plane,
  },
  {
    title: 'Multi-level approval',
    desc: 'Approve through multiple level according to company structure, with note and timestamp.',
    icon: CheckCircle2,
  },
  {
    title: 'Transparent status',
    desc: 'View request status from Submitted, Under Review, Approved or Rejected, and Paid.',
    icon: FileText,
  },
  {
    title: 'Role-based access',
    desc: 'Employee, Manager, and Finance can access according to its roles.',
    icon: ShieldCheck,
  },
]
const STEPS: [string, string][] = [
  ['Login', 'Use company account, and view your available benefit to claim.'],
  ['Request', 'Fill the claim or trip proposal form, and upload the invoice.'],
  [
    'Approved by manager and finance',
    'Manager approve or reject the request complete with note.',
  ],
  [
    'Paid',
    'After the request approved, finance will process the payment, and status will change to Paid.',
  ],
]
const ROLES: [string, string][] = [
  [
    'Employee',
    'Submit claims and proposals, track their status, and view remaining benefits.',
  ],
  ['Manager', 'Approve or reject team requests at their level, with notes.'],
  [
    'HR and Finance',
    'Manage employee and benefit data, monitor claim summaries, and process payments.',
  ],
]
const FAQS: Faq[] = [
  {
    q: 'Who can use this application?',
    a: `All active employees of company. Access uses your company account, and the menu follows your role.`,
  },
  {
    q: 'How long does it take to process a claim?',
    a: 'It depends on the number of approval levels and how quickly each approver responds. The latest status is always visible on the claims page.',
  },
  {
    q: 'What happens if my claim is rejected?',
    a: 'You can see the notes from the approver who rejected it, then resubmit with corrections or contact HR.',
  },
  {
    q: 'Is a proposal required before a business trip?',
    a: 'Yes, the proposal must be submitted and approved first. Trip expense claims are then linked to that proposal.',
  },
  {
    q: 'What files can I attach?',
    a: 'Photos or PDFs of proof of payment, such as receipts, invoices, or tickets. Format and size follow company policy.',
  },
]

/* ====== Token tema (mengikuti tampilan dashboard CAKRA) ====== */
const card =
  'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
const muted = 'text-slate-500 dark:text-slate-400'
const wrap = 'mx-auto w-full max-w-6xl px-5'
const btn =
  'inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
const btnPrimary = `${btn} bg-blue-600 text-white hover:bg-blue-700`
const btnGhost = `${btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`

export function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  )
}

function Section({
  id,
  title,
  tint,
  children,
}: {
  id?: string
  title: string
  tint?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className={tint ? 'bg-slate-50 dark:bg-slate-900/40' : ''}>
      <div className={`${wrap} py-14`}>
        <h2 className="mb-7 text-2xl font-semibold tracking-tight">{title}</h2>
        {children}
      </div>
    </section>
  )
}

// Landing header untuk landing dan aboout page
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className={`${wrap} flex items-center justify-between py-3`}>
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-semibold"
        >
          <img
            src="/logo-mii.png"
            alt="Logo aplikasi"
            className="w-9 h-9 size-full object-contain"
          />
          {APP}
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <Link
            to="/"
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${muted} hover:text-slate-900 dark:hover:text-white`}
            activeProps={{
              className:
                'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
            }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${muted} hover:text-slate-900 dark:hover:text-white`}
            activeProps={{
              className:
                'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
            }}
          >
            About
          </Link>
          <Link
            to="/login"
            className={`${btnPrimary} ml-2`}
            search={{ redirect: null }}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className={`${wrap} grid gap-8 py-10 text-sm sm:grid-cols-3`}>
        <div>
          <p className="font-semibold">{APP}</p>
          <p className={`mt-1 ${muted}`}>
            Internal company app for benefit and business trip reimbursements
          </p>
        </div>
        <div>
          <p className="font-semibold">Help</p>
          <p className={`mt-1 ${muted}`}>
            Need help about access or policy related:
            <a
              className="text-blue-600 hover:underline dark:text-blue-300"
              href={`mailto:${HELP_EMAIL}`}
            >
              {HELP_EMAIL}
            </a>
          </p>
        </div>
        <div>
          <p className="font-semibold">Pages</p>
          <p className={`mt-1 ${muted}`}>
            <Link to="/">
              <button className="hover:underline">Home</button>
            </Link>{' '}
            ·{' '}
            <Link to="/about">
              <button className="hover:underline">About</button>
            </Link>
          </p>
        </div>
      </div>
      <p
        className={`border-t border-slate-200 py-4 text-center text-xs dark:border-slate-800 ${muted}`}
      >
        © 2026 {APP}. All rights reserved.
      </p>
    </footer>
  )
}

/* ====== Landing ====== */
function ApprovalRow({
  title,
  desc,
  count,
}: {
  title: string
  desc: string
  count: number
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-700 dark:bg-amber-950/40">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
          {desc}
        </p>
      </div>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-200 text-xl font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
        {count}
      </span>
    </div>
  )
}

export function LandingPage() {
  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <LandingHeader />
        <main>
          <div className={`${wrap} pt-8`}>
            <section className="grid items-center gap-8 rounded-3xl border border-blue-200 bg-linear-to-br from-blue-100 via-sky-50 to-blue-200 p-7 sm:p-10 lg:grid-cols-2 dark:border-blue-900 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
              <div>
                <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Claims the benefits and business trips, without any stack of
                  papers.
                </h1>
                <p className={`mt-4 max-w-md ${muted}`}>
                  Request for reimbursements, arrange trip proposals, and view
                  the approval status, until payment in one place.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={LOGIN_URL} className={`${btnPrimary} min-h-12 px-6`}>
                    Login with company account
                  </a>
                  <a
                    href="#how-it-works"
                    className={`${btnGhost} min-h-12 px-6`}
                  >
                    How it works
                  </a>
                </div>
              </div>
              <div aria-label="Example display" className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/70 dark:text-blue-200/70">
                  Needs your approval{' '}
                  <span className="ml-2 font-normal normal-case tracking-normal">
                    (examples)
                  </span>
                </p>
                <ApprovalRow
                  title="Claims Need Your Approval"
                  desc="Employee's claims waiting for review."
                  count={4}
                />
                <ApprovalRow
                  title="Trip Proposals Need Your Approval"
                  desc="Trip proposal waiating for your decision."
                  count={2}
                />
              </div>
            </section>
          </div>

          <Section id="features" title="What can You do">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className={`${card} p-5 transition hover:border-blue-300 dark:hover:border-blue-700`}
                >
                  <div className="flex items-start justify-between">
                    <IconTile icon={f.icon} />
                    <ArrowUpRight
                      className="h-4 w-4 text-slate-400"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className={`mt-1 text-sm ${muted}`}>{f.desc}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section id="how-it-works" title="How it works" tint>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{t}</h3>
                    <p className={`mt-1 text-sm ${muted}`}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Who is this for">
            <div className="grid gap-4 md:grid-cols-3">
              {ROLES.map(([t, d]) => (
                <article key={t} className={`${card} p-5`}>
                  <h3 className="font-semibold">{t}</h3>
                  <p className={`mt-1 text-sm ${muted}`}>{d}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section title="FAQS" tint>
            <div className="max-w-3xl space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className={`${card} group px-5`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-medium">
                    {f.q}
                    <span
                      className="text-slate-400 transition group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className={`pb-4 text-sm ${muted}`}>{f.a}</p>
                </details>
              ))}
            </div>
          </Section>

          <div className={`${wrap} py-14`}>
            <CtaBand
              title="Ready to claims?"
              text="Login and see all the benefits available for you."
            />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  )
}

export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-3xl bg-linear-to-br from-blue-600 to-blue-800 px-6 py-12 text-center text-white">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-blue-100">{text}</p>
      <a
        href={LOGIN_URL}
        className={`${btn} mt-6 min-h-12 bg-white px-6 text-blue-700 hover:bg-blue-50`}
      >
        Login now
      </a>
    </section>
  )
}
