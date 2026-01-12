import { z } from 'zod';

export const SeveritySchema = z.enum(['critical', 'serious', 'moderate', 'minor']);
export type Severity = z.infer<typeof SeveritySchema>;

export const WCAGLevelSchema = z.enum(['A', 'AA', 'AAA']);
export type WCAGLevel = z.infer<typeof WCAGLevelSchema>;

export const WCAGPrincipleSchema = z.enum([
  'perceivable',
  'operable',
  'understandable',
  'robust'
]);
export type WCAGPrinciple = z.infer<typeof WCAGPrincipleSchema>;

export const ToolSourceSchema = z.enum([
  'axe-core',
  'pa11y',
  'eslint-vuejs-a11y'
]);
export type ToolSource = z.infer<typeof ToolSourceSchema>;

export const WCAGReferenceSchema = z.object({
  criterion: z.string(),
  level: WCAGLevelSchema,
  principle: WCAGPrincipleSchema,
  version: z.enum(['2.0', '2.1', '2.2']).optional()
});
export type WCAGReference = z.infer<typeof WCAGReferenceSchema>;

export const IssueLocationSchema = z.object({
  selector: z.string().optional(),
  xpath: z.string().optional(),
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  snippet: z.string().optional()
});
export type IssueLocation = z.infer<typeof IssueLocationSchema>;

export const AccessibilityIssueSchema = z.object({
  id: z.string(),
  tool: ToolSourceSchema,
  severity: SeveritySchema,
  wcag: WCAGReferenceSchema.optional(),
  location: IssueLocationSchema,
  message: z.string(),
  humanContext: z.string().optional(),
  suggestedActions: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  rawResult: z.unknown().optional()
});
export type AccessibilityIssue = z.infer<typeof AccessibilityIssueSchema>;

export const AnalysisResultSchema = z.object({
  success: z.boolean(),
  timestamp: z.string().datetime(),
  target: z.string(),
  tool: ToolSourceSchema,
  issues: z.array(AccessibilityIssueSchema),
  summary: z.object({
    total: z.number(),
    bySeverity: z.record(SeveritySchema, z.number()),
    byPrinciple: z.record(WCAGPrincipleSchema, z.number()).optional()
  }),
  error: z.string().optional()
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
