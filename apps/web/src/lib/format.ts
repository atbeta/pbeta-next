import { format, parseISO } from 'date-fns'

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd')
  } catch {
    return dateStr
  }
}
