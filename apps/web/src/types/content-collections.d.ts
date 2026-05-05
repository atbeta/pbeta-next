declare module 'content-collections' {
  type Configuration = typeof import('../../content-collections').default
  type GetTypeByName<C, N extends string> = import('@content-collections/core').GetTypeByName<C, N>

  export type Note = GetTypeByName<Configuration, 'notes'>
  export type Project = GetTypeByName<Configuration, 'projects'>
  export type Research = GetTypeByName<Configuration, 'research'>
  export type Term = GetTypeByName<Configuration, 'terms'>

  export const allNotes: Array<Note>
  export const allProjects: Array<Project>
  export const allResearch: Array<Research>
  export const allTerms: Array<Term>
}
