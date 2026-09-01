import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function paginationMetadata(page: number, pageSize: number, totalItems: number) {
  return { page, pageSize, totalItems, totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize) };
}
