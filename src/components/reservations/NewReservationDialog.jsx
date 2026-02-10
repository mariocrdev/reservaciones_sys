import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar"; // Removing missing component import
// Checking ui folder previously showed many components. I'll stick to native date input if calendar component is missing or complicated to setup blindly, but let's check.
// I saw "popover.jsx" and others. I'll use standard input type="date" for simplicity and robustness first, or controlled input.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  useActiveFacilities,
  useAvailableSlots,
  useCreateReservation,
} from "@/hooks/useReservations";
import { useAuth } from "@/hooks/useAuth";

export function NewReservationDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: facilities, isLoading: loadingFacilities } =
    useActiveFacilities();
  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    selectedFacility?.id,
    date,
  );
  const createReservationMutation = useCreateReservation();

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a delay or immediately
    setTimeout(() => {
      setStep(1);
      setSelectedFacility(null);
      setDate("");
      setSelectedSlot(null);
    }, 300);
  };

  const handleFacilitySelect = (facilityId) => {
    const facility = facilities.find((f) => f.id === facilityId);
    setSelectedFacility(facility);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedFacility) {
      setStep(2);
    } else if (step === 2 && date && selectedSlot) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedFacility || !selectedSlot) return;

    try {
      await createReservationMutation.mutateAsync({
        facility_id: selectedFacility.id,
        user_id: user.id,
        date: date,
        start_time: selectedSlot.slot_start,
        end_time: selectedSlot.slot_end,
        price: selectedFacility.price_per_hour, // Assuming 1 hour slots for now based on RPC default
      });
      toast.success("Reservación creada exitosamente");
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la reservación");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva Reservación - Paso {step} de 3</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* STEP 1: Select Facility */}
          {step === 1 && (
            <div className="space-y-4">
              <Label>Selecciona una Instalación</Label>
              {loadingFacilities ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto px-2">
                  {facilities?.map((facility) => (
                    <div
                      key={facility.id}
                      className={`flex flex-col overflow-hidden border rounded-lg cursor-pointer transition-colors ${
                        selectedFacility?.id === facility.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handleFacilitySelect(facility.id)}
                    >
                      {/* Contenedor de imagen: shrink-0 evita que se expanda, overflow-hidden corta el exceso */}
                      <div className="h-48 overflow-hidden">
                        {facility.image_urls?.length > 0 ? (
                          <Carousel>
                            <CarouselContent className="h-full ml-0 *:h-full">
                              {facility.image_urls.map((url, index) => (
                                <CarouselItem
                                  key={index}
                                  className="flex justify-center items-center p-0 rounded-lg overflow-hidden"
                                >
                                  <img
                                    src={url}
                                    alt={`${facility.name} - ${index + 1}`}
                                    className="h-48 object-contain"
                                  />
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            {facility.image_urls.length > 1 && (
                              <>
                                <CarouselPrevious
                                  className="left-2 h-8 w-8 "
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <CarouselNext
                                  className="right-2 h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </>
                            )}
                          </Carousel>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <MapPin className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Contenido: ahora tiene su propio espacio garantizado */}
                      <div className="p-4 flex items-center justify-between bg-background">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">
                            {facility.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {facility.type_facilities?.name} • Capacidad:{" "}
                            {facility.capacity}
                          </div>
                        </div>
                        <div className="font-bold text-primary ml-4 shrink-0">
                          ${facility.price_per_hour}/hr
                        </div>
                      </div>
                    </div>
                  ))}
                  {facilities?.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No hay instalaciones disponibles.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Select Date & Slot */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot(null); // Reset slot when date changes
                  }}
                />
              </div>

              {date && (
                <div className="space-y-2">
                  <Label>Horarios Disponibles</Label>
                  {loadingSlots ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="animate-spin h-6 w-6" />
                    </div>
                  ) : slots && slots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
                      {slots.map((slot, idx) => (
                        <Button
                          key={`${slot.slot_start}-${idx}`}
                          variant={
                            selectedSlot === slot ? "default" : "outline"
                          }
                          className={`w-full ${!slot.is_available ? "opacity-50 cursor-not-allowed bg-muted" : ""}`}
                          disabled={!slot.is_available}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.slot_start.slice(0, 5)} -{" "}
                          {slot.slot_end.slice(0, 5)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border rounded-lg text-muted-foreground bg-muted/20">
                      No hay horarios disponibles para esta fecha.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instalación:</span>
                  <span className="font-medium">{selectedFacility.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horario:</span>
                  <span className="font-medium">
                    {selectedSlot.slot_start.slice(0, 5)} -{" "}
                    {selectedSlot.slot_end.slice(0, 5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio Total:</span>
                  <span className="font-bold text-lg text-primary">
                    ${selectedFacility.price_per_hour}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Al confirmar, tu reservación quedará registrada.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Atrás
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNextStep}
              disabled={
                (step === 1 && !selectedFacility) ||
                (step === 2 && (!date || !selectedSlot))
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createReservationMutation.isPending}
            >
              {createReservationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Reservación
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
