import { useRouteElement } from '~/portal/useRouteElement'

export function meta() {
  return [{ title: 'Cổng làm việc — Dr Tina Beauty' }]
}

export default function PortalRoute() {
  return useRouteElement()
}
