import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/asdf')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/asdf"!</div>
}
