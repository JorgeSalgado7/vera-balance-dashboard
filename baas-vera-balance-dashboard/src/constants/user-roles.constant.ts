export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  CLINIC: 'clinic',
  THERAPIST: 'therapist',
} as const)

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const USER_ROLE_VALUES = Object.values(USER_ROLES)
