//* ANT DESIGN
import { Card, Empty } from 'antd'

//* COMPONENTS
import { ClinicTherapyTile } from './ClinicTherapyTile'

//* INTERFACES
import type { ClinicTherapiesI } from './interfaces/clinic-therapies.interface'

//* LOCALES
import { locales } from '../../../locales'

export const ClinicTherapies = ({ clinic }: ClinicTherapiesI) => {
  const texts = locales.clinics

  return (
    <Card className="vb-clinics__therapies">
      {/** TITLE */}
      <h2>{texts.therapies}</h2>

      {/** ASSIGNED THERAPIES */}
      {clinic.therapyTypes.length === 0 ? <Empty description={texts.noTherapies} /> : (
        <div className="vb-clinics__therapy-list">
          {clinic.therapyTypes.map(therapy => <ClinicTherapyTile key={therapy.id} therapy={therapy} />)}
        </div>
      )}
    </Card>
  )
}
