import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Translate() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="translate" onModalClose={() => navigate("/admin/settings/general")} />;
}