import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientList from "./ClientList";
import ClientModal from "../../../components/clients/ClientModal";
import { getClient } from "../../../api/clients";

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (id) {
      getClient(id)
        .then((res) => {
          setClient(res?.data || res);
        })
        .catch(() => {
          navigate("/admin/clients");
        });
    }
  }, [id, navigate]);

  return (
    <>
      <ClientList />
      {client && (
        <ClientModal
          open={modalOpen}
          client={client}
          onClose={() => {
            setModalOpen(false);
            navigate("/admin/clients");
          }}
          onSuccess={() => {
            setModalOpen(false);
            navigate("/admin/clients");
          }}
        />
      )}
    </>
  );
}
