import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  FileText,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewReservationDialog } from "@/components/reservations/NewReservationDialog";
import Loading from "@/components/global/Loading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useUserReservations,
  useCancelReservation,
} from "@/hooks/useReservations";
import { Loader2, CreditCard, Timer } from "lucide-react";
import { useCreatePayment } from "@/hooks/usePayments";

const ReservationCard = ({ res }) => {
  const { user } = useAuth();
  const cancelMutation = useCancelReservation();
  const createPaymentMutation = useCreatePayment();

  const [timeLeft, setTimeLeft] = useState("");
  const [isExpiredLocal, setIsExpiredLocal] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  // Check for any associated payment
  const payment =
    res.payments && res.payments.length > 0 ? res.payments[0] : null;

  // Helper para verificar expiración basada en fecha
  const checkExpiration = (expiresAt) => {
    // Si hay un pago registrado (con comprobante o en proceso), NO expira visualmente por fecha
    if (payment) return false;

    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const isExpired = checkExpiration(res.expires_at) || isExpiredLocal;
  const isCancelled = res.status === "cancelled";

  // Show buttons only if NOT cancelled AND NOT expired
  const showActions = !isCancelled && !isExpired && res.status !== "completed";

  useEffect(() => {
    if (!res.expires_at || res.status !== "pending") return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const expiration = new Date(res.expires_at);
      const diff = expiration - now;

      if (diff <= 0) {
        setIsExpiredLocal(true);
        setTimeLeft("00m 00s");
        return;
      }

      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}m ${seconds
          .toString()
          .padStart(2, "0")}s`,
      );
    };

    calculateTimeLeft(); // Initial call
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [res.expires_at, res.status]);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(res.id);
      setIsCancelDialogOpen(false);
      toast.success("Reservación cancelada correctamente");
    } catch (error) {
      toast.error("Error al cancelar la reservación");
      console.error(error);
    }
  };

  const handlePayment = async () => {
    try {
      await createPaymentMutation.mutateAsync({
        user_id: user.id,
        reservation_id: res.id,
        amount: res.total_price,
        payment_method: "manual_transfer",
        proof_url:
          "https://dlungwwfskliaiatormh.supabase.co/storage/v1/object/public/public_assets/backgroundAuth.svg",
      });
      toast.success("Pago registrado. Esperando validación.");
    } catch (error) {
      toast.error("Error al registrar el pago");
      console.error(error);
    }
  };

  const formatPeriod = (period) => {
    if (!period) return { date: "", time: "" };
    const clean = period.replace(/[\[\]\(\)"]/g, "");
    const parts = clean.split(",");
    if (parts.length !== 2) return { date: period, time: "" };

    const start = new Date(parts[0]);
    const end = new Date(parts[1]);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { date: "Fecha inválida", time: "" };
    }

    return {
      date: start.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: `${start.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })} - ${end.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`,
    };
  };

  const period = formatPeriod(res.booked_period);

  const getStatusBadge = () => {
    if (isCancelled || isExpired) {
      return <Badge variant="destructive">Cancelada / Expirada</Badge>;
    }

    if (res.status === "confirmed") {
      return <Badge>Confirmada</Badge>;
    }

    if (res.status === "pending") {
      // Si hay pago, mostrar estado del pago
      if (payment) {
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            Validando Pago
          </Badge>
        );
      }

      // Si no hay pago, pero ya no tiene expires_at (caso raro si se manejara solo por trigger sin pago)
      if (!res.expires_at) {
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            Validando Pago
          </Badge>
        );
      }

      return (
        <div className="flex flex-col gap-1 items-start">
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            Pendiente de Pago
          </Badge>
          <div className="flex items-center text-amber-600 font-medium text-sm">
            <Timer className="mr-1 h-3 w-3" />
            {timeLeft}
          </div>
        </div>
      );
    }

    return <Badge variant="secondary">{res.status}</Badge>;
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col p-0 self-start relative">
        <div className="h-48 bg-muted relative group overflow-hidden">
          {res.facilities?.image_urls?.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full ml-0 ">
                {res.facilities.image_urls.map((url, index) => (
                  <CarouselItem
                    key={index}
                    className="flex justify-center items-center p-0 rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`${res.facilities.name} - ${index + 1}`}
                      className="h-48 object-contain"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {res.facilities.image_urls.length > 1 && (
                <>
                  <CarouselPrevious className="left-2  h-8 w-8" />
                  <CarouselNext className="right-2  h-8 w-8" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <MapPin className="h-8 w-8" />
            </div>
          )}
        </div>

        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl line-clamp-1">
              {res.facilities?.name || "Instalación"}
            </CardTitle>
            <div>{getStatusBadge()}</div>
          </div>
          {/* Dropdown Menu - Always visible unless completed/cancelled maybe? No, let user cancel if pending. */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {payment && (
                  <DropdownMenuItem
                    onClick={() => setIsPaymentDetailsOpen(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Detalles de Pago
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Reservación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="space-y-2 pb-6">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{period.date}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{period.time}</span>
          </div>
          <div className="pt-2 flex justify-between items-center border-t mt-2">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-lg font-bold text-primary">
              ${res.total_price}
            </span>
          </div>

          {/* Primary Action Button */}
          {showActions &&
            res.status === "pending" &&
            res.expires_at &&
            !payment && (
              <div className="pt-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePayment}
                  disabled={createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Pagar
                </Button>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Cancel Alert Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reservación será cancelada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Sí, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Details Dialog */}
      {payment && (
        <Dialog
          open={isPaymentDetailsOpen}
          onOpenChange={setIsPaymentDetailsOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles del Pago</DialogTitle>
              <DialogDescription>
                Información del pago asociado a esta reservación.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Monto</p>
                  <p className="font-semibold text-lg">
                    ${payment.amount} {payment.currency}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Estado</p>
                  <Badge variant="outline" className="capitalize">
                    {payment.status === "pending"
                      ? "Pendiente"
                      : payment.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Fecha</p>
                  <p>{new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Método</p>
                  <p className="capitalize">
                    {payment.payment_method?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </div>

              {payment.proof_url && (
                <div className="mt-4">
                  <p className="font-medium text-muted-foreground mb-2">
                    Comprobante
                  </p>
                  <div className="rounded-md border p-2 bg-muted/20">
                    <img
                      src={payment.proof_url}
                      alt="Comprobante de pago"
                      className="w-full h-auto max-h-[300px] object-contain rounded-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default function MyReservations() {
  const { user } = useAuth();
  const { data: reservations, isLoading } = useUserReservations(user?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className=" space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Reservaciones</h1>
          <p className="text-muted-foreground">
            Administra tus reservas de instalaciones.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva Reservación
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : reservations?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((res) => (
            <ReservationCard key={res.id} res={res} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No tienes reservaciones</h3>
          <p className="text-muted-foreground mb-6">
            Comienza reservando una instalación para tus actividades.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            Crear mi primera reservación
          </Button>
        </div>
      )}

      <NewReservationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
