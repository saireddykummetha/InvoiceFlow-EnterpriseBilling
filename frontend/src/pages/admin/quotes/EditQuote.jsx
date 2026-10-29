import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuoteList from "./QuoteList";
import QuoteModal from "../../../components/quotes/QuoteModal";
import { getQuote } from "../../../api/quotes";

export default function EditQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (id) {
      getQuote(id)
        .then((res) => {
          setQuote(res?.data || res);
        })
        .catch(() => {
          navigate("/admin/quotes");
        });
    }
  }, [id, navigate]);

  return (
    <>
      <QuoteList />
      {quote && (
        <QuoteModal
          open={modalOpen}
          quote={quote}
          onClose={() => {
            setModalOpen(false);
            navigate("/admin/quotes");
          }}
          onSuccess={() => {
            setModalOpen(false);
            navigate("/admin/quotes");
          }}
        />
      )}
    </>
  );
}