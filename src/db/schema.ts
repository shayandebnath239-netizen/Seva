import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  uuid, 
  jsonb,
  pgEnum
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN', 'MODERATOR']);
export const verificationStatusEnum = pgEnum('verification_status', ['VERIFIED', 'NEEDS_REVIEW', 'OUTDATED', 'UNPUBLISHED']);
export const serviceScopeEnum = pgEnum('service_scope', ['CENTRAL', 'STATE', 'UT', 'DISTRICT']);

// Users & Profiles
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: userRoleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  stateId: integer('state_id'),
  districtId: integer('district_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories, States, Districts
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
});

export const states = pgTable('states', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'STATE' or 'UT'
});

export const districts = pgTable('districts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  stateId: integer('state_id').references(() => states.id).notNull(),
});

// Services & Schemes
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  jurisdiction: serviceScopeEnum('jurisdiction').notNull().default('CENTRAL'),
  stateId: integer('state_id').references(() => states.id),
  districtId: integer('district_id').references(() => districts.id),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('UNPUBLISHED'),
  lastVerifiedAt: timestamp('last_verified_at'),
  nextReviewAt: timestamp('next_review_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Official Links
export const officialLinks = pgTable('official_links', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  sourceUrl: text('source_url').notNull(),
  applicationUrl: text('application_url'),
  sourceName: text('source_name').notNull(),
  sourceType: text('source_type').notNull(), // Central Gov, State Gov, Portal, etc.
});

// Documents & Requirements
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
});

export const serviceDocuments = pgTable('service_documents', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  isRequired: boolean('is_required').default(true),
  notes: text('notes'),
});

// Eligibility Rules
export const eligibilityRules = pgTable('eligibility_rules', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  ageMin: integer('age_min'),
  ageMax: integer('age_max'),
  gender: text('gender'),
  incomeLimit: integer('income_limit'),
  studentStatus: text('student_status'),
  employmentStatus: text('employment_status'),
  educationLevel: text('education_level'),
  specialConditions: text('special_conditions'),
});

// Verification Records
export const verificationRecords = pgTable('verification_records', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  sourceUrl: text('source_url'),
  verifiedBy: integer('verified_by').references(() => users.id).notNull(),
  status: verificationStatusEnum('status').notNull(),
  notes: text('notes'),
  verifiedAt: timestamp('verified_at').defaultNow(),
  nextReviewAt: timestamp('next_review_at'),
});

// Bookmarks / Saved Services
export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Checklists
export const checklists = pgTable('checklists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const checklistItems = pgTable('checklist_items', {
  id: serial('id').primaryKey(),
  checklistId: integer('checklist_id').references(() => checklists.id).notNull(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  isReady: boolean('is_ready').default(false),
  notes: text('notes'),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  bookmarks: many(bookmarks),
  checklists: many(checklists),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, { fields: [services.categoryId], references: [categories.id] }),
  state: one(states, { fields: [services.stateId], references: [states.id] }),
  district: one(districts, { fields: [services.districtId], references: [districts.id] }),
  officialLinks: many(officialLinks),
  serviceDocuments: many(serviceDocuments),
  eligibilityRules: many(eligibilityRules),
  verificationRecords: many(verificationRecords),
}));
