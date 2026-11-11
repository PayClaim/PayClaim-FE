import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/approvals/')({
  beforeLoad: () => {
    throw redirect({
      to: '/approvals/claims',
    })
  },
})
