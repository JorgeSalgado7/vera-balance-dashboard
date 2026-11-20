//* ANT DESIGN
import { Button, Empty, Spin } from 'antd'

//* COMPONENTS
import { ClinicTherapistCard } from './ClinicTherapistCard'

//* INTERFACES
import type { ClinicTherapistsI } from './interfaces/clinic-therapists.interface'

//* LOCALES
import { locales } from '../../../locales'

export const ClinicTherapists = ({ therapists, loading, error, onRetry, canEdit, updateTherapist, updateTherapistStatus, onSaved }: ClinicTherapistsI) => {
  const texts = locales.clinics

  return (
    <section className="vb-clinics__therapists" aria-label={texts.therapists}>
      {/** TITLE */}
      <h2>{texts.therapists}</h2>

      {/** LOADING AND ERRORS */}
      {loading ? <div className="vb-clinics__loading" role="status" aria-label={texts.loading}><Spin /></div> : error ? (
        <Button onClick={onRetry}>{texts.retry}</Button>
      ) : therapists.length === 0 ? <Empty description={texts.noTherapists} /> : (
        <div className="vb-clinics__therapist-list">
          {/** LINKED USERS */}
          {therapists.map(therapist => (
            <ClinicTherapistCard key={therapist.id} therapist={therapist} canEdit={canEdit} updateTherapist={updateTherapist} updateTherapistStatus={updateTherapistStatus} onSaved={onSaved} />
          ))}
        </div>
      )}
    </section>
  )
}
