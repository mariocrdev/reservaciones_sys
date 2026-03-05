import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useEnrolments } from "@/hooks/useEnrolments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EnrolmentModal({ isOpen, onClose, slot, course }) {
  const { user, profile } = useAuth();
  const { data: familyMembers } = useFamilyMembers();
  console.log("🚀 ~ EnrolmentModal ~ familyMembers:", familyMembers);
  const { addEnrolment } = useEnrolments();

  const [targetType, setTargetType] = useState("self"); // "self" or "child"
  const [selectedChildId, setSelectedChildId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setTargetType("self");
    setSelectedChildId("");
    onClose();
  };

  const handleEnrol = async () => {
    if (targetType === "child" && !selectedChildId) {
      toast.error("Por favor selecciona un familiar");
      return;
    }

    try {
      setIsSubmitting(true);
      const enrolmentData = {
        course_slot_id: slot.id,
        profile_id: targetType === "self" ? user.id : null,
        child_id: targetType === "child" ? selectedChildId : null,
      };

      await addEnrolment(enrolmentData);
      toast.success(
        "Pre-inscripción creada exitosamente. Dirígete a Mis Inscripciones para proceder al pago.",
      );
      handleClose();
    } catch (error) {
      toast.error("Error al crear la inscripción: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!slot || !course) return null;

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const formatDay = (dayInt) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[dayInt];
  };

  const isFull = slot.current_enrolments >= slot.max_capacity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Inscripción al Curso</DialogTitle>
          <DialogDescription>
            Selecciona para quién es esta inscripción.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Course Summary Card */}
          <div className="bg-muted p-4 rounded-lg space-y-3 border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{course.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {slot.name_slot || "Ciclo Regular"}
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {new Intl.NumberFormat("es-CR", {
                  style: "currency",
                  currency: "USD",
                }).format(slot.price)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-3 border-t pt-3">
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span>
                    {slot.start_date
                      ? `${format(new Date(slot.start_date), "MMM d", { locale: es })} - ${format(new Date(slot.end_date), "MMM d", { locale: es })}`
                      : `Duración: ${slot.duration}`}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    Cupos: {slot.current_enrolments} / {slot.max_capacity}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {slot.course_schedule?.map((schedule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-muted-foreground"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="capitalize">
                      {formatDay(schedule.day_of_week)}{" "}
                      {formatTime(schedule.start_time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isFull ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Lo sentimos, este horario ya no tiene cupos disponibles.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Label className="text-base font-medium">
                ¿Quién tomará el curso?
              </Label>

              <RadioGroup value={targetType} onValueChange={setTargetType}>
                <div
                  className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setTargetType("self")}
                >
                  <RadioGroupItem value="self" id="self" />
                  <Label
                    htmlFor="self"
                    className="flex-1 cursor-pointer flex items-center"
                  >
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    Mí mismo ({profile?.first_name} {profile?.last_name})
                  </Label>
                </div>

                <div className="flex items-start space-x-2 border p-3 rounded-md">
                  
                    <RadioGroupItem
                      value="child"
                      id="child"
                      onClick={() => setTargetType("child")}
                    />
                  
                  <div className="flex-1">
                    <Label
                      htmlFor="child"
                      className="cursor-pointer flex items-center"
                    >
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      Familiar / Dependiente
                    </Label>

                    {targetType === "child" && (
                      <div className="pt-2 pl-2">
                        {familyMembers?.length > 0 ? (
                          <div className="space-y-2">
                            {familyMembers.map((member) => (
                              <div
                                key={member.id}
                                className={`p-2 border rounded-md cursor-pointer text-sm transition-colors ${selectedChildId === member.id ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}
                                onClick={() => setSelectedChildId(member.id)}
                              >
                                <div className="font-medium">
                                  {member.first_name} {member.last_name}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md border">
                            No tienes familiares registrados. Puedes agregarlos
                            desde la sección Tus Familiares.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnrol}
            disabled={
              isSubmitting ||
              isFull ||
              (targetType === "child" && !selectedChildId)
            }
          >
            {isSubmitting ? "Procesando..." : "Confirmar Pre-inscripción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
