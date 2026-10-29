import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InvoiceList from "./InvoiceList";
import InvoiceModal from "../../../components/invoices/InvoiceModal";
import { getInvoice } from "../../../api/invoices";

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (id) {
      getInvoice(id)
        .then((res) => {
          setInvoice(res?.data || res);
        })
        .catch(() => {
          navigate("/admin/invoices");
        });
    }
  }, [id, navigate]);

  return (
    <>
      <InvoiceList />
      {invoice && (
        <InvoiceModal
          open={modalOpen}
          invoice={invoice}
          onClose={() => {
            setModalOpen(false);
            navigate("/admin/invoices");
          }}
          onSuccess={() => {
            setModalOpen(false);
            navigate("/admin/invoices");
          }}
        />
      )}
    </>
  );
}