import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, CheckCircle2, Clock, Gift, ShieldAlert, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/_app/benefits/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: benefits = [],
    isLoading,
    isError,
  } = useGetAllEmployeeBenefitsQuery()

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            My Benefits
          </h1>
          <p className="text-sm text-muted-foreground">
            Daftar alokasi kuota tunjangan & plafon aktif yang dapat Anda klaim
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-card p-12 rounded-2xl border border-border text-center text-muted-foreground">
          Memuat daftar benefit Anda...
        </div>
      ) : isError ? (
        <div className="bg-card p-8 rounded-2xl border border-destructive text-destructive text-center">
          Gagal memuat alokasi benefit Anda. Pastikan koneksi backend aktif.
        </div>
      ) : benefits.length === 0 ? (
        <div className="bg-card p-12 rounded-2xl border border-border text-center space-y-3">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-heading">
            Belum Ada Alokasi Benefit
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Akun Anda belum memiliki kuota benefit aktif yang dialokasikan oleh HR / Admin. Hubungi departemen HR untuk informasi lebih lanjut.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.employeeBenefitId}
              className="bg-card rounded-2xl border border-border p-6 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-colors"
            >
              <div className="space-y-4">
                {/* Header Card: Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {benefit.categoryName || 'General'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      benefit.isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {benefit.isActive ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Aktif
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3 w-3" /> Tidak Aktif
                      </>
                    )}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-lg text-heading">
                    {benefit.benefitName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Periode: {benefit.periodType}</span>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-xs uppercase font-medium text-muted-foreground">
                    Sisa Kuota Saldo
                  </span>
                  <div className="text-2xl font-black text-primary">
                    {idNumberFormatter.format(benefit.balance)}
                  </div>
                </div>
              </div>

              {/* Validity Footer */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {benefit.startDate} s/d {benefit.endDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
