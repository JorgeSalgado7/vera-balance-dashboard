import { UnsupportedTherapyTypeError, InvalidTherapyPatientCountError, InvalidChildTherapyPatientError, MissingTherapyPatientGuardianError, InvalidChildTherapyContactError } from '../errors/therapeutic-process.error'

export class ValidateTherapyPatientsDomainService {
  execute(kind: string, patients: Array<{ birthday: string, guardian: { name: string, phone_number: string, relationship: string } | null, phone_number: string | null }>, now: string): void {
    if (!['Individual', 'Pareja', 'Familiar', 'Infantil'].includes(kind)) throw new UnsupportedTherapyTypeError()
    if ((kind === 'Individual' || kind === 'Infantil') && patients.length !== 1) throw new InvalidTherapyPatientCountError(kind, 'exactamente un paciente')
    if (kind === 'Pareja' && patients.length !== 2) throw new InvalidTherapyPatientCountError(kind, 'exactamente dos pacientes')
    if (kind === 'Familiar' && patients.length < 2) throw new InvalidTherapyPatientCountError(kind, 'al menos dos pacientes')
    const today = now.slice(0, 10)
    for (const patient of patients) {
      const age = Number(today.slice(0, 4)) - Number(patient.birthday.slice(0, 4)) - (today.slice(5) < patient.birthday.slice(5) ? 1 : 0)
      if (kind === 'Infantil' && age >= 18) throw new InvalidChildTherapyPatientError()
      if (age < 18 && ['Individual', 'Familiar', 'Infantil'].includes(kind) && !patient.guardian) throw new MissingTherapyPatientGuardianError()
      if (kind === 'Infantil' && patient.phone_number !== null) throw new InvalidChildTherapyContactError()
    }
  }
}
