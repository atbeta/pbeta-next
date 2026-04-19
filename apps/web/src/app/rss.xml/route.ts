import { allNotes } from 'content-collections'

const siteUrl = 'https://pbeta.me'

export async function GET() {
  const notes = allNotes.sort((a, b) => (new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1))

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tech Memos</title>
    <link>${siteUrl}</link>
    <description>技术备忘录 (Tech Memos) — 记录项目、研究与技术笔记的个人空间。</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${notes
      .map((note) => {
        const url = `${siteUrl}/notes/${note._meta.path}`
        return `
    <item>
      <title><![CDATA[${note.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(note.date).toUTCString()}</pubDate>
      <description><![CDATA[${note.description || ''}]]></description>
    </item>`
      })
      .join('')}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
