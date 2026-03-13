import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // NO, SE, DK, FI
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry"),
  website: text("website"),
});

export const offices = pgTable("offices", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  countryId: integer("country_id").notNull(),
  city: text("city").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  type: text("type").notNull(), // 'HQ', 'Branch'
});

export const relationships = pgTable("relationships", {
  id: serial("id").primaryKey(),
  sourceCompanyId: integer("source_company_id").notNull(),
  targetCompanyId: integer("target_company_id").notNull(),
  type: text("type").notNull(), // 'Ownership', 'Partnership', 'Joint Venture'
  percentage: integer("percentage"), // 0-100
  description: text("description"),
});

// === RELATIONS ===

export const companiesRelations = relations(companies, ({ many }) => ({
  offices: many(offices),
  outgoingRelationships: many(relationships, { relationName: "source" }),
  incomingRelationships: many(relationships, { relationName: "target" }),
}));

export const officesRelations = relations(offices, ({ one }) => ({
  company: one(companies, {
    fields: [offices.companyId],
    references: [companies.id],
  }),
  country: one(countries, {
    fields: [offices.countryId],
    references: [countries.id],
  }),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  sourceCompany: one(companies, {
    fields: [relationships.sourceCompanyId],
    references: [companies.id],
    relationName: "source",
  }),
  targetCompany: one(companies, {
    fields: [relationships.targetCompanyId],
    references: [companies.id],
    relationName: "target",
  }),
}));

// === SCHEMAS ===

export const insertCountrySchema = createInsertSchema(countries).omit({ id: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertOfficeSchema = createInsertSchema(offices).omit({ id: true });
export const insertRelationshipSchema = createInsertSchema(relationships).omit({ id: true });

// === TYPES ===

export type Country = typeof countries.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Office = typeof offices.$inferSelect;
export type Relationship = typeof relationships.$inferSelect;

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertOffice = z.infer<typeof insertOfficeSchema>;
export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;

// Detailed types for API responses including relations
export type OfficeWithCountry = Office & { country: Country };
export type CompanyWithDetails = Company & {
  offices: OfficeWithCountry[];
  outgoingRelationships: (Relationship & { targetCompany: Company })[];
  incomingRelationships: (Relationship & { sourceCompany: Company })[];
};
