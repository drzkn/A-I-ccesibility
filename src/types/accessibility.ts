import { z } from 'zod';

export const SeveritySchema = z
  .enum(['critical', 'serious', 'moderate', 'minor'])
  .describe(
    'Impact level: critical (blocks users), serious (significant barrier), moderate (some difficulty), minor (annoyance)'
  );
export type Severity = z.infer<typeof SeveritySchema>;

export const WCAGLevelSchema = z
  .enum(['A', 'AA', 'AAA'])
  .describe('WCAG conformance level: A (minimum), AA (standard), AAA (enhanced)');
export type WCAGLevel = z.infer<typeof WCAGLevelSchema>;

export const WCAGPrincipleSchema = z
  .enum(['perceivable', 'operable', 'understandable', 'robust'])
  .describe(
    'WCAG principle: perceivable (can sense), operable (can use), understandable (can comprehend), robust (works with assistive tech)'
  );
export type WCAGPrinciple = z.infer<typeof WCAGPrincipleSchema>;

export const ToolSourceSchema = z
  .enum(['axe-core', 'pa11y', 'contrast-analyzer'])
  .describe('Source tool that detected the issue');
export type ToolSource = z.infer<typeof ToolSourceSchema>;

export const WCAGCriterionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Must be in format X.Y.Z (e.g., 1.4.3)')
  .describe('WCAG success criterion number (e.g., 1.4.3 for Contrast)');
export type WCAGCriterion = z.infer<typeof WCAGCriterionSchema>;

export const WCAGReferenceSchema = z
  .object({
    criterion: WCAGCriterionSchema,
    level: WCAGLevelSchema,
    principle: WCAGPrincipleSchema,
    version: z.enum(['2.0', '2.1', '2.2']).optional().describe('WCAG version'),
    title: z.string().optional().describe('Human-readable criterion title'),
    url: z.string().url().optional().describe('Link to WCAG documentation'),
  })
  .describe('Reference to specific WCAG success criterion');
export type WCAGReference = z.infer<typeof WCAGReferenceSchema>;

export const IssueLocationSchema = z
  .object({
    selector: z.string().optional().describe('CSS selector to locate the element'),
    xpath: z.string().optional().describe('XPath to locate the element'),
    file: z.string().optional().describe('Source file path (for static analysis)'),
    line: z.number().int().positive().optional().describe('Line number in source file'),
    column: z.number().int().nonnegative().optional().describe('Column number in source file'),
    snippet: z.string().max(500).optional().describe('HTML snippet of the problematic element'),
  })
  .describe('Location information for the accessibility issue');
export type IssueLocation = z.infer<typeof IssueLocationSchema>;

export const AccessibilityIssueSchema = z
  .object({
    id: z.string().min(1).describe('Unique identifier for this issue instance'),
    ruleId: z.string().min(1).describe('Rule identifier from the source tool'),
    tool: ToolSourceSchema,
    severity: SeveritySchema,
    wcag: WCAGReferenceSchema.optional(),
    location: IssueLocationSchema,
    message: z.string().min(1).describe('Technical description of the issue'),
    humanContext: z.string().optional().describe('User impact explanation for decision-making'),
    suggestedActions: z
      .array(z.string())
      .optional()
      .describe('Possible remediation approaches (not auto-fixes)'),
    affectedUsers: z
      .array(
        z.enum([
          'screen-reader',
          'keyboard-only',
          'low-vision',
          'color-blind',
          'cognitive',
          'motor-impaired',
        ])
      )
      .optional()
      .describe('User groups most affected by this issue'),
    priority: z
      .enum(['critical', 'high', 'medium', 'low'])
      .optional()
      .describe('Remediation priority based on impact'),
    remediationEffort: z
      .enum(['low', 'medium', 'high'])
      .optional()
      .describe('Estimated effort to fix'),
    confidence: z.number().min(0).max(1).optional().describe('Tool confidence score (0-1)'),
    rawResult: z.unknown().optional().describe('Original result from source tool for debugging'),
  })
  .describe('Normalized accessibility issue from any source tool');
export type AccessibilityIssue = z.infer<typeof AccessibilityIssueSchema>;

export const AnalysisSummarySchema = z
  .object({
    total: z.number().int().nonnegative().describe('Total number of issues found'),
    bySeverity: z
      .object({
        critical: z.number().int().nonnegative().default(0),
        serious: z.number().int().nonnegative().default(0),
        moderate: z.number().int().nonnegative().default(0),
        minor: z.number().int().nonnegative().default(0),
      })
      .describe('Issue count by severity level'),
    byPrinciple: z
      .object({
        perceivable: z.number().int().nonnegative().default(0),
        operable: z.number().int().nonnegative().default(0),
        understandable: z.number().int().nonnegative().default(0),
        robust: z.number().int().nonnegative().default(0),
      })
      .optional()
      .describe('Issue count by WCAG principle'),
    byRule: z
      .record(z.string(), z.number().int().nonnegative())
      .optional()
      .describe('Issue count grouped by rule ID'),
  })
  .describe('Summary statistics for the analysis');
export type AnalysisSummary = z.infer<typeof AnalysisSummarySchema>;

export const AnalysisResultSchema = z
  .object({
    success: z.boolean().describe('Whether the analysis completed without errors'),
    timestamp: z.string().datetime().describe('ISO 8601 timestamp of analysis'),
    duration: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Analysis duration in milliseconds'),
    target: z.string().describe('URL, file path, or identifier of analyzed target'),
    tool: ToolSourceSchema,
    issues: z.array(AccessibilityIssueSchema).describe('List of accessibility issues found'),
    summary: AnalysisSummarySchema,
    metadata: z
      .object({
        toolVersion: z.string().optional(),
        browserInfo: z.string().optional(),
        pageTitle: z.string().optional(),
      })
      .optional()
      .describe('Additional context about the analysis'),
    error: z.string().optional().describe('Error message if analysis failed'),
  })
  .describe('Complete result of an accessibility analysis');
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const CombinedAnalysisResultSchema = z
  .object({
    success: z.boolean(),
    timestamp: z.string().datetime(),
    duration: z.number().int().nonnegative().optional(),
    target: z.string(),
    toolsUsed: z.array(ToolSourceSchema),
    issues: z.array(AccessibilityIssueSchema),
    summary: AnalysisSummarySchema.extend({
      byTool: z.record(ToolSourceSchema, z.number().int().nonnegative()).optional(),
    }),
    individualResults: z
      .array(AnalysisResultSchema)
      .optional()
      .describe('Results from each tool before merging'),
    error: z.string().optional(),
  })
  .describe('Combined result from multiple accessibility tools');
export type CombinedAnalysisResult = z.infer<typeof CombinedAnalysisResultSchema>;
