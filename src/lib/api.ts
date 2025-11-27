// Centralized API Configuration
export const API_BASE = "https://4e948ef7-1668-4c39-85db-342a63b048e3-00-124qj2yd3st31.sisko.replit.dev:8000";

// Re-export all agent functions for convenience
export { analyzeImage, type VisionAnalysisResult } from './visionAgent';
export { extractDocuments, type ExtractedDocumentData } from './documentAgent';
export { getDecision, type DecisionResult, type DecisionPayload } from './decisionAgent';
export { simulateRPA, type RPAResult, type RPAStep } from './rpaAgent';
