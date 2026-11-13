import { PatientEntity } from '../../domain/entities/patient.entity'
import type { CreatePatientDto } from '../../application/dtos/create-patient.dto'

export const patientInput: CreatePatientDto = {
  clinic: 'clinic-id', name: 'Paciente', birthday: '2000-01-31', gender: 'Femenino',
  educational_level: 'Universidad', occupation: 'Docente', marital_status: 'Soltero', religion: 'Ninguna', address: 'Centro',
}

export const patient = () => Object.assign(new PatientEntity(), patientInput, {
  pk: 'patient-id', gsi1sk: 'PATIENT#patient-id', gsi2pk: 'CLINIC#clinic-id', gsi2sk: 'PATIENT#patient-id',
  guardian: null, phone_number: null, partner_data: null,
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
