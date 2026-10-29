import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VendorList from "./VendorList";
import VendorViewModal from "../../../components/vendors/VendorViewModal";
import VendorModal from "../../../components/vendors/VendorModal";
import { getVendor } from "../../../api/vendors";

export default function ViewVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [viewOpen, setViewOpen] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

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
        <>
          <VendorViewModal
            open={viewOpen}
            vendor={vendor}
            onClose={() => {
              setViewOpen(false);
              navigate("/admin/vendors");
            }}
            onEdit={() => {
              setViewOpen(false);
              setEditOpen(true);
            }}
          />
          <VendorModal
            open={editOpen}
            vendor={vendor}
            onClose={() => {
              setEditOpen(false);
              navigate("/admin/vendors");
            }}
            onSuccess={() => {
              setEditOpen(false);
              navigate("/admin/vendors");
            }}
          />
        </>
      )}
    </>
  );
}
