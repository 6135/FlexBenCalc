// Configuration migration utilities for handling different JSON versions

import { AppState } from '../types';
import { defaults } from '../constants';

export const CURRENT_CONFIG_VERSION = 1;

/**
 * Migrate imported configuration to the current version
 * @param data - The imported configuration data
 * @returns Migrated configuration compatible with current version
 */
export const migrateConfig = (data: any): AppState => {
  const version = data.version || 1; // If no version, assume version 1

  // Start with the imported data
  let migratedData = { ...data };

  // Apply migrations in sequence based on version
  if (version < CURRENT_CONFIG_VERSION) {
    console.log(`Migrating config from version ${version} to ${CURRENT_CONFIG_VERSION}`);
    
    // Example: if (version === 1) { migratedData = migrateV1toV2(migratedData); }
    // Add more migrations as needed when version increases
  }

  // Ensure version is set to current
  migratedData.version = CURRENT_CONFIG_VERSION;

  // Validate and fill in any missing fields with defaults
  return validateAndMergeDefaults(migratedData);
};

/**
 * Validate configuration and merge with defaults for any missing fields
 */
const validateAndMergeDefaults = (data: any): AppState => {
  return {
    version: CURRENT_CONFIG_VERSION,
    showDisclaimer: data.showDisclaimer !== undefined ? data.showDisclaimer : defaults.showDisclaimer,
    totalBudget: data.totalBudget !== undefined ? data.totalBudget : defaults.totalBudget,
    numMonths: data.numMonths !== undefined ? data.numMonths : defaults.numMonths,
    customMonths: data.customMonths !== undefined ? data.customMonths : defaults.customMonths,
    startInDecember: data.startInDecember !== undefined ? data.startInDecember : defaults.startInDecember,
    carAllowance: data.carAllowance !== undefined ? data.carAllowance : defaults.carAllowance,
    healthPlan: data.healthPlan !== undefined ? data.healthPlan : defaults.healthPlan,
    employeeIncluded: data.employeeIncluded !== undefined ? data.employeeIncluded : defaults.employeeIncluded,
    spouseIncluded: data.spouseIncluded !== undefined ? data.spouseIncluded : defaults.spouseIncluded,
    dependentsUnder25: data.dependentsUnder25 !== undefined ? data.dependentsUnder25 : defaults.dependentsUnder25,
    dependents25Plus: data.dependents25Plus !== undefined ? data.dependents25Plus : defaults.dependents25Plus,
    priorities: Array.isArray(data.priorities) ? data.priorities : defaults.priorities,
  };
};

/**
 * Example migration function (for future use when upgrading to v2)
 * Uncomment and modify when you need to migrate from v1 to v2
 */
// const migrateV1toV2 = (data: any): any => {
//   // Example: Add new field with default value
//   return {
//     ...data,
//     newFieldInV2: 'default_value',
//   };
// };
