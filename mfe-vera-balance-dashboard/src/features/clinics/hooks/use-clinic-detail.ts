import { useEffect, useState } from 'react'
import type { Clinic } from '../domain/entities/clinic.entity'
import type { ClinicTherapist } from '../domain/entities/clinic-therapist.entity'
import type { GetClinicUseCase } from '../application/use-cases/get-clinic.use-case'
import type { GetClinicTherapistsUseCase } from '../application/use-cases/get-clinic-therapists.use-case'
import { locales } from '../../../locales'

export const useClinicDetail = (clinicId: string, getClinic: GetClinicUseCase, getTherapists: GetClinicTherapistsUseCase, enabled: boolean) => {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [therapists, setTherapists] = useState<ClinicTherapist[]>([])
  const [loading, setLoading] = useState(true)
  const [therapistsLoading, setTherapistsLoading] = useState(true)
  const [error, setError] = useState('')
  const [therapistsError, setTherapistsError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [therapistsAttempt, setTherapistsAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let active = true
    setClinic(null)
    setLoading(true)
    setError('')

    getClinic.execute(clinicId).then(result => {
      if (active) setClinic(result)
    }).catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : locales.api.requestError)
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [clinicId, getClinic, enabled, attempt])

  useEffect(() => {
    if (!enabled) return
    let active = true
    setTherapists([])
    setTherapistsLoading(true)
    setTherapistsError('')

    getTherapists.execute(clinicId).then(result => {
      if (active) setTherapists(result)
    }).catch((failure: unknown) => {
      if (active) setTherapistsError(failure instanceof Error ? failure.message : locales.api.requestError)
    }).finally(() => {
      if (active) setTherapistsLoading(false)
    })

    return () => { active = false }
  }, [clinicId, getTherapists, enabled, therapistsAttempt])

  return {
    clinic, setClinic, therapists, loading, therapistsLoading, error, therapistsError,
    replaceTherapist: (saved: ClinicTherapist) => setTherapists(current => current.map(therapist => therapist.id === saved.id ? saved : therapist)),
    retryClinic: () => setAttempt(value => value + 1),
    retryTherapists: () => setTherapistsAttempt(value => value + 1),
  }
}
