import type { WCAGLevel, WCAGPrinciple } from '@/shared/types/accessibility.js';
import wcagCriteriaData from '@/shared/data/wcag-criteria.json' with { type: 'json' };

export interface WCAGCriterionInfo {
  criterion: string;
  level: WCAGLevel;
  principle: WCAGPrinciple;
  title: string;
  description: string;
  userImpact: {
    affectedUsers: Array<'screen-reader' | 'keyboard-only' | 'low-vision' | 'color-blind' | 'cognitive' | 'motor-impaired'>;
    impactDescription: string;
    realWorldExample: string;
  };
  remediation: {
    effort: 'low' | 'medium' | 'high';
    priority: 'critical' | 'high' | 'medium' | 'low';
    commonSolutions: string[];
  };
  wcagUrl: string;
}

export const WCAG_CRITERIA: Record<string, WCAGCriterionInfo> = wcagCriteriaData as Record<string, WCAGCriterionInfo>;

export function getWCAGContext(criterion: string): WCAGCriterionInfo | undefined {
  return WCAG_CRITERIA[criterion];
}

export function enrichIssueWithContext(
  _issue: { wcag?: { criterion: string } },
  context: WCAGCriterionInfo
): {
  humanContext: string;
  suggestedActions: string[];
  affectedUsers: Array<'screen-reader' | 'keyboard-only' | 'low-vision' | 'color-blind' | 'cognitive' | 'motor-impaired'>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  remediationEffort: 'low' | 'medium' | 'high';
} {
  const humanContext = `
**${context.title} (WCAG ${context.criterion} - Nivel ${context.level})**

${context.description}

**Impacto en usuarios:**
${context.userImpact.impactDescription}

**Ejemplo real:**
${context.userImpact.realWorldExample}

**Esfuerzo de corrección:** ${context.remediation.effort}
**Prioridad:** ${context.remediation.priority}
  `.trim();

  return {
    humanContext,
    suggestedActions: context.remediation.commonSolutions,
    affectedUsers: context.userImpact.affectedUsers,
    priority: context.remediation.priority,
    remediationEffort: context.remediation.effort
  };
}
