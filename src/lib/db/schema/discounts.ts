import { pgTable, uuid, varchar, timestamp, text, decimal, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define valid discount types and targets
const VALID_DISCOUNT_TYPES = ['percentage', 'fixed_amount'] as const;
const VALID_DISCOUNT_TARGETS = ['all', 'category', 'product'] as const;

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 50 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }).default('0'),
  appliesTo: varchar('applies_to', { length: 50 }).notNull(),
  targetId: uuid('target_id'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertDiscountSchema = createInsertSchema(discounts, {
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  discountType: z.enum(VALID_DISCOUNT_TYPES),
  value: z.coerce.number().positive(),
  minPurchaseAmount: z.coerce.number().min(0).default(0),
  appliesTo: z.enum(VALID_DISCOUNT_TARGETS),
  targetId: z.string().uuid().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  active: z.boolean().default(true),
});

export const updateDiscountSchema = createSelectSchema(discounts, {
  id: z.string().uuid(),
}).merge(insertDiscountSchema.partial());

export const selectDiscountSchema = createSelectSchema(discounts);

// Custom types
export type Discount = z.infer<typeof selectDiscountSchema>;
export type NewDiscount = z.infer<typeof insertDiscountSchema>;
export type UpdateDiscount = z.infer<typeof updateDiscountSchema>;

// Helper functions
export const isDiscountActive = (discount: Discount) => {
  const now = new Date();
  return (
    discount.active &&
    discount.startDate <= now &&
    (!discount.endDate || discount.endDate >= now)
  );
};

export const calculateDiscountAmount = (discount: Discount, subtotal: number) => {
  if (!isDiscountActive(discount) || subtotal < Number(discount.minPurchaseAmount)) {
    return 0;
  }

  if (discount.discountType === 'percentage') {
    return (subtotal * Number(discount.value)) / 100;
  }

  return Number(discount.value);
};

export const isDiscountApplicable = (discount: Discount, subtotal: number) => {
  return isDiscountActive(discount) && subtotal >= Number(discount.minPurchaseAmount);
};

export const formatDiscountValue = (discount: Discount) => {
  if (discount.discountType === 'percentage') {
    return `${discount.value}%`;
  }
  return `$${Number(discount.value).toFixed(2)}`;
};

export const getDiscountPeriod = (discount: Discount) => {
  const startDate = new Date(discount.startDate).toLocaleDateString();
  const endDate = discount.endDate 
    ? new Date(discount.endDate).toLocaleDateString()
    : 'No end date';
  return `${startDate} - ${endDate}`;
}; 