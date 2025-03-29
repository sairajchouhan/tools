import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/asdf')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Button onClick={async () => {
        const res = await fetch('http://localhost:11434', {
          method: 'GET',
        })
        const data = await res.json()
        console.log(data)
      }}>
        Fetch Data
      </Button>
    </div>
  )
}
