import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Pdf() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="pdf" onModalClose={() => navigate("/admin/settings/general")} />;
}