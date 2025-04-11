import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

// Define audit log action enum
export const AuditLogAction = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  OTHER: 'other',
} as const;

export type AuditLogAction = typeof AuditLogAction[keyof typeof AuditLogAction];

// Define audit log entity enum
export const AuditLogEntity = {
  USER: 'user',
  PRODUCT: 'product',
  CATEGORY: 'category',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  STORE: 'store',
  TRANSACTION: 'transaction',
  PURCHASE_ORDER: 'purchase_order',
  STOCK_TRANSFER: 'stock_transfer',
  DISCOUNT: 'discount',
  SETTINGS: 'settings',
  OTHER: 'other',
} as const;

export type AuditLogEntity = typeof AuditLogEntity[keyof typeof AuditLogEntity];

export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: uuid('record_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertAuditLogSchema = createInsertSchema(auditLog, {
  userId: z.string().uuid(),
  action: z.string().min(1).max(100),
  tableName: z.string().min(1).max(100),
  recordId: z.string().uuid().optional(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  ipAddress: z.string().max(45).optional(),
});

export const selectAuditLogSchema = createSelectSchema(auditLog);

// Custom types
export type AuditLog = z.infer<typeof selectAuditLogSchema>;
export type NewAuditLog = z.infer<typeof insertAuditLogSchema>;

// Helper functions
export const formatAuditChange = (oldValues: Record<string, any> | null, newValues: Record<string, any> | null) => {
  if (!oldValues && !newValues) return 'No changes recorded';
  
  const changes: string[] = [];
  const allKeys = new Set([
    ...(oldValues ? Object.keys(oldValues) : []),
    ...(newValues ? Object.keys(newValues) : []),
  ]);

  for (const key of allKeys) {
    const oldValue = oldValues?.[key];
    const newValue = newValues?.[key];
    
    if (oldValue !== newValue) {
      changes.push(`${key}: ${oldValue} → ${newValue}`);
    }
  }

  return changes.join(', ');
};

export const getAuditActionDescription = (log: AuditLog) => {
  const actionMap: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    login: 'Logged in',
    logout: 'Logged out',
  };

  return `${actionMap[log.action] || log.action} ${log.tableName}${log.recordId ? ` (ID: ${log.recordId})` : ''}`;
};

export const formatAction = (action: AuditLogAction) => {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
};

export const formatEntity = (entity: AuditLogEntity) => {
  return entity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const getActionColor = (action: AuditLogAction) => {
  switch (action) {
    case AuditLogAction.CREATE:
      return 'green';
    case AuditLogAction.UPDATE:
      return 'blue';
    case AuditLogAction.DELETE:
      return 'red';
    case AuditLogAction.LOGIN:
    case AuditLogAction.LOGOUT:
      return 'purple';
    case AuditLogAction.EXPORT:
    case AuditLogAction.IMPORT:
      return 'orange';
    default:
      return 'gray';
  }
};

export const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleString();
};

export const generateDescription = (action: AuditLogAction, entity: AuditLogEntity, entityId?: string) => {
  const formattedAction = formatAction(action);
  const formattedEntity = formatEntity(entity);
  return `${formattedAction} ${formattedEntity}${entityId ? ` (${entityId})` : ''}`;
}; 