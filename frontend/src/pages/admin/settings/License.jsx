import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function License() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="license" onModalClose={() => navigate("/admin/settings/general")} />;
}