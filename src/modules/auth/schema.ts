import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const signUpSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ').max(120),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'),
});

export const emailSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
