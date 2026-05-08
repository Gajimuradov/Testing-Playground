import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
