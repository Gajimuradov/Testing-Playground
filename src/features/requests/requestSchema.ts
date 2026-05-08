import { z } from 'zod';

export const requestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Название должно быть не короче 3 символов')
    .max(80, 'Название должно быть не длиннее 80 символов'),
  description: z
    .string()
    .trim()
    .min(10, 'Описание должно быть не короче 10 символов')
    .max(400, 'Описание должно быть не длиннее 400 символов'),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Выберите приоритет',
  }),
});

export type RequestFormValues = z.infer<typeof requestSchema>;
