import { useTranslation } from "react-i18next"
import { ShipLabCanvas } from "~/components/ShipLabCanvas"

export default function ShipLab() {
  const { t } = useTranslation()

  return (
    <section className="ship-lab">
      <p className="ship-lab__label">{t("shipLab.title")}</p>
      <ShipLabCanvas />
    </section>
  )
}
