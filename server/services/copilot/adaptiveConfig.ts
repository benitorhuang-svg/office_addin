import { AgentEnvironment } from './types.js';

/**
 * Resolves the appropriate environment configuration (2026 Adaptive Pattern).
 */
export function getAdaptiveConfig(loginEnv: string = 'commercial'): AgentEnvironment {
  switch (loginEnv.toLowerCase()) {
    case 'gcc':
      return {
        type: 'gcc',
        apiVersion: 'v1',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1',
        securityMode: 'high',
      };
    case 'preview':
      return {
        type: 'preview',
        apiVersion: 'v1beta',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1beta',
        securityMode: 'standard',
      };
    default:
      return {
        type: 'commercial',
        apiVersion: 'v1beta',
        endpointUrl: 'https://generativelanguage.googleapis.com/v1beta',
        securityMode: 'standard',
      };
  }
}
