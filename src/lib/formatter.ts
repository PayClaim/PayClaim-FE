export const usDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'medium',
})

export const idNumberFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
})
