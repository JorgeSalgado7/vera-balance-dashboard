import { useEffect, useRef, useState } from 'react'
import type { ClinicTherapist } from '../domain/entities/clinic-therapist.entity'
import type { ClinicTherapistChanges } from '../domain/entities/clinic-therapist-changes.entity'
import type { UpdateClinicTherapistUseCase } from '../application/use-cases/update-clinic-therapist.use-case'
import type { UpdateClinicTherapistStatusUseCase } from '../application/use-cases/update-clinic-therapist-status.use-case'
import { locales } from '../../../locales'
import { useAlert } from '../../../shared/hooks/use-alert'

export const useUpdateClinicTherapist = (current: ClinicTherapist, useCase: UpdateClinicTherapistUseCase, statusUseCase: UpdateClinicTherapistStatusUseCase, canEdit: boolean, onSaved: (therapist: ClinicTherapist) => void, onPartialSaved: (therapist: ClinicTherapist) => void) => {
  const [pending, setPending] = useState(false)
  const { show, clear: resetFeedback } = useAlert(`therapist-update:${current.id}`)

  const active = useRef(false)
  const saving = useRef(false)

  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])

  const save = async (changes: ClinicTherapistChanges, status: ClinicTherapist['status']) => {
    if (!canEdit || saving.current) return
    saving.current = true
    setPending(true)
    resetFeedback()
    let savedStatus: ClinicTherapist | null = null
    try {
      if (status !== current.status) savedStatus = await statusUseCase.execute(current.id, status)
      const profileChanged = changes.name.trim() !== current.name || changes.professionalLicense.trim() !== current.professionalLicense || changes.role !== current.role
      const therapist = profileChanged ? await useCase.execute(current.id, changes) : savedStatus ?? current
      if (active.current) {
        onSaved(therapist)
        show(locales.clinics.therapistSaved, 'success')
      }
    } catch (failure) {
      if (active.current) {
        const detail = failure instanceof Error ? failure.message : locales.api.requestError
        if (savedStatus) onPartialSaved(savedStatus)
        show(savedStatus ? `${locales.clinics.therapistPartiallySaved} ${detail}` : detail, 'error')
      }
    } finally {
      saving.current = false
      if (active.current) setPending(false)
    }
  }

  return { save, pending, resetFeedback }
}
