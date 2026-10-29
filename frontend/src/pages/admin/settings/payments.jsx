import { useNavigate } from "react-router-dom";
import SettingsHub from "./SettingsHub";

export default function Payments() {
  const navigate = useNavigate();
  return <SettingsHub initialCategory="payments" onModalClose={() => navigate("/admin/settings/general")} />;
}
