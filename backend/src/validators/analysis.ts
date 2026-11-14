import { z } from "zod";

export const analysisInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  company: z.string().trim().max(160).default(""),
  description: z.string().trim().min(40).max(12000),
  salary: z.string().trim().max(160).default(""),
  location: z.string().trim().max(160).default(""),
  workMode: z.enum(["On-site", "Hybrid", "Remote", "Not specified"]).default("Not specified"),
  applicationUrl: z.string().trim().url().max(500).or(z.literal("")),
  contact: z.string().trim().max(240).default("")
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
