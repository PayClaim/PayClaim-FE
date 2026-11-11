import { Link } from '@tanstack/react-router'
import { Button } from '../ui/button'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen w-full flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <h1 className="mb-4 text-7xl font-extrabold text-center">404</h1>
          <p>Your page you are looking for did not exists</p>
        </div>
        <div>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
