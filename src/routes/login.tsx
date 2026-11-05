import { Button } from '#/components/ui/button'
import { useAuth } from '#/hooks/auth.hook'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  // const q = Route.useSearch()
  const { logout, login, user } = useAuth()

  const clickLogin = () => {
    login()
    navigate({
      to: '/dashboard',
    })
  }

  const clickHandle3 = () => {
    console.log('C')
    logout()
  }
  const clickHandle2 = () => {
    console.log(user)
  }

  return (
    <div>
      Wellcome to login
      <Button onClick={clickLogin}>Login</Button>
      <Button onClick={clickHandle2}>print</Button>
      <Button onClick={clickHandle3}>logout</Button>
    </div>
  )
}
