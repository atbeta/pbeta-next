import type { NextConfig } from 'next'
import path from 'path'
import { withContentCollections } from '@content-collections/next'

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias['content-collections'] = path.resolve(
      process.cwd(),
      '.content-collections/generated/index.js',
    )
    return config
  },
}

export default withContentCollections(nextConfig)
