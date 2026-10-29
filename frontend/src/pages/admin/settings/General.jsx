import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function General() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="general" onModalClose={() => navigate("/admin/settings/general")} />;
}