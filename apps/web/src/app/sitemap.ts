import type { MetadataRoute } from 'next'
import { allNotes, allProjects, allResearch } from 'content-collections'

const siteUrl = 'https://pbeta.me'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/notes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/research`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.6 },
  ]

  const noteRoutes: MetadataRoute.Sitemap = allNotes.map((note) => ({
    url: `${siteUrl}/notes/${note._meta.path}`,
    lastModified: new Date(note.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const projectRoutes: MetadataRoute.Sitemap = allProjects.map((project) => ({
    url: `${siteUrl}/projects/${project._meta.path}`,
    lastModified: new Date(project.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const researchRoutes: MetadataRoute.Sitemap = allResearch.map((item) => ({
    url: `${siteUrl}/research/${item._meta.path}`,
    lastModified: new Date(item.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...noteRoutes, ...projectRoutes, ...researchRoutes]
}
