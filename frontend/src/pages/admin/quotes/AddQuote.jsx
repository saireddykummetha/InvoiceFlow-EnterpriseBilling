import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuoteList from "./QuoteList";
import QuoteModal from "../../../components/quotes/QuoteModal";

export default function AddQuote() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <>
      <QuoteList />
      <QuoteModal
        open={modalOpen}
        quote={null}
        onClose={() => {
          setModalOpen(false);
          navigate("/admin/quotes");
        }}
        onSuccess={() => {
          setModalOpen(false);
          navigate("/admin/quotes");
        }}
      />
    </>
  );
}