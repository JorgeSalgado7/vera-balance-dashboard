import { useEffect, useRef, useState } from 'react'
import type { Clinic } from '../domain/entities/clinic.entity'
import type { ClinicChanges } from '../domain/entities/clinic-changes.entity'
import type { UpdateClinicUseCase } from '../application/use-cases/update-clinic.use-case'
import { locales } from '../../../locales'
import { useAlert } from '../../../shared/hooks/use-alert'

export const useUpdateClinic = (clinicId: string, useCase: UpdateClinicUseCase, canEdit: boolean, onSaved: (clinic: Clinic) => void) => {
  const [pending, setPending] = useState(false)
  const { show, clear } = useAlert(`clinic-update:${clinicId}`)

  const active = useRef(false)
  const saving = useRef(false)

  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])

  const save = async (changes: ClinicChanges) => {
    if (!canEdit || saving.current) return
    saving.current = true
    setPending(true)
    clear()
    try {
      const clinic = await useCase.execute(clinicId, changes)
      if (active.current) {
        onSaved(clinic)
        show(locales.clinics.saved, 'success')
      }
    } catch (failure) {
      if (active.current) show(failure instanceof Error ? failure.message : locales.api.requestError, 'error')
    } finally {
      saving.current = false
      if (active.current) setPending(false)
    }
  }

  return { save, pending }
}
