import { z } from 'zod'

export const CreateFeedbackSchema = z.object({
  serviceId: z.string().cuid().optional(),
  message: z.string().min(4).max(2000),
  contact: z.string().email().optional().or(z.literal('')),
})

export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>
