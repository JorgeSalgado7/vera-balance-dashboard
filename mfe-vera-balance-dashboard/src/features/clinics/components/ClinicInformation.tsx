//* REACT
import { useState } from 'react'

//* ANT DESIGN
import { Button, Card } from 'antd'

//* ICONS
import { CloseOutlined, EditOutlined } from '@ant-design/icons'

//* COMPONENTS
import { VBInputText } from '../../../ui/components/inputs/VBInputText'

//* CLINIC
import { useUpdateClinic } from '../hooks/use-update-clinic'
import type { ClinicInformationI } from './interfaces/clinic-information.interface'

//* LOCALES
import { locales } from '../../../locales'

export const ClinicInformation = ({ clinic, canEdit, updateClinic, onSaved }: ClinicInformationI) => {
  const texts = locales.clinics
  const [isEditing, setEditing] = useState(false)
  const [name, setName] = useState(clinic.name)
  const [address, setAddress] = useState(clinic.address)
  const [phoneNumber, setPhoneNumber] = useState(clinic.phoneNumber)
  const { save, pending } = useUpdateClinic(clinic.id, updateClinic, canEdit && isEditing, saved => {
    setName(saved.name)
    setAddress(saved.address)
    setPhoneNumber(saved.phoneNumber)
    setEditing(false)
    onSaved(saved)
  })
  const disabled = !canEdit || !isEditing || pending
  const dirty = name !== clinic.name || address !== clinic.address || phoneNumber !== clinic.phoneNumber

  return (
    <Card className="vb-clinics__information">
      {/** TITLE */}
      <div className="vb-clinics__information-heading">
        <h2>{texts.information}</h2>

        {/** EDIT TOGGLE */}
        {canEdit && (
          <Button
            type="text"
            className="vb-clinics__edit-toggle"
            icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
            aria-label={isEditing ? texts.cancelEdit : texts.edit}
            title={isEditing ? texts.cancelEdit : texts.edit}
            aria-pressed={isEditing}
            disabled={pending}
            onClick={() => {
              setName(clinic.name)
              setAddress(clinic.address)
              setPhoneNumber(clinic.phoneNumber)
              setEditing(value => !value)
            }}
          />
        )}
      </div>

      {/** CLINIC FIELDS */}
      <div className="vb-clinics__fields">
        <VBInputText label={texts.fields.name} value={name} setValue={setName} disabled={disabled} hasError={!name.trim()} errorMessage={texts.required.name} />
        <VBInputText label={texts.fields.address} value={address} setValue={setAddress} disabled={disabled} hasError={!address.trim()} errorMessage={texts.required.address} />
        <VBInputText label={texts.fields.phoneNumber} value={phoneNumber} setValue={setPhoneNumber} disabled={disabled} hasError={!phoneNumber.trim()} errorMessage={texts.required.phoneNumber} />
      </div>

      {/** SAVE CHANGES */}
      {canEdit && isEditing && <Button type="primary" loading={pending} disabled={pending || !dirty || !name.trim() || !address.trim() || !phoneNumber.trim()} onClick={() => save({ name, address, phoneNumber })}>{texts.update}</Button>}
    </Card>
  )
}
