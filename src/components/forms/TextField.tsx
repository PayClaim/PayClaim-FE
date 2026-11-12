import { useSelector } from '@tanstack/react-form'
import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, FileText, FileUp, X } from 'lucide-react'
import { cn } from 'cn'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useFieldContext } from '#/hooks/demo.form-context'
import { ErrorMessages } from './ErrorMessage'

interface TextFieldProps {
  label: string
  placeholder?: string
  type?: string
  autoComplete?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  disabled?: boolean
}

const errorInputClasses =
  'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'

export function useFieldStatus(field: any) {
  const isTouched = useSelector(field.store, (state: any) => state.meta.isTouched)
  const errors = useSelector(field.store, (state: any) => state.meta.errors)
  const errorMap = useSelector(field.store, (state: any) => state.meta.errorMap)
  const submissionAttempts = useSelector(
    field.form?.store || field.store,
    (state: any) => state.submissionAttempts ?? 0,
  )

  const rawErrors = errors || []
  const uniqueErrors: string[] = []
  for (const err of rawErrors) {
    if (!err) continue
    const msg = typeof err === 'string' ? err : err?.message
    if (msg && !uniqueErrors.includes(msg)) {
      uniqueErrors.push(msg)
    }
  }

  const hasError =
    uniqueErrors.length > 0 &&
    Boolean(isTouched || submissionAttempts > 0 || errorMap?.onSubmit)
  return { hasError, errors: uniqueErrors }
}

export function TextField({
  label,
  placeholder,
  type = 'text',
  autoComplete,
  onKeyDown,
  disabled = false,
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

  const field = useFieldContext<string>()
  const { hasError, errors } = useFieldStatus(field)

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          className={cn(
            'bg-input border border-border transition-all',
            isPassword && 'pe-10',
            hasError && errorInputClasses,
          )}
          type={effectiveType}
          autoComplete={autoComplete}
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        {isPassword && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function NumberField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<number>()
  const { hasError, errors } = useFieldStatus(field)

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>
      <Input
        type="number"
        className={cn(
          'bg-input border border-border transition-all',
          hasError && errorInputClasses,
        )}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
interface CurrencyFieldProps {
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
  max?: number
}

export function CurrencyField({
  label,
  placeholder = '0',
  disabled,
  className,
  max,
}: CurrencyFieldProps) {
  const field = useFieldContext<number>()
  const { hasError, errors } = useFieldStatus(field)
  const [limitWarning, setLimitWarning] = useState(false)

  const formatDots = (n: number | null | undefined): string => {
    if (n === null || n === undefined || n === 0 || isNaN(n)) return ''
    return new Intl.NumberFormat('id-ID').format(n)
  }

  const [displayValue, setDisplayValue] = useState<string>(() =>
    formatDots(field.state.value),
  )

  useEffect(() => {
    const formatted = formatDots(field.state.value)

    if (field.state.value === 0 && displayValue === '') {
      return
    }

    if (formatted !== displayValue) {
      setDisplayValue(formatted)
    }
  }, [field.state.value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawDigits = e.target.value.replace(/\D/g, '')

  if (!rawDigits) {
    setLimitWarning(false)
    setDisplayValue('')
    field.handleChange(0)
    return
  }

  const num = Number(rawDigits)

  // Tolak input jika melebihi batas maksimal.
  if (max !== undefined && num > max) {
    setLimitWarning(true)
    return
  }

  setLimitWarning(false)

  const formatted = new Intl.NumberFormat('id-ID').format(num)

  setDisplayValue(formatted)
  field.handleChange(num)
}

  return (
    <div className="my-4">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>

      <div className="relative">
        <span
          className={cn(
            'absolute inset-y-0 start-0 flex items-center ps-3 font-semibold text-sm pointer-events-none select-none transition-colors',
            hasError ? 'text-rose-500' : 'text-muted-foreground',
          )}
        >
          Rp
        </span>

        <Input
          className={cn(
            'bg-input border border-border ps-10 font-medium transition-all',
            hasError && errorInputClasses,
            className,
          )}
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onBlur={field.handleBlur}
          onChange={handleInputChange}
        />
      </div>

      {limitWarning && max !== undefined && (
        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          Maximum Accommodation Amount is Rp{' '}
          {new Intl.NumberFormat('id-ID').format(max)}.
        </p>
      )}

      {hasError && <ErrorMessages errors={errors} />}
    </div>
    
  )
}

export function FileInput({
  label,
  accept = 'image/*,.pdf,application/pdf',
}: TextFieldProps & { accept?: string }) {
  const field = useFieldContext<File | null>()
  const { hasError, errors } = useFieldStatus(field)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const selectedFile = field.state.value

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const handleFileChange = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      field.setMeta((prev: any) => ({
        ...prev,
        isTouched: true,
        errorMap: {
          ...prev?.errorMap,
          onChange: 'Ukuran file tidak boleh melebihi 5 MB.',
        },
      }))
      field.handleChange(null)
      return
    }
    field.handleChange(file)
    field.handleBlur()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] || null
    handleFileChange(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="my-2">
      <Label
        htmlFor={label}
        className={cn(
          'mb-2 text-sm font-semibold transition-colors block',
          hasError ? 'text-rose-600 dark:text-rose-400' : 'text-(--sea-ink)',
        )}
      >
        {label}
      </Label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFileChange(file)
        }}
      />

      {/* Jika file sudah dipilih: Tampilkan Kartu Pratinjau */}
      {selectedFile ? (
        <div
          className={cn(
            'flex items-center justify-between gap-3 p-3 rounded-xl border bg-muted/20 dark:bg-muted/10 transition-colors',
            hasError ? 'border-rose-500' : 'border-border',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="w-12 h-12 object-cover rounded-lg border border-border shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                <FileText className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate max-w-[260px] sm:max-w-[340px]">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                  {selectedFile.name.split('.').pop() || 'FILE'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-primary hover:underline px-2 py-1 cursor-pointer"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={() => {
                handleFileChange(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Hapus file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Jika belum ada file: Dropzone interaktif */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center bg-card hover:bg-muted/30 group',
            isDragging
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : hasError
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                : 'border-border/80 hover:border-primary/60',
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
            <FileUp className="w-4 h-4" />
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground">
              <span className="text-primary hover:underline">Klik untuk unggah</span>{' '}
              atau tarik & lepas file ke sini
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Mendukung PDF, PNG, JPG, WEBP (Maksimal 5 MB)
            </p>
          </div>
        </div>
      )}

      {hasError && <ErrorMessages errors={errors} />}
    </div>
  )
}
