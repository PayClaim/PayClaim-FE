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
const COMPANY = 'PT Contoh Sejahtera'
const LOGIN_URL = '/login'
const HELP_EMAIL = 'helpdesk@contoh.co.id'

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
    title: 'Klaim benefit',
    desc: 'Ajukan penggantian biaya kesehatan, kacamata, transportasi, dan benefit lain dengan lampiran kuitansi.',
    icon: Receipt,
  },
  {
    title: 'Saldo benefit jelas',
    desc: 'Lihat sisa saldo, batas, dan masa berlaku setiap benefit sebelum mengajukan.',
    icon: Gift,
  },
  {
    title: 'Proposal perjalanan dinas',
    desc: 'Susun proposal berisi tujuan, tanggal, anggaran, peserta, dan PIC dalam satu form.',
    icon: Plane,
  },
  {
    title: 'Persetujuan berjenjang',
    desc: 'Pengajuan melewati level persetujuan sesuai struktur atasan, lengkap dengan catatan dan waktu keputusan.',
    icon: CheckCircle2,
  },
  {
    title: 'Status transparan',
    desc: 'Pantau dari Submitted, Under Review, Approved atau Rejected, hingga Paid.',
    icon: FileText,
  },
  {
    title: 'Akses sesuai peran',
    desc: 'Karyawan, atasan, HR, dan Finance hanya melihat data yang menjadi tanggung jawabnya.',
    icon: ShieldCheck,
  },
]
const STEPS: [string, string][] = [
  [
    'Masuk',
    'Gunakan akun perusahaan. Benefit untuk jabatan dan departemen Anda sudah tampil otomatis.',
  ],
  [
    'Ajukan',
    'Isi klaim atau proposal perjalanan, lalu unggah bukti. Klaim perjalanan dikaitkan ke proposal.',
  ],
  [
    'Disetujui atasan',
    'Atasan menyetujui atau menolak per level dan dapat menulis catatan.',
  ],
  [
    'Dibayar',
    'Setelah semua level menyetujui, Finance memproses pembayaran dan status berubah menjadi Paid.',
  ],
]
const ROLES: [string, string][] = [
  [
    'Karyawan',
    'Mengajukan klaim dan proposal, memantau status, dan melihat sisa benefit.',
  ],
  [
    'Atasan',
    'Menyetujui atau menolak pengajuan tim pada levelnya, disertai catatan.',
  ],
  [
    'HR dan Finance',
    'Mengelola data karyawan dan benefit, memantau ringkasan klaim, dan memproses pembayaran.',
  ],
]
const FAQS: Faq[] = [
  {
    q: 'Siapa yang bisa memakai aplikasi ini?',
    a: `Seluruh karyawan aktif ${COMPANY}. Akses memakai akun perusahaan dan menu mengikuti peran Anda.`,
  },
  {
    q: 'Berapa lama klaim diproses?',
    a: 'Bergantung pada jumlah level persetujuan dan kecepatan masing-masing approver. Status terbaru selalu terlihat di halaman klaim.',
  },
  {
    q: 'Apa yang terjadi jika klaim saya ditolak?',
    a: 'Anda dapat melihat catatan dari approver yang menolak, lalu mengajukan kembali dengan perbaikan atau menghubungi HR.',
  },
  {
    q: 'Apakah proposal wajib dibuat sebelum berangkat dinas?',
    a: 'Ya, proposal diajukan dan disetujui lebih dulu. Klaim biaya perjalanan kemudian dikaitkan ke proposal tersebut.',
  },
  {
    q: 'File apa yang boleh dilampirkan?',
    a: 'Foto atau PDF bukti pembayaran seperti kuitansi, nota, atau tiket. Format dan ukuran mengikuti kebijakan perusahaan.',
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
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-sky-400 to-blue-600 text-base font-bold text-white">
            C
          </span>
          {APP}
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navigasi utama">
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
          <a href={LOGIN_URL} className={`${btnPrimary} ml-2`}>
            Masuk
          </a>
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
            Aplikasi internal {COMPANY} untuk reimbursement benefit dan proposal
            perjalanan dinas.
          </p>
        </div>
        <div>
          <p className="font-semibold">Bantuan</p>
          <p className={`mt-1 ${muted}`}>
            Kendala akses atau pertanyaan kebijakan:{' '}
            <a
              className="text-blue-600 hover:underline dark:text-blue-300"
              href={`mailto:${HELP_EMAIL}`}
            >
              {HELP_EMAIL}
            </a>
          </p>
        </div>
        <div>
          <p className="font-semibold">Halaman</p>
          <p className={`mt-1 ${muted}`}>
            <Link to="/">
              <button className="hover:underline">Beranda</button>
            </Link>{' '}
            ·{' '}
            <Link to="/about">
              <button className="hover:underline">Tentang</button>
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
                  Klaim benefit dan perjalanan dinas, tanpa tumpukan kertas.
                </h1>
                <p className={`mt-4 max-w-md ${muted}`}>
                  Ajukan penggantian biaya, susun proposal perjalanan, dan
                  pantau persetujuan sampai pembayaran dalam satu tempat.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={LOGIN_URL} className={`${btnPrimary} min-h-12 px-6`}>
                    Masuk dengan akun perusahaan
                  </a>
                  <a href="#cara-kerja" className={`${btnGhost} min-h-12 px-6`}>
                    Lihat cara kerja
                  </a>
                </div>
              </div>
              <div aria-label="Contoh tampilan" className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-900/70 dark:text-blue-200/70">
                  Needs your approval{' '}
                  <span className="ml-2 font-normal normal-case tracking-normal">
                    (contoh tampilan)
                  </span>
                </p>
                <ApprovalRow
                  title="Claims Need Your Approval"
                  desc="Klaim karyawan yang menunggu peninjauan."
                  count={4}
                />
                <ApprovalRow
                  title="Trip Proposals Need Your Approval"
                  desc="Proposal perjalanan dinas yang menunggu keputusan."
                  count={2}
                />
              </div>
            </section>
          </div>

          <Section id="fitur" title="Yang bisa Anda lakukan">
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

          <Section id="cara-kerja" title="Cara kerjanya" tint>
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

          <Section title="Untuk siapa">
            <div className="grid gap-4 md:grid-cols-3">
              {ROLES.map(([t, d]) => (
                <article key={t} className={`${card} p-5`}>
                  <h3 className="font-semibold">{t}</h3>
                  <p className={`mt-1 text-sm ${muted}`}>{d}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section title="Pertanyaan umum" tint>
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
              title="Siap mengajukan?"
              text="Masuk dan lihat benefit yang tersedia untuk Anda."
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
        Masuk sekarang
      </a>
    </section>
  )
}
