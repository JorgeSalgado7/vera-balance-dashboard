import { SetMetadata } from '@nestjs/common';

export const USE_CASE_SESSION_VALIDATION = Symbol('UseCaseSessionValidation');

// Auth's protected use cases already call the central session verifier.
// This keeps one current-state check and the operation's HTTP error semantics.
export const SessionValidatedByUseCase = () => SetMetadata(USE_CASE_SESSION_VALIDATION, true);
