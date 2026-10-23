import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
})

export type ClientInput = z.infer<typeof clientSchema>

export const orderSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  clientName: z.string().min(1, "Client name is required"),
  title: z.string().trim().min(1, "Title is required").max(160, "Title is too long"),
  type: z.enum(["Clothes", "Curtains", "Others"]),
  status: z.enum([
    "consultation",
    "measurements",
    "cutting",
    "sewing",
    "fitting",
    "delivered",
    "cancelled",
  ]),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  price: z.number().nonnegative().nullable().optional(),
  deposit: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("USD"),
  measurementId: z.string().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
})

export type OrderInput = z.infer<typeof orderSchema>

export const measurementSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  version: z.number().int().positive(),
  unit: z.enum(["cm", "in", "yd", "m"]),
  source: z.enum(["designer", "client"]),
  notes: z.string().trim().max(2000).nullable().optional(),
})

export type MeasurementInput = z.infer<typeof measurementSchema>
