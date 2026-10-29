import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Extras() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="extras" onModalClose={() => navigate("/admin/settings/general")} />;
}