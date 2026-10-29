import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Emails() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="emails" onModalClose={() => navigate("/admin/settings/general")} />;
}