import { loginForm } from '#/features/auth/forms/forms'
import { createFileRoute } from '@tanstack/react-router'
import {
  CheckCircle2,
  Lock,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react'
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
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-background">
      {/* Left Column: Brand Identity & Enterprise Information (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-slate-900 text-slate-100 flex-col justify-between p-10 xl:p-14 relative border-r border-slate-800">
        {/* Subtle Decorative Ambient Layer with strict purpose (Brand Contrast) */}
        <div
          className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Brand Header */}
        <header className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/logo-mii.png"
                alt="Mitra Integrasi Informatika"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                PayClaim
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Mitra Integrasi Informatika
              </span>
            </div>
          </div>
        </header>

        {/* Value Proposition & Workflow Architecture */}
        <div className="relative z-10 my-auto py-10 space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Enterprise Governance
            </span>
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Employee Claim & Reimbursement Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              A unified platform to submit, verify, and settle operational expenses,
              business travel proposals, and employee benefit claims.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Two-Tier Approval Workflow
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Structured authorization by Direct Manager (Level 1) and Finance Verification (Level 2).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <ReceiptText className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Transparent Digital Audit
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Real-time quota monitoring, receipt document attachment preview, and settlement history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Corporate Footer */}
        <footer className="relative z-10 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} PT Mitra Integrasi Informatika. All rights reserved.</p>
        </footer>
      </section>

      {/* Right Column: Authentication Form */}
      <section className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-slate-50/50 dark:bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header (Shown on screens < lg) */}
          <div className="lg:hidden flex items-center gap-3 pb-2 border-b border-border/80">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-border shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/logo-mii.png"
                alt="Mitra Integrasi Informatika"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-heading block leading-none">
                PayClaim
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Mitra Integrasi Informatika
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1.5 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-heading">
                Sign In
              </h2>
              <p className="text-sm text-muted-foreground leading-normal">
                Enter your authorized username and password to continue.
              </p>
            </div>

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
              <form.AppField name="username">
                {(field) => (
                  <field.TextField
                    placeholder="Enter your username"
                    label="Username"
                    autoComplete="username"
                    onKeyDown={handleKeyDown}
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <field.TextField
                    type="password"
                    placeholder="Enter your password"
                    label="Password"
                    autoComplete="current-password"
                    onKeyDown={handleKeyDown}
                  />
                )}
              </form.AppField>

              <div className="pt-2">
                <form.AppForm>
                  <form.FormButton
                    className="w-full h-11 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-hidden"
                    label="Sign In to Portal"
                  />
                </form.AppForm>
              </div>
            </form>

            {/* Security Notice Box */}
            <div className="rounded-lg bg-muted/40 border border-border/80 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Authorized access only. By continuing, you agree to comply with PT Mitra Integrasi Informatika company security and data governance policies.
              </span>
            </div>
          </div>

          {/* Mobile Copyright */}
          <p className="text-center text-xs text-muted-foreground lg:hidden">
            &copy; {new Date().getFullYear()} PT Mitra Integrasi Informatika. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  )
}
