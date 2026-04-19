import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import rehypePrettyCode from 'rehype-pretty-code'
import { z } from 'zod'
import { NOTE_STATUSES, PROJECT_STATUSES } from '@pbeta/content'

const mdxOptions = {
  rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]] as never,
}

const notes = defineCollection({
  name: 'notes',
  directory: '../../content/notes',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    status: z.enum(NOTE_STATUSES).default('snippet'),
  }),
  transform: async (doc, ctx) => {
    const mdx = await compileMDX(ctx, doc, mdxOptions)
    return { ...doc, mdx }
  },
})

const projects = defineCollection({
  name: 'projects',
  directory: '../../content/projects',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    projectStatus: z.enum(PROJECT_STATUSES).default('active'),
    url: z.string().url().optional(),
    repo: z.string().optional(),
  }),
  transform: async (doc, ctx) => {
    const mdx = await compileMDX(ctx, doc, mdxOptions)
    return { ...doc, mdx }
  },
})

const research = defineCollection({
  name: 'research',
  directory: '../../content/research',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
  }),
  transform: async (doc, ctx) => {
    const mdx = await compileMDX(ctx, doc, mdxOptions)
    return { ...doc, mdx }
  },
})

export default defineConfig({
  content: [notes, projects, research],
})

