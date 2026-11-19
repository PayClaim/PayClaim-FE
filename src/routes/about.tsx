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
const COMPANY = 'PT Contoh Sejahtera'
const HELP_EMAIL = 'helpdesk@contoh.co.id'

const card =
  'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
const muted = 'text-slate-500 dark:text-slate-400'
const wrap = 'mx-auto w-full max-w-6xl px-5'

export function AboutPage() {
  const h2 = 'mb-3 mt-10 text-xl font-semibold tracking-tight first:mt-0'
  const p = `mb-3 ${muted}`
  const principles: [string, string, LucideIcon][] = [
    [
      'Transparan',
      'Status dan alasan keputusan terlihat jelas bagi pengaju.',
      FileText,
    ],
    [
      'Sesuai peran',
      'Setiap orang hanya melihat data yang menjadi bagiannya.',
      ShieldCheck,
    ],
    [
      'Dapat ditelusuri',
      'Riwayat keputusan tersimpan untuk audit.',
      CalendarDays,
    ],
  ]

  return (
    <>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <LandingHeader />
        <main>
          <div className={`${wrap} pt-8`}>
            <section className="rounded-3xl border border-blue-200 bg-linear-to-br from-blue-100 via-sky-50 to-blue-200 p-7 sm:p-10 dark:border-blue-900 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Tentang {APP}
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight">
                Mengurus klaim dan perjalanan dinas seharusnya sederhana.
              </h1>
              <p className={`mt-4 max-w-2xl ${muted}`}>
                {APP} adalah aplikasi internal {COMPANY} yang menyatukan dua
                proses: penggantian biaya benefit karyawan dan proposal
                perjalanan dinas.
              </p>
            </section>
          </div>

          <div className={`${wrap} max-w-3xl py-12`}>
            <h2 className={h2}>Mengapa aplikasi ini dibuat</h2>
            <p className={p}>
              Sebelumnya pengajuan klaim dan perjalanan dinas tersebar di
              formulir, email, dan pesan singkat. Karyawan sulit mengetahui
              posisi pengajuannya, atasan sulit melacak antrean, dan HR serta
              Finance harus merekap manual.
            </p>
            <p className={p}>
              {APP} memusatkan semuanya: satu pengajuan, satu riwayat, dan satu
              jalur persetujuan yang bisa dilihat pihak yang berkepentingan.
            </p>

            <h2 className={h2}>Dua modul utama</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className={`${card} p-5`}>
                <IconTile icon={Receipt} />
                <h3 className="mt-3 font-semibold">Reimbursement benefit</h3>
                <p className={`mt-1 text-sm ${muted}`}>
                  Karyawan mengajukan klaim terhadap benefit yang menjadi
                  haknya. Batas mengikuti ketentuan departemen dan jabatan, dan
                  saldo berkurang sesuai klaim yang disetujui.
                </p>
              </article>
              <article className={`${card} p-5`}>
                <IconTile icon={Plane} />
                <h3 className="mt-3 font-semibold">Trip proposal</h3>
                <p className={`mt-1 text-sm ${muted}`}>
                  Perjalanan dinas diajukan sebagai proposal berisi tujuan,
                  jadwal, anggaran, peserta, dan PIC. Setelah disetujui, biaya
                  perjalanan diklaim dan dikaitkan ke proposal itu.
                </p>
              </article>
            </div>

            <h2 className={h2}>Bagaimana persetujuan bekerja</h2>
            <ol className={`mb-3 list-decimal space-y-2 pl-5 ${muted}`}>
              <li>Pengajuan masuk ke atasan langsung sebagai level pertama.</li>
              <li>
                Jika ada level berikutnya, pengajuan diteruskan berurutan.
                Setiap approver dapat menyetujui atau menolak dan menulis
                catatan.
              </li>
              <li>
                Penolakan di level mana pun menghentikan proses, dan alasannya
                terlihat oleh pengaju.
              </li>
              <li>
                Setelah semua level menyetujui, pengajuan siap diproses
                pembayarannya oleh Finance.
              </li>
            </ol>
            <p className={p}>
              Setiap keputusan disimpan bersama nama approver, level, catatan,
              dan waktunya.
            </p>

            <h2 className={h2}>Prinsip yang kami pegang</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {principles.map(([t, d, Icon]) => (
                <article key={t} className={`${card} p-5`}>
                  <IconTile icon={Icon} />
                  <h3 className="mt-3 font-semibold">{t}</h3>
                  <p className={`mt-1 text-sm ${muted}`}>{d}</p>
                </article>
              ))}
            </div>

            <h2 className={h2}>Data dan privasi</h2>
            <p className={p}>
              Aplikasi menyimpan data pengajuan, lampiran bukti, dan riwayat
              persetujuan. Akses dibatasi sesuai peran, dan lampiran hanya
              dipakai untuk verifikasi klaim.
            </p>

            <h2 className={h2}>Butuh bantuan?</h2>
            <p className={p}>
              Hubungi{' '}
              <a
                className="text-blue-600 hover:underline dark:text-blue-300"
                href={`mailto:${HELP_EMAIL}`}
              >
                {HELP_EMAIL}
              </a>
              . Ketentuan resmi besaran benefit dan perjalanan dinas mengikuti
              kebijakan perusahaan yang berlaku.
            </p>
          </div>

          <div className={`${wrap} pb-14`}>
            <CtaBand
              title={`Mulai gunakan ${APP}`}
              text="Masuk dengan akun perusahaan Anda."
            />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
