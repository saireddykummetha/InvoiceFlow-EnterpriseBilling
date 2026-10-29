import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VendorList from "./VendorList";
import VendorModal from "../../../components/vendors/VendorModal";
import { getVendor } from "../../../api/vendors";

export default function EditVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (id) {
      getVendor(id)
        .then((res) => {
          setVendor(res?.data || res);
        })
        .catch(() => {
          navigate("/admin/vendors");
        });
    }
  }, [id, navigate]);

  return (
    <>
      <VendorList />
      {vendor && (
        <VendorModal
          open={modalOpen}
          vendor={vendor}
          onClose={() => {
            setModalOpen(false);
            navigate("/admin/vendors");
          }}
          onSuccess={() => {
            setModalOpen(false);
            navigate("/admin/vendors");
          }}
        />
      )}
    </>
  );
}
