import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Quotation() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="quotation" onModalClose={() => navigate("/admin/settings/general")} />;
}