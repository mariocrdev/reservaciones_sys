import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useFacilityHours,
  useCreateFacilityHour,
  useDeleteFacilityHour,
} from "@/hooks/admin/useFacilityHours";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export function FacilityHoursDialog({ facility, open, onOpenChange }) {
  const { data: hours, isLoading } = useFacilityHours(facility?.id);
  const createMutation = useCreateFacilityHour();
  const deleteMutation = useDeleteFacilityHour();

  const [newHour, setNewHour] = useState({
    day_of_week: "1", // Default Monday
    open_time: "08:00",
    close_time: "18:00",
  });

  if (!facility) return null;

  const handleAddHour = (e) => {
    e.preventDefault();
    if (newHour.open_time >= newHour.close_time) {
      toast.error("La hora de cierre debe ser posterior a la de apertura");
      return;
    }

    createMutation.mutate(
      { ...newHour, facility_id: facility.id },
      {
        onSuccess: () => {
          toast.success("Horario agregado");
          // Reset form? maybe keep values for easier repeat entry
        },
        onError: (err) => {
          console.error(err);
          toast.error("Error al agregar horario: " + err.message);
        },
      },
    );
  };

  const handleDeleteHour = (id) => {
    deleteMutation.mutate(
      { id, facilityId: facility.id },
      {
        onSuccess: () => toast.success("Horario eliminado"),
        onError: () => toast.error("Error al eliminar horario"),
      },
    );
  };

  const getDayLabel = (dayValue) => {
    return (
      DAYS_OF_WEEK.find((d) => d.value === Number(dayValue))?.label ||
      "Desconocido"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Horarios de Disponibilidad - {facility.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form to add new hour */}
          <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
            <h3 className="font-semibold text-sm">Agregar Nuevo Horario</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Día</Label>
                <Select
                  value={String(newHour.day_of_week)}
                  onValueChange={(val) =>
                    setNewHour({ ...newHour, day_of_week: Number(val) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Apertura</Label>
                <Input
                  type="time"
                  value={newHour.open_time}
                  onChange={(e) =>
                    setNewHour({ ...newHour, open_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Cierre</Label>
                <Input
                  type="time"
                  value={newHour.close_time}
                  onChange={(e) =>
                    setNewHour({ ...newHour, close_time: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleAddHour}
                disabled={createMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* List of existing hours */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Día</TableHead>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Cierre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : hours?.length > 0 ? (
                  hours.map((hour) => (
                    <TableRow key={hour.id}>
                      <TableCell className="font-medium">
                        {getDayLabel(hour.day_of_week)}
                      </TableCell>
                      <TableCell>{hour.open_time}</TableCell>
                      <TableCell>{hour.close_time}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteHour(hour.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground h-24"
                    >
                      No hay horarios configurados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
