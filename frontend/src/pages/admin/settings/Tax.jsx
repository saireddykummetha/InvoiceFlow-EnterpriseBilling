import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Tax() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="tax" onModalClose={() => navigate("/admin/settings/general")} />;
}