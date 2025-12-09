/**
 * Subject transformation utilities
 * Handles conversion between UI display (capitalized) and database storage (lowercase)
 */

// Database values (lowercase) - matches backend schema enum
export const SUBJECT_DB_VALUES = [
  "physics",
  "chemistry",
  "mathematics",
  "biology",
  "hindi",
  "english",
] as const;

// UI display values (capitalized)
export const SUBJECT_DISPLAY_VALUES = {
  physics: "Physics",
  chemistry: "Chemistry",
  mathematics: "Mathematics",
  biology: "Biology",
  hindi: "Hindi",
  english: "English",
} as const;

export type SubjectDBValue = (typeof SUBJECT_DB_VALUES)[number];
export type SubjectDisplayValue =
  (typeof SUBJECT_DISPLAY_VALUES)[keyof typeof SUBJECT_DISPLAY_VALUES];

/**
 * Convert database value to UI display value
 * @param dbValue - lowercase subject from database
 * @returns Capitalized subject for UI display
 */
export function subjectToDisplay(dbValue: string): string {
  const normalized = dbValue.toLowerCase() as SubjectDBValue;
  return SUBJECT_DISPLAY_VALUES[normalized] || dbValue;
}

/**
 * Convert UI display value to database value
 * @param displayValue - Capitalized subject from UI
 * @returns Lowercase subject for database storage
 */
export function subjectToDB(displayValue: string): string {
  // Find the DB key that matches the display value
  const entry = Object.entries(SUBJECT_DISPLAY_VALUES).find(
    ([, display]) => display.toLowerCase() === displayValue.toLowerCase()
  );
  return entry ? entry[0] : displayValue.toLowerCase();
}

/**
 * Get array of subjects for UI display (capitalized)
 */
export function getSubjectDisplayOptions(): SubjectDisplayValue[] {
  return Object.values(SUBJECT_DISPLAY_VALUES);
}

/**
 * Get array of subjects for database (lowercase)
 */
export function getSubjectDBOptions(): SubjectDBValue[] {
  return [...SUBJECT_DB_VALUES];
}

/**
 * Convert array of database subjects to display subjects
 */
export function subjectsToDisplay(dbValues: string[]): string[] {
  return dbValues.map(subjectToDisplay);
}

/**
 * Convert array of display subjects to database subjects
 */
export function subjectsToDB(displayValues: string[]): string[] {
  return displayValues.map(subjectToDB);
}
