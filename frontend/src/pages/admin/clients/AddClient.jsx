import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientList from "./ClientList";
import ClientModal from "../../../components/clients/ClientModal";

export default function AddClient() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <>
      <ClientList />
      <ClientModal
        open={modalOpen}
        client={null}
        onClose={() => {
          setModalOpen(false);
          navigate("/admin/clients");
        }}
        onSuccess={() => {
          setModalOpen(false);
          navigate("/admin/clients");
        }}
      />
    </>
  );
}