import { db } from "./db";
import {
  companies,
  countries,
  offices,
  relationships,
  type Company,
  type Country,
  type Office,
  type Relationship,
  type InsertCompany,
  type InsertOffice,
  type InsertRelationship
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Read
  getCountries(): Promise<Country[]>;
  getCompanies(): Promise<Company[]>;
  getOffices(): Promise<Office[]>;
  getRelationships(): Promise<Relationship[]>;
  
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyWithDetails(id: number): Promise<any>; // Using any to simplify the return type complexity in interface

  // Write (for seeding mostly)
  createCountry(country: any): Promise<Country>;
  createCompany(company: InsertCompany): Promise<Company>;
  createOffice(office: InsertOffice): Promise<Office>;
  createRelationship(rel: InsertRelationship): Promise<Relationship>;
}

export class DatabaseStorage implements IStorage {
  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getOffices(): Promise<Office[]> {
    return await db.select().from(offices);
  }

  async getRelationships(): Promise<Relationship[]> {
    return await db.select().from(relationships);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyWithDetails(id: number): Promise<any> {
    const company = await this.getCompany(id);
    if (!company) return undefined;

    const companyOffices = await db.query.offices.findMany({
      where: eq(offices.companyId, id),
      with: {
        country: true
      }
    });

    const outgoing = await db.query.relationships.findMany({
      where: eq(relationships.sourceCompanyId, id),
      with: {
        targetCompany: true
      }
    });

    const incoming = await db.query.relationships.findMany({
      where: eq(relationships.targetCompanyId, id),
      with: {
        sourceCompany: true
      }
    });

    return {
      ...company,
      offices: companyOffices,
      outgoingRelationships: outgoing,
      incomingRelationships: incoming,
    };
  }

  async createCountry(country: any): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async createOffice(office: InsertOffice): Promise<Office> {
    const [newOffice] = await db.insert(offices).values(office).returning();
    return newOffice;
  }

  async createRelationship(rel: InsertRelationship): Promise<Relationship> {
    const [newRel] = await db.insert(relationships).values(rel).returning();
    return newRel;
  }
}

export const storage = new DatabaseStorage();
