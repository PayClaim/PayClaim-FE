import { loginForm } from '#/features/auth/forms/forms'
import { ErrorMessages } from '#/components/forms/ErrorMessage'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import {
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
} from 'lucide-react'
import { useState } from 'react'
import type React from 'react'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (s: { redirect?: string }) => {
    return {
      redirect: s.redirect as string | null,
    }
  },
})

function RouteComponent() {
  const form = loginForm()
  const [showPassword, setShowPassword] = useState(false)
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      setTimeout(() => {
        form.handleSubmit()
      }, 0)
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-white">
      {/* Sisi Kiri: Brand Canvas dengan Foto Gedung MII (Desktop Only) */}
      <section className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-slate-950 text-slate-100 flex-col justify-between p-10 xl:p-14 border-r border-slate-800 relative overflow-hidden select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/gedung.jpg"
          alt="MII Building"
          width={800}
          height={1000}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center opacity-100 brightness-100 contrast-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/80" />
      </div>

      {/* Brand Header */}
      <header className="relative z-10 flex items-center gap-3">
        <div className="w-35 h-35 rounded-xl flex items-center justify-center shadow-xs shrink-0">
          <img
            src="/logo-mii.png"
            alt="PT Mitra Integrasi Informatika"
            width={50}
            height={50}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <span className="text-3xl font-bold tracking-tight text-white block leading-none">
            PayClaim
          </span>
          <span className="text-sm text-slate-400 font-medium">
            PT Mitra Integrasi Informatika
          </span>
        </div>
      </header>

      {/* Headline & Subheadline */}
      <div className="relative z-10 my-auto py-4 -translate-y-8 space-y-4 max-w-lg">
        <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Enterprise Claim &amp; Reimbursement Portal
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Platform terintegrasi untuk pengajuan, verifikasi, dan penyelesaian klaim biaya operasional, perjalanan dinas, serta tunjangan karyawan.
        </p>
      </div>

      {/* Corporate Legal & Security Footer */}
      <footer className="relative z-10 pt-6 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
        <p className="flex items-center gap-1.5 font-medium text-slate-300">
          <Lock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          Akses Terbatas Internal Perusahaan
        </p>
        <p className="text-slate-500 leading-normal">
          &copy; {new Date().getFullYear()} PT Mitra Integrasi Informatika. Member of Metrodata Group.
        </p>
      </footer>
    </section>

      {/* Sisi Kanan: Form Area (Clean, Focused, Accessible) */}
      <section className="flex-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[360px] mx-auto space-y-7">
          {/* Mobile Header (Hanya tampil pada layar < lg) */}
          <div className="lg:hidden flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/logo-mii.png"
                alt="PT Mitra Integrasi Informatika"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-none">
                PayClaim
              </span>
              <span className="text-xs text-slate-500 font-medium">
                PT Mitra Integrasi Informatika
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign In
            </h1>
            <p className="text-sm text-slate-500">
              Masuk dengan kredensial akun korporat Anda.
            </p>
          </div>

          {/* Form Controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
              }
              setTimeout(() => {
                form.handleSubmit()
              }, 0)
            }}
            onKeyDown={handleKeyDown}
            className="space-y-4"
          >
            {/* Field: Username */}
            <form.Field name="username">
              {(field) => (
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-username"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Username
                  </label>
                  <input
                    id="login-username"
                    name={field.name}
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan username Anda"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-10 px-3.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <ErrorMessages errors={field.state.meta.errors} />
                  )}
                </div>
              )}
            </form.Field>

            {/* Field: Password */}
            <form.Field name="password">
              {(field) => (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotDialogOpen(true)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name={field.name}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Masukkan password Anda"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full h-10 px-3.5 pe-10 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <ErrorMessages errors={field.state.meta.errors} />
                  )}
                </div>
              )}
            </form.Field>

            {/* Tombol Submit */}
            <div className="pt-2">
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Masuk ke PayClaim</span>
                    )}
                  </button>
                )}
              </form.Subscribe>
            </div>
          </form>

          {/* Help & Support Note */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" /> Butuh bantuan?
            </span>
            <button
              type="button"
              onClick={() => setForgotDialogOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
            >
              Hubungi IT Service Desk
            </button>
          </div>

          {/* Mobile Copyright */}
          <p className="text-center text-xs text-slate-400 lg:hidden pt-2">
            &copy; {new Date().getFullYear()} PT Mitra Integrasi Informatika
          </p>
        </div>
      </section>

      {/* Forgot Password / Corporate Account Support Dialog */}
      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bantuan Kredensial Akun</DialogTitle>
            <DialogDescription>
              Informasi pengaturan ulang kata sandi akun domain korporat PT Mitra Integrasi Informatika.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-sm text-slate-600 leading-relaxed">
            <p>
              Akun PayClaim terhubung langsung dengan domain akun korporat Anda. Untuk alasan keamanan, pengaturan ulang kata sandi dikelola secara terpusat:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                Jika Anda memiliki akses ke portal SSO, silakan lakukan reset melalui <strong>Self-Service Password Reset (SSPR)</strong>.
              </li>
              <li>
                Atau hubungi <strong>IT Service Desk MII</strong> melalui email internal di{' '}
                <a
                  href="mailto:servicedesk@mii.co.id"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  servicedesk@mii.co.id
                </a>{' '}
                atau ekstensi telepon <strong>1500</strong>.
              </li>
            </ul>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Tutup
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
