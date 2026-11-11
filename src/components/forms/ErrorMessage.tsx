import { CircleAlert } from 'lucide-react'

export function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string } | undefined>
}) {
  if (!errors || errors.length === 0) return null

  // Deduplicate messages so identical warnings never repeat
  const uniqueMessages: string[] = []
  for (const error of errors) {
    if (!error) continue
    const message = typeof error === 'string' ? error : error?.message
    if (message && !uniqueMessages.includes(message)) {
      uniqueMessages.push(message)
    }
  }

  if (uniqueMessages.length === 0) return null

  return (
    <div className="mt-1.5 space-y-1">
      {uniqueMessages.map((message) => (
        <div
          key={message}
          className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          <CircleAlert className="w-3.5 h-3.5 shrink-0 text-rose-500" aria-hidden="true" />
          <span>{message}</span>
        </div>
      ))}
    </div>
  )
}
