export interface CompletionCheckEducator {
  profilePicture?: string;
  image?: { url?: string };
  description?: string;
  introVideo?: string;
  workExperience?: unknown[];
  qualification?: unknown[];
  socials?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface MissingProfileField {
  key: string;
  label: string;
  tabTarget: "profile" | "experience";
  weight: number;
}

const hasNonEmptyArray = (value: unknown[] | undefined) =>
  Array.isArray(value) && value.length > 0;

const hasSocialLink = (socials: CompletionCheckEducator["socials"]) => {
  if (!socials) return false;
  return Object.values(socials).some((value) => Boolean(value && value.trim()));
};

const FIELD_CHECKS: Array<{
  key: string;
  label: string;
  tabTarget: MissingProfileField["tabTarget"];
  weight: number;
  isMissing: (educator: CompletionCheckEducator) => boolean;
}> = [
  {
    key: "profilePicture",
    label: "Add a profile picture",
    tabTarget: "profile",
    weight: 20,
    isMissing: (educator) =>
      !educator.profilePicture && !educator.image?.url,
  },
  {
    key: "bio",
    label: "Write a short bio",
    tabTarget: "profile",
    weight: 20,
    isMissing: (educator) =>
      !educator.description || educator.description.trim().length < 20,
  },
  {
    key: "introVideo",
    label: "Upload an intro video",
    tabTarget: "profile",
    weight: 15,
    isMissing: (educator) => !educator.introVideo,
  },
  {
    key: "workExperience",
    label: "Add your work experience",
    tabTarget: "experience",
    weight: 15,
    isMissing: (educator) => !hasNonEmptyArray(educator.workExperience),
  },
  {
    key: "qualification",
    label: "Add your qualifications",
    tabTarget: "experience",
    weight: 15,
    isMissing: (educator) => !hasNonEmptyArray(educator.qualification),
  },
  {
    key: "socials",
    label: "Add at least one social link",
    tabTarget: "profile",
    weight: 15,
    isMissing: (educator) => !hasSocialLink(educator.socials),
  },
];

export const getMissingProfileFields = (
  educator: CompletionCheckEducator | null | undefined
): MissingProfileField[] => {
  if (!educator) return [];

  return FIELD_CHECKS.filter((check) => check.isMissing(educator)).map(
    ({ key, label, tabTarget, weight }) => ({ key, label, tabTarget, weight })
  );
};

export const getProfileCompletion = (
  educator: CompletionCheckEducator | null | undefined
): { percent: number; missing: MissingProfileField[] } => {
  const missing = getMissingProfileFields(educator);
  const missingWeight = missing.reduce((sum, field) => sum + field.weight, 0);
  const percent = educator ? Math.max(0, 100 - missingWeight) : 100;

  return { percent, missing };
};
