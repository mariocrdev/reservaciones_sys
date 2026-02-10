import { FacilitiesManager } from "@/components/admin/facilities/FacilitiesManager";
import { TypesManager } from "@/components/admin/facilities/TypesManager";

export default function AdminFacilities() {
  return (
    <div className="space-y-8">
      <FacilitiesManager />
      <hr className="my-8" />
      <TypesManager />
    </div>
  );
}
