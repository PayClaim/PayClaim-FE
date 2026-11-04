export function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="mt-1 text-sm font-semibold text-red-600"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}
