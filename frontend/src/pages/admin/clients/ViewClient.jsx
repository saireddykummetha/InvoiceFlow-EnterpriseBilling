import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientList from "./ClientList";
import ClientViewModal from "../../../components/clients/ClientViewModal";
import ClientModal from "../../../components/clients/ClientModal";
import { getClient } from "../../../api/clients";

export default function ViewClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [viewOpen, setViewOpen] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

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
        <>
          <ClientViewModal
            open={viewOpen}
            client={client}
            onClose={() => {
              setViewOpen(false);
              navigate("/admin/clients");
            }}
            onEdit={() => {
              setViewOpen(false);
              setEditOpen(true);
            }}
          />
          <ClientModal
            open={editOpen}
            client={client}
            onClose={() => {
              setEditOpen(false);
              navigate("/admin/clients");
            }}
            onSuccess={() => {
              setEditOpen(false);
              navigate("/admin/clients");
            }}
          />
        </>
      )}
    </>
  );
}