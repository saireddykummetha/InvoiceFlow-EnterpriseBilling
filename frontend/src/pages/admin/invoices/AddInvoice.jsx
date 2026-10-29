import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceList from "./InvoiceList";
import InvoiceModal from "../../../components/invoices/InvoiceModal";

export default function AddInvoice() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <>
      <InvoiceList />
      <InvoiceModal
        open={modalOpen}
        invoice={null}
        onClose={() => {
          setModalOpen(false);
          navigate("/admin/invoices");
        }}
        onSuccess={() => {
          setModalOpen(false);
          navigate("/admin/invoices");
        }}
      />
    </>
  );
}