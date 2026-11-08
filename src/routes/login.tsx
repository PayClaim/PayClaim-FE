import { Button } from '#/components/ui/button'
import { useAuth, useAuthAction } from '#/hooks/auth.hook'
import { login, logout } from '#/lib/auth'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (s: { redirect?: string }) => {
    return {
      redirect: s.redirect as string | null,
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const q = Route.useSearch()
  const { logout, login } = useAuthAction()

  const clickLogin = () => {
    login()
    navigate({
      to: q.redirect ? q.redirect : '/dashboard',
    })
  }

  const clickHandle3 = () => {
    console.log('C')
    logout()
  }

  return (
    <div>
      Wellcome to login
      <Button onClick={clickLogin}>Login</Button>
      <Button onClick={clickHandle3}>logout</Button>
    </div>
  )
}
