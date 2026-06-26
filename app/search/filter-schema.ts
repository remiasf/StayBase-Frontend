import { z } from "zod"

export const filterSchema = z.object({
  address: z.string().trim().max(120, "Address must be at most 120 characters"),
  priceRange: z
    .tuple([
      z.coerce.number().min(1, "Minimum price must be at least 1"),
      z.coerce.number().max(500, "Maximum price must be at most 500"),
    ])
    .refine(([minPrice, maxPrice]) => minPrice <= maxPrice, {
      message: "Minimum price must be less than or equal to maximum price",
    }),
  sizeRange: z
    .tuple([
      z.coerce.number().min(1, "Minimum size must be at least 1 m2"),
      z.coerce.number().max(200, "Maximum size must be at most 200 m2"),
    ])
    .refine(([minSize, maxSize]) => minSize <= maxSize, {
      message: "Minimum size must be less than or equal to maximum size",
    }),
  radius: z.coerce.number().int().min(1, "Radius must be at least 1 km").max(20, "Radius must be at most 20 km"),
})

export type FilterSchema = z.infer<typeof filterSchema>

export const initialFilters: FilterSchema = {
  address: "",
  priceRange: [1, 350],
  sizeRange: [20, 120],
  radius: 8,
}
