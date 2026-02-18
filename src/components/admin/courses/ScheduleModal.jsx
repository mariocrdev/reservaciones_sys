import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2, Trash2, Plus } from "lucide-react";
import { AdminCoursesService } from "@/services/admin/courses.service";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export function ScheduleModal({ isOpen, onClose, slot }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      day_of_week: "",
      start_time: "",
      end_time: "",
    },
  });

  // Fetch existing schedule
  const { data: schedule, isLoading } = useQuery({
    queryKey: ["course_schedule", slot?.id],
    queryFn: () => AdminCoursesService.getSchedule(slot.id),
    enabled: !!slot?.id && isOpen,
  });

  // Mutation to add schedule item
  const createMutation = useMutation({
    mutationFn: (data) =>
      AdminCoursesService.createSchedule({
        course_slot_id: slot.id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["course_schedule", slot.id]);
      toast.success("Horario agregado correctamente");
      reset();
    },
    onError: (error) => {
      toast.error("Error al agregar horario: " + error.message);
    },
  });

  // Mutation to delete schedule item
  const deleteMutation = useMutation({
    mutationFn: (id) => AdminCoursesService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["course_schedule", slot.id]);
      toast.success("Horario eliminado");
    },
    onError: (error) => {
      toast.error("Error al eliminar horario");
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate({
      day_of_week: parseInt(data.day_of_week),
      start_time: data.start_time,
      end_time: data.end_time,
    });
  };

  const getDayLabel = (dayValue) => {
    return (
      DAYS_OF_WEEK.find((d) => d.value === dayValue)?.label || "Desconocido"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Horarios</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* List of existing schedule items */}
          <div className="space-y-2 max-h-[30vh] overflow-y-auto">
            <h4 className="text-sm font-medium">Horarios Actuales</h4>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : schedule?.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No hay horarios definidos.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {schedule?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getDayLabel(item.day_of_week)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.start_time.slice(0, 5)} -{" "}
                        {item.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new schedule item form */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-4 text-sm font-medium">Agregar Nuevo Horario</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Día</Label>
                  <Select
                    onValueChange={(val) => setValue("day_of_week", val)}
                    value={watch("day_of_week")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Día" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem
                          key={day.value}
                          value={day.value.toString()}
                        >
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.day_of_week && (
                    <span className="text-xs text-destructive">Requerido</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora Inicio</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...register("start_time", { required: true })}
                  />
                  {errors.start_time && (
                    <span className="text-xs text-destructive">Requerido</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora Fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...register("end_time", { required: true })}
                  />
                  {errors.end_time && (
                    <span className="text-xs text-destructive">Requerido</span>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Agregar Horario
              </Button>
            </form>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
