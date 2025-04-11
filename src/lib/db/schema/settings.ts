import { pgTable, uuid, varchar, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';

// Define setting category enum
export const SettingCategory = {
  GENERAL: 'general',
  STORE: 'store',
  INVOICE: 'invoice',
  TAX: 'tax',
  NOTIFICATION: 'notification',
  INTEGRATION: 'integration',
  SECURITY: 'security',
  OTHER: 'other',
} as const;

export type SettingCategory = typeof SettingCategory[keyof typeof SettingCategory];

export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').references(() => stores.id),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    storeKeyIdx: uniqueIndex('store_key_idx').on(table.storeId, table.key),
  };
});

// Define Zod schemas for validation
export const insertSettingSchema = createInsertSchema(settings, {
  storeId: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: z.string().optional(),
});

export const updateSettingSchema = createSelectSchema(settings, {
  id: z.string().uuid(),
}).merge(insertSettingSchema.partial());

export const selectSettingSchema = createSelectSchema(settings);

// Custom types
export type Setting = z.infer<typeof selectSettingSchema>;
export type NewSetting = z.infer<typeof insertSettingSchema>;
export type UpdateSetting = z.infer<typeof updateSettingSchema>;

// Helper functions
export const parseSettingValue = (setting: Setting) => {
  if (!setting.value) return null;
  try {
    return JSON.parse(setting.value);
  } catch {
    return setting.value;
  }
};

export const stringifySettingValue = (value: any) => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

// Common setting keys
export const SETTING_KEYS = {
  TAX_RATE: 'tax_rate',
  CURRENCY: 'currency',
  DATE_FORMAT: 'date_format',
  TIME_FORMAT: 'time_format',
  RECEIPT_FOOTER: 'receipt_footer',
  STORE_LOGO: 'store_logo',
  EMAIL_SETTINGS: 'email_settings',
  SMS_SETTINGS: 'sms_settings',
  PAYMENT_METHODS: 'payment_methods',
  LOW_STOCK_THRESHOLD: 'low_stock_threshold',
} as const;

export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS];

// Helper functions
export const formatCategory = (category: SettingCategory) => {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

export const getCategoryIcon = (category: SettingCategory) => {
  switch (category) {
    case SettingCategory.GENERAL:
      return 'Settings';
    case SettingCategory.STORE:
      return 'Store';
    case SettingCategory.INVOICE:
      return 'FileText';
    case SettingCategory.TAX:
      return 'Calculator';
    case SettingCategory.NOTIFICATION:
      return 'Bell';
    case SettingCategory.INTEGRATION:
      return 'Link';
    case SettingCategory.SECURITY:
      return 'Shield';
    default:
      return 'Settings';
  }
};

export const formatSettingKey = (key: string) => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const validateSettingValue = (value: any, schema: z.ZodType) => {
  try {
    schema.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};

export const getDefaultValue = (key: string) => {
  switch (key) {
    case 'currency':
      return 'USD';
    case 'tax_rate':
      return 0;
    case 'date_format':
      return 'YYYY-MM-DD';
    case 'time_format':
      return '24h';
    default:
      return null;
  }
}; 