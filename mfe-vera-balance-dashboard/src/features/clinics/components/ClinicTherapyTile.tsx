//* ICONS
import { HeartOutlined, MedicineBoxOutlined, SmileOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'

//* INTERFACES
import type { ClinicTherapyTileI } from './interfaces/clinic-therapy-tile.interface'

const fallbackIcons: Record<string, typeof UserOutlined> = {
  Individual: UserOutlined,
  Pareja: HeartOutlined,
  Familiar: TeamOutlined,
  Infantil: SmileOutlined,
}

const apiIcons: Record<string, typeof UserOutlined> = {
  UserOutlined,
  HeartOutlined,
  TeamOutlined,
  SmileOutlined,
  MedicineBoxOutlined,
}

export const ClinicTherapyTile = ({ therapy }: ClinicTherapyTileI) => {
  const Icon = therapy.icon === null
    ? fallbackIcons[therapy.name] ?? MedicineBoxOutlined
    : apiIcons[therapy.icon]

  return (
    <article className="vb-clinics__therapy-tile">
      {/** THERAPY ICON */}
      <div className="vb-clinics__therapy-icon" aria-hidden="true">
        {Icon && <Icon />}
      </div>

      {/** THERAPY NAME */}
      <h3>{therapy.name}</h3>
    </article>
  )
}
