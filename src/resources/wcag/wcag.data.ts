import type { WCAGLevel, WCAGPrinciple } from '@/shared/types/accessibility.js';
import { WCAG_CRITERIA, type WCAGCriterionInfo } from '@/shared/utils/wcag-context.js';

export function getAllCriteria(): WCAGCriterionInfo[] {
  return Object.values(WCAG_CRITERIA);
}

export function getCriterionById(id: string): WCAGCriterionInfo | undefined {
  return WCAG_CRITERIA[id];
}

export function getCriteriaByLevel(level: WCAGLevel): WCAGCriterionInfo[] {
  return Object.values(WCAG_CRITERIA).filter(
    (criterion) => criterion.level === level
  );
}

export function getCriteriaByPrinciple(principle: WCAGPrinciple): WCAGCriterionInfo[] {
  return Object.values(WCAG_CRITERIA).filter(
    (criterion) => criterion.principle === principle
  );
}

export function getAllCriteriaIds(): string[] {
  return Object.keys(WCAG_CRITERIA);
}
