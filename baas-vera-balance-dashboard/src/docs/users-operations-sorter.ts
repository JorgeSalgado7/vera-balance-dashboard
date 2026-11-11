interface SwaggerOperation {
  get(key: 'method' | 'path'): string
}

export function usersOperationsSorter(a: SwaggerOperation, b: SwaggerOperation): number {
  // Keep this list inside the function: Swagger UI serializes it for the browser.
  const order = [
    'post /users',
    'get /users',
    'get /users/{userId}',
    'patch /users/{userId}',
    'delete /users/{userId}',
    'get /users/{userId}/patients',
    'patch /users/{userId}/status',
    'patch /users/{userId}/password',
  ]
  const aIndex = order.indexOf(`${a.get('method').toLowerCase()} ${a.get('path')}`)
  const bIndex = order.indexOf(`${b.get('method').toLowerCase()} ${b.get('path')}`)
  return (aIndex === -1 ? order.length : aIndex) - (bIndex === -1 ? order.length : bIndex)
}
