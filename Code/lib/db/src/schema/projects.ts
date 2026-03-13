import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  problemStatement: text("problem_statement").notNull(),
  description: text("description").notNull(),
  technologies: text("technologies").notNull(),
  domain: text("domain").notNull(),
  githubLink: text("github_link"),
  keywords: text("keywords"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;

export const projectEmbeddingsTable = pgTable("project_embeddings", {
  id: serial("id").primaryKey(),
  projectId: serial("project_id").notNull(),
  embedding: text("embedding").notNull(),
});

export type ProjectEmbedding = typeof projectEmbeddingsTable.$inferSelect;

export const projectRelationsTable = pgTable("project_relations", {
  id: serial("id").primaryKey(),
  projectId1: serial("project_id_1").notNull(),
  projectId2: serial("project_id_2").notNull(),
  similarity: real("similarity").notNull(),
});

export type ProjectRelation = typeof projectRelationsTable.$inferSelect;
