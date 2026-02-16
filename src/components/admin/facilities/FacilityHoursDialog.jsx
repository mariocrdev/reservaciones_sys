import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useFacilityHours,
  useCreateFacilityHour,
  useDeleteFacilityHour,
} from "@/hooks/admin/useFacilityHours";
import {
  useFacilityBlockages,
  useCreateFacilityBlockage,
  useDeleteFacilityBlockage,
} from "@/hooks/admin/useFacilityBlockages";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  // Hours Hooks
  const { data: hours, isLoading: isLoadingHours } = useFacilityHours(
    facility?.id,
  );
  const createHourMutation = useCreateFacilityHour();
  const deleteHourMutation = useDeleteFacilityHour();

  // Blockages Hooks
  const { data: blockages, isLoading: isLoadingBlockages } =
    useFacilityBlockages(facility?.id);
  const createBlockageMutation = useCreateFacilityBlockage();
  const deleteBlockageMutation = useDeleteFacilityBlockage();

  // State for Hours Form
  const [newHour, setNewHour] = useState({
    day_of_week: "1", // Default Monday
    open_time: "08:00",
    close_time: "18:00",
  });

  // State for Blockages Form
  const [blockageForm, setBlockageForm] = useState({
    type: "full_day", // full_day | custom
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });

  if (!facility) return null;

  // --- Handlers for Hours ---

  const handleAddHour = (e) => {
    e.preventDefault();
    if (newHour.open_time >= newHour.close_time) {
      toast.error("La hora de cierre debe ser posterior a la de apertura");
      return;
    }

    createHourMutation.mutate(
      { ...newHour, facility_id: facility.id },
      {
        onSuccess: () => {
          toast.success("Horario agregado");
        },
        onError: (err) => {
          console.error(err);
          toast.error("Error al agregar horario: " + err.message);
        },
      },
    );
  };

  const handleDeleteHour = (id) => {
    deleteHourMutation.mutate(
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

  // --- Handlers for Blockages ---

  const handleAddBlockage = (e) => {
    e.preventDefault();
    if (!blockageForm.date) {
      toast.error("Selecciona una fecha");
      return;
    }
    if (!blockageForm.reason) {
      toast.error("Ingresa un motivo");
      return;
    }

    let period;
    const dateStr = blockageForm.date; // YYYY-MM-DD

    if (blockageForm.type === "full_day") {
      // Postgres range: [start, end)
      // Example: [2026-12-25 00:00, 2026-12-25 23:59)
      period = `[${dateStr} 00:00, ${dateStr} 23:59)`;
    } else {
      if (blockageForm.startTime >= blockageForm.endTime) {
        toast.error("La hora de fin debe ser posterior a la de inicio");
        return;
      }
      period = `[${dateStr} ${blockageForm.startTime}, ${dateStr} ${blockageForm.endTime})`;
    }

    createBlockageMutation.mutate(
      {
        facility_id: facility.id,
        blocked_period: period,
        reason: blockageForm.reason,
      },
      {
        onSuccess: () => {
          toast.success("Bloqueo agregado");
          setBlockageForm({
            ...blockageForm,
            reason: "",
          });
        },
        onError: (err) => {
          console.error(err);
          toast.error("Error al agregar bloqueo: " + err.message);
        },
      },
    );
  };

  const handleDeleteBlockage = (id) => {
    deleteBlockageMutation.mutate(
      { id, facilityId: facility.id },
      {
        onSuccess: () => toast.success("Bloqueo eliminado"),
        onError: () => toast.error("Error al eliminar bloqueo"),
      },
    );
  };

  // Helper to format tsrange string for display
  const formatPeriod = (rangeStr) => {
    if (!rangeStr) return "";
    // Remove brackets/parentheses and split
    const clean = rangeStr.replace(/[\[\]\(\)]/g, "");
    const [start, end] = clean.split(",");

    if (!start || !end) return rangeStr;

    // Note: Date parsing from string might need care depending on browser, 
    // but YYYY-MM-DD HH:MM is usually safe. 
    // We replace quotes just in case.
    const startDate = new Date(start.trim().replace(/"/g, ""));
    const endDate = new Date(end.trim().replace(/"/g, ""));

    // Check if full day (approx check)
    const isFullDay = startDate.getHours() === 0 && endDate.getHours() === 23 && endDate.getMinutes() === 59;

    const dateFormatted = format(startDate, "PPP", { locale: es });

    if (isFullDay) {
      return `${dateFormatted} (Todo el día)`;
    }

    return `${dateFormatted} ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Gestión de Horarios - {facility.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="hours" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hours">Horarios Disponibilidad</TabsTrigger>
            <TabsTrigger value="blockages">Bloqueos / Festivos</TabsTrigger>
          </TabsList>

          {/* --- TAB: HOURS --- */}
          <TabsContent value="hours" className="space-y-6 mt-4">
            {/* Form to add new hour */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
              <h3 className="font-semibold text-sm">
                Agregar Nuevo Horario Semanal
              </h3>
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
                  disabled={createHourMutation.isPending}
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
                  {isLoadingHours ? (
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
          </TabsContent>

          {/* --- TAB: BLOCKAGES --- */}
          <TabsContent value="blockages" className="space-y-6 mt-4">
            <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
              <h3 className="font-semibold text-sm">
                Agregar Excepción / Bloqueo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={blockageForm.type}
                    onValueChange={(val) =>
                      setBlockageForm({ ...blockageForm, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_day">Todo el día</SelectItem>
                      <SelectItem value="custom">Horas Específicas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={blockageForm.date}
                    onChange={(e) => setBlockageForm({ ...blockageForm, date: e.target.value })}
                  />
                </div>

                {blockageForm.type === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label>Inicio</Label>
                      <Input
                        type="time"
                        value={blockageForm.startTime}
                        onChange={(e) => setBlockageForm({ ...blockageForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fin</Label>
                      <Input
                        type="time"
                        value={blockageForm.endTime}
                        onChange={(e) => setBlockageForm({ ...blockageForm, endTime: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 md:col-span-2 ">
                  <Label>Motivo (Ej: Navidad, Reparación)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Motivo del bloqueo..."
                      value={blockageForm.reason}
                      onChange={(e) => setBlockageForm({ ...blockageForm, reason: e.target.value })}
                    />
                    <Button
                      onClick={handleAddBlockage}
                      disabled={createBlockageMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of existing blockages */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha / Periodo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBlockages ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : blockages?.length > 0 ? (
                    blockages.map((block) => (
                      <TableRow key={block.id}>
                        <TableCell className="font-medium">
                          {formatPeriod(block.blocked_period)}
                        </TableCell>
                        <TableCell>{block.reason}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBlockage(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground h-24"
                      >
                        No hay bloqueos activos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
