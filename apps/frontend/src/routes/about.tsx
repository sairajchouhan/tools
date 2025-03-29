import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {


  return <div>

    <Link to="/asdf" >
      asdf
    </Link>
  </div>
}
