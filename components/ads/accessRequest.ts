const MAX_EMAIL_LENGTH = 254;
const MAX_ORGANISATION_LENGTH = 200;
export const MAX_INSEE_CODES = 100;

const EMAIL_PATTERN = /^[^\s@,;<>"]+@(?:[^\s@,;<>".]+\.)+[^\s@,;<>".]{2,}$/;
// Departments 01-95, 2A, 2B, 96-98 (overseas), then 3 digits.
const INSEE_CODE_PATTERN = /^(?:0[1-9]|1\d|2[1-9AB]|[3-8]\d|9[0-8])\d{3}$/;

export type AdsAccessRequestErrors = {
  email?: string;
  inseeCodes?: string;
  organisation?: string;
  captcha?: string;
};

type AdsAccessRequest = {
  email: string;
  inseeCodes: string[];
  organisation: string;
};

type AdsAccessRequestValidation =
  | { ok: true; value: AdsAccessRequest }
  | { ok: false; fieldErrors: AdsAccessRequestErrors };

function validateEmail(email: string): string | undefined {
  if (!email) {
    return "L'adresse email est obligatoire.";
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return "L'adresse email n'est pas valide.";
  }
}

export function validateInseeCode(code: string): string | undefined {
  if (!INSEE_CODE_PATTERN.test(code)) {
    return `Code INSEE invalide : ${code}`;
  }
}

function validateInseeCodes(codes: string[]): string | undefined {
  if (codes.length === 0) {
    return 'Indiquez au moins un code INSEE.';
  }
  if (codes.length > MAX_INSEE_CODES) {
    return `Indiquez au maximum ${MAX_INSEE_CODES} codes INSEE.`;
  }
  const malformed = codes.filter((code) => validateInseeCode(code));
  if (malformed.length > 0) {
    return `Codes INSEE invalides : ${malformed.slice(0, 5).join(', ')}${
      malformed.length > 5 ? '…' : ''
    }`;
  }
}

function validateOrganisation(organisation: string): string | undefined {
  if (!organisation) {
    return "L'organisation est obligatoire.";
  }
  if (organisation.length > MAX_ORGANISATION_LENGTH) {
    return `L'organisation ne doit pas dépasser ${MAX_ORGANISATION_LENGTH} caractères.`;
  }
  if (/[<>]/.test(organisation)) {
    return "L'organisation ne doit pas contenir les caractères < et >.";
  }
}

export function validateAdsAccessRequest({
  email,
  inseeCodes,
  organisation,
}: {
  email: string;
  inseeCodes: string[];
  organisation: string;
}): AdsAccessRequestValidation {
  const value: AdsAccessRequest = {
    email: email.trim(),
    inseeCodes: Array.from(
      new Set(inseeCodes.map((code) => code.trim().toUpperCase())),
    ),
    organisation: organisation.trim(),
  };

  const fieldErrors: AdsAccessRequestErrors = {
    email: validateEmail(value.email),
    inseeCodes: validateInseeCodes(value.inseeCodes),
    organisation: validateOrganisation(value.organisation),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { ok: false, fieldErrors };
  }
  return { ok: true, value };
}
