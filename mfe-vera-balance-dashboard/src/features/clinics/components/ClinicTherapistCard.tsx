//* REACT
import { useState } from 'react'

//* ANT DESIGN
import { Button, Card, Select, Tag } from 'antd'

//* ICONS
import { CloseOutlined, EditOutlined } from '@ant-design/icons'

//* COMPONENTS
import { VBInputText } from '../../../ui/components/inputs/VBInputText'

//* INITIALS
import { getInitials } from '../../../shared/strings/get-initials'

//* CLINIC
import { useUpdateClinicTherapist } from '../hooks/use-update-clinic-therapist'
import type { ClinicTherapistCardI } from './interfaces/clinic-therapist-card.interface'

//* LOCALES
import { locales } from '../../../locales'

export const ClinicTherapistCard = ({ therapist, canEdit, updateTherapist, updateTherapistStatus, onSaved }: ClinicTherapistCardI) => {
  const texts = locales.clinics
  const [isEditing, setEditing] = useState(false)
  const [name, setName] = useState(therapist.name)
  const [professionalLicense, setProfessionalLicense] = useState(therapist.professionalLicense)
  const [role, setRole] = useState(therapist.role)
  const [status, setStatus] = useState(therapist.status)
  const editing = canEdit && isEditing
  const { save, pending, resetFeedback } = useUpdateClinicTherapist(therapist, updateTherapist, updateTherapistStatus, editing, saved => {
    setName(saved.name)
    setProfessionalLicense(saved.professionalLicense)
    setRole(saved.role)
    setStatus(saved.status)
    setEditing(false)
    onSaved(saved)
  }, onSaved)
  const dirty = name !== therapist.name || professionalLicense !== therapist.professionalLicense || role !== therapist.role || status !== therapist.status

  return (
    <Card className="vb-clinics__therapist-card">
      {/** AVATAR */}
      <div className="vb-clinics__therapist-avatar" aria-hidden="true">{getInitials(therapist.name)}</div>

      {/** EDIT TOGGLE */}
      {canEdit && (
        <Button
          type="text"
          className="vb-clinics__edit-toggle vb-clinics__therapist-edit"
          icon={editing ? <CloseOutlined /> : <EditOutlined />}
          aria-label={`${editing ? texts.cancelEdit : texts.editTherapist}: ${therapist.name}`}
          title={editing ? texts.cancelEdit : texts.editTherapist}
          aria-pressed={editing}
          disabled={pending}
          onClick={() => {
            setName(therapist.name)
            setProfessionalLicense(therapist.professionalLicense)
            setRole(therapist.role)
            setStatus(therapist.status)
            resetFeedback()
            setEditing(value => !value)
          }}
        />
      )}

      {/** NAME AND STATUS */}
      <div className="vb-clinics__therapist-heading">
        <h3>{therapist.name}</h3>
        {/** ROLE AND STATUS */}
        <div className="vb-clinics__therapist-chips">
          {editing ? <>
            <Select
              className="vb-clinics__chip-select"
              aria-label={texts.fields.role}
              value={role}
              onChange={setRole}
              disabled={pending}
              popupMatchSelectWidth={false}
              options={(['clinic', 'therapist'] as const).map(value => ({ value, label: texts.roles[value] }))}
            />
            <Select
              className="vb-clinics__chip-select"
              aria-label={texts.fields.status}
              value={status}
              onChange={setStatus}
              disabled={pending}
              popupMatchSelectWidth={false}
              options={texts.statuses.map(value => ({ value, label: value }))}
            />
          </> : <>
            <Tag className="vb-clinics__role">{texts.roles[therapist.role]}</Tag>
            <Tag className={`vb-clinics__status vb-clinics__status--${therapist.status === 'Activo' ? 'active' : 'inactive'}`}>{therapist.status}</Tag>
          </>}
        </div>
      </div>

      {/** THERAPIST INFORMATION */}
      {editing ? (
        <div className="vb-clinics__fields">
          <VBInputText label={texts.fields.name} value={name} setValue={setName} disabled={pending} hasError={!name.trim()} errorMessage={texts.required.therapistName} />
          <VBInputText label={texts.fields.email} value={therapist.email} setValue={() => {}} disabled hasError={false} errorMessage="" />
          <VBInputText label={texts.fields.professionalLicense} value={professionalLicense} setValue={setProfessionalLicense} disabled={pending} hasError={!professionalLicense.trim()} errorMessage={texts.required.professionalLicense} />
        </div>
      ) : (
        <dl className="vb-clinics__therapist-information">
          <div><dt>{texts.fields.email}</dt><dd>{therapist.email}</dd></div>
          <div><dt>{texts.fields.professionalLicense}</dt><dd>{therapist.professionalLicense}</dd></div>
        </dl>
      )}

      {/** SAVE CHANGES */}
      {editing && <Button type="primary" loading={pending} disabled={pending || !dirty || !name.trim() || !professionalLicense.trim()} onClick={() => save({ name, professionalLicense, role }, status)}>{texts.updateTherapist}</Button>}
    </Card>
  )
}
