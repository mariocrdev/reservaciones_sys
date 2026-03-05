import { useState, useEffect } from "react";
import {
  useCreateFacility,
  useUpdateFacility,
  useAdminFacilityTypes,
} from "@/hooks/admin/useAdminFacilities";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function FacilityDialog({ open, onOpenChange, facility, types }) {
  const createMutation = useCreateFacility();
  const updateMutation = useUpdateFacility();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type_id: "",
    capacity: 1,
    price_per_hour: 0,
    is_active: true,
  });

  useEffect(() => {
    if (open && facility) {
      setFormData({
        name: facility.name,
        description: facility.description || "",
        type_id: facility.type_id || "",
        capacity: facility.capacity,
        price_per_hour: facility.price_per_hour || 0,
        is_active: facility.is_active,
      });
    } else if (open && !facility) {
      setFormData({
        name: "",
        description: "",
        type_id: "",
        capacity: 1,
        price_per_hour: 0,
        is_active: true,
      });
    }
  }, [open, facility]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!formData.type_id) {
      toast.error("Seleccione un tipo de instalación");
      return;
    }

    try {
      if (facility) {
        updateMutation.mutate(
          { id: facility.id, data: formData },
          {
            onSuccess: () => {
              toast.success("Actualizado correctamente");
              onOpenChange(false);
            },
            onError: () => toast.error("Error al actualizar"),
          },
        );
      } else {
        createMutation.mutate(formData, {
          onSuccess: () => {
            toast.success("Creado correctamente");
            onOpenChange(false);
          },
          onError: () => toast.error("Error al crear"),
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado: " + err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {facility ? "Editar Instalación" : "Nueva Instalación"}
          </DialogTitle>
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
            <Label>Tipo</Label>
            <Select
              value={formData.type_id}
              onValueChange={(val) =>
                setFormData({ ...formData, type_id: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Capacidad</Label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Precio / Hora</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_hour}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_per_hour: parseFloat(e.target.value),
                  })
                }
              />
            </div>
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
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">Activo</Label>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              {facility ? "Guardar Cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
