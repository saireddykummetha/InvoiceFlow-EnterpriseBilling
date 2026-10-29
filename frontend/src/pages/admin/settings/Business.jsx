import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Business() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="business" onModalClose={() => navigate("/admin/settings/general")} />;
}