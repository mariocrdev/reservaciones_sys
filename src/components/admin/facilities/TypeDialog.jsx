import { useState, useEffect } from "react";
import { useCreateType, useUpdateType } from "@/hooks/admin/useAdminFacilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TypeDialog({ open, onOpenChange, type }) {
  const createMutation = useCreateType();
  const updateMutation = useUpdateType();
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (open && type)
      setFormData({ name: type.name, description: type.description || "" });
    else if (open) setFormData({ name: "", description: "" });
  }, [open, type]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (type) {
      updateMutation.mutate(
        { id: type.id, data: formData },
        {
          onSuccess: () => {
            toast.success("Tipo actualizado");
            onOpenChange(false);
          },
          onError: () => toast.error("Error al actualizar"),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Tipo creado");
          onOpenChange(false);
        },
        onError: () => toast.error("Error al crear"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type ? "Editar Tipo" : "Nuevo Tipo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              {type ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
