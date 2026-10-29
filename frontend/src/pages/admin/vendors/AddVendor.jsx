import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VendorList from "./VendorList";
import VendorModal from "../../../components/vendors/VendorModal";

export default function AddVendor() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <>
      <VendorList />
      <VendorModal
        open={modalOpen}
        vendor={null}
        onClose={() => {
          setModalOpen(false);
          navigate("/admin/vendors");
        }}
        onSuccess={() => {
          setModalOpen(false);
          navigate("/admin/vendors");
        }}
      />
    </>
  );
}
