import { useState } from "react";
import {
  useAdminFacilityTypes,
  useDeleteType,
} from "@/hooks/admin/useAdminFacilities";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TypeDialog } from "./TypeDialog";

export function TypesManager() {
  const { data: types, isLoading } = useAdminFacilityTypes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tipos de Instalación</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setEditingType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Tipo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm">Cargando tipos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types?.map((type) => (
            <div
              key={type.id}
              className="p-4 border rounded-md flex justify-between items-center bg-card"
            >
              <div>
                <div className="font-semibold">{type.name}</div>
                <div className="text-sm text-muted-foreground">
                  {type.description}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingType(type);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <DeleteTypeButton id={type.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <TypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        type={editingType}
      />
    </div>
  );
}

function DeleteTypeButton({ id }) {
  const deleteMutation = useDeleteType();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive"
      onClick={() => {
        if (confirm("¿Estás seguro de eliminar este tipo?")) {
          deleteMutation.mutate(id, {
            onSuccess: () => toast.success("Tipo eliminado"),
            onError: () => toast.error("Error al eliminar"),
          });
        }
      }}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
