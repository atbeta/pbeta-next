'use client'

import * as runtime from 'react/jsx-runtime'

// Renders compiled MDX from content-collections
// The compiled code references `_jsx_runtime` as a free variable
export function MDXContent({ code }: { code: string }) {
  // eslint-disable-next-line no-new-func
  const fn = new Function('_jsx_runtime', code)
  const mod = fn(runtime)
  const MDXComponent = mod?.default ?? mod
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <MDXComponent />
    </article>
  )
}
