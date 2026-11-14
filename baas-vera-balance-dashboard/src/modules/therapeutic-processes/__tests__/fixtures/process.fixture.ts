import { TherapeuticProcessEntity } from '../../domain/entities/therapeutic-process.entity'
import type { CreateTherapeuticProcessDto } from '../../application/dtos/create-therapeutic-process.dto'
import { ResolveTherapeuticProcessRelationsUseCase } from '../../application/use-cases/resolve-therapeutic-process-relations.use-case'
import { ValidateTherapeuticProcessRelationsUseCase } from '../../application/use-cases/validate-therapeutic-process-relations.use-case'
import { ValidateTherapyPatientsDomainService } from '../../domain/services/validate-therapy-patients.domain-service'
import type { FindTherapyTypesByIdsUseCase } from '../../../therapy-types/application/use-cases/find-therapy-types-by-ids.use-case'
import type { FindPatientsByIdsUseCase } from '../../../patients/application/use-cases/find-patients-by-ids.use-case'
import type { FindUsersByIdsUseCase } from '../../../users/application/use-cases/find-users-by-ids.use-case'
import type { ClinicExistsUseCase } from '../../../clinics/application/use-cases/clinic-exists.use-case'

export const input: CreateTherapeuticProcessDto = { clinic: 'clinic-id', therapy_type: 'therapy-id', therapist: 'therapist-id', patients: ['patient-id'], is_first_time: false, consultation_reason: 'Consulta', goals: 'Objetivos', status: 'Activo' }
export const processEntity = () => Object.assign(new TherapeuticProcessEntity(), input, {
  pk: 'process-id', patients: [...input.patients], gsi1sk: 'THERAPEUTIC_PROCESS#process-id',
  gsi2pk: 'CLINIC#clinic-id', gsi2sk: 'THERAPEUTIC_PROCESS#process-id',
  gsi3pk: 'THERAPIST#therapist-id', gsi3sk: 'THERAPEUTIC_PROCESS#process-id',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})

export function dependencies() {
  const repository = { create: jest.fn(async entity => entity), findById: jest.fn().mockResolvedValue(processEntity()), findByClinic: jest.fn().mockResolvedValue([processEntity()]), findByPatient: jest.fn().mockResolvedValue([processEntity()]), update: jest.fn(async (entity, changes, updated_at) => ({ ...entity, ...changes, updated_at })), updateStatus: jest.fn(async (_id, status, updated_at) => ({ ...processEntity(), status, updated_at })), deleteCascade: jest.fn() }
  const clinics = { execute: jest.fn().mockResolvedValue(true) }
  const therapyTypes = { execute: jest.fn(async (ids: string[]) => ids.map(id => ({ id, name: 'Individual', icon: null, created_at: 'private', updated_at: 'private' }))) }
  const users = { execute: jest.fn(async (ids: string[]) => ids.map(id => ({ id, name: 'Terapeuta', professional_license: '123', email: 'private@example.com', clinic: 'clinic-id' }))) }
  const patients = { execute: jest.fn(async (ids: string[]) => ids.map(id => ({ id, name: 'Paciente', birthday: '2000-01-01', guardian: null, phone_number: null, clinic: 'clinic-id' }))) }
  const resolver = new ResolveTherapeuticProcessRelationsUseCase(therapyTypes as unknown as FindTherapyTypesByIdsUseCase, users as unknown as FindUsersByIdsUseCase, patients as unknown as FindPatientsByIdsUseCase)
  const validator = new ValidateTherapeuticProcessRelationsUseCase(clinics as unknown as ClinicExistsUseCase, resolver, new ValidateTherapyPatientsDomainService())
  return { repository, clinics, therapyTypes, users, patients, resolver, validator }
}
