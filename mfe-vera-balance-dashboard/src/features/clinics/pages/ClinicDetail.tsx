//* REACT ROUTER
import { Navigate, useParams } from 'react-router-dom'

//* ANT DESIGN
import { Button, Spin } from 'antd'

//* REDUX
import { useAppDispatch, useAppSelector } from '../../../store/hooks'

//* SESSION
import { setSession } from '../../auth/application/store/session/session.slice'

//* LAYOUT
import { DashbaordLayout } from '../../../layouts/dashboard/DashbaordLayout'

//* COMPONENTS
import { ClinicInformation } from '../components/ClinicInformation'
import { ClinicTherapies } from '../components/ClinicTherapies'
import { ClinicTherapists } from '../components/ClinicTherapists'

//* ALERTS
import { usePublishAlert } from '../../../shared/hooks/use-publish-alert'

//* CLINIC
import { useClinicDetail } from '../hooks/use-clinic-detail'
import type { ClinicDetailI } from './interfaces/clinic-detail.interface'

//* LOCALES
import { locales } from '../../../locales'

export const ClinicDetail = ({ getClinic, getTherapists, updateClinic, updateTherapist, updateTherapistStatus }: ClinicDetailI) => {
  const { clinicId = '' } = useParams<{ clinicId: string }>()
  const dispatch = useAppDispatch()
  const session = useAppSelector(state => state.session)
  const user = session.user
  const texts = locales.clinics
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clinicId)
  const ownClinic = Boolean(user?.clinic && user.clinic === clinicId)
  const canView = Boolean(user && validId && (ownClinic || user.role === 'admin'))
  const canEdit = user?.role === 'clinic' && ownClinic
  const detail = useClinicDetail(clinicId, getClinic, getTherapists, canView)
  const clinic = detail.clinic?.id === clinicId ? detail.clinic : null

  const accessMessage = !canView && !(!clinicId && user?.clinic)
    ? !user?.clinic && user?.role !== 'admin' ? texts.noClinic : !validId ? texts.invalidId : texts.unavailableClinic
    : ''
  usePublishAlert(`clinic-access:${clinicId}`, accessMessage, 'warning')
  usePublishAlert(`clinic-load:${clinicId}`, detail.error, 'error')
  usePublishAlert(`clinic-therapists-load:${clinicId}`, detail.therapistsError, 'error')

  if (!clinicId && user?.clinic) return <Navigate to={`/clinic-detail/${encodeURIComponent(user.clinic)}`} replace />

  return (
    <DashbaordLayout pageTitle={texts.title}>
      {/** CLINIC ACCESS */}
      {canView && (
        <div className="vb-clinics">
          {/** LOADING AND ERRORS */}
          {detail.loading && <div className="vb-clinics__loading" role="status" aria-label={texts.loading}><Spin /></div>}
          {detail.error && <Button onClick={detail.retryClinic}>{texts.retry}</Button>}

          {/** CLINIC GRID */}
          <div className="vb-clinics__grid">
            {clinic && <>
              <ClinicInformation key={`information-${clinic.id}`} clinic={clinic} canEdit={canEdit} updateClinic={updateClinic} onSaved={detail.setClinic} />
              <ClinicTherapies key={`therapies-${clinic.id}`} clinic={clinic} />
            </>}
            <ClinicTherapists therapists={detail.therapists} loading={detail.therapistsLoading} error={detail.therapistsError} onRetry={detail.retryTherapists} canEdit={canEdit} updateTherapist={updateTherapist} updateTherapistStatus={updateTherapistStatus} onSaved={saved => {
              detail.replaceTherapist(saved)
              if (user?.id === saved.id && session.accessToken && session.refreshToken) {
                dispatch(setSession({
                  accessToken: session.accessToken,
                  refreshToken: session.refreshToken,
                  user: { id: saved.id, name: saved.name, email: saved.email, role: saved.role, clinic: saved.clinic },
                }))
              }
            }} />
          </div>
        </div>
      )}
    </DashbaordLayout>
  )
}
