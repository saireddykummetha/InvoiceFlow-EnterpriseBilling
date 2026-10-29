import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Invoice() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="invoice" onModalClose={() => navigate("/admin/settings/general")} />;
}