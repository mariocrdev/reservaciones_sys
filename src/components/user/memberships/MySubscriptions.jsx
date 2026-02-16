import { useState, useEffect } from "react";
import { MembershipService } from "@/services/membership.service";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Calendar,
  User,
  AlertCircle,
  Upload,
  MoreVertical,
  History,
  Info,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MembershipPaymentUploadDialog from "./MembershipPaymentUploadDialog";
import PaymentHistoryDialog from "./PaymentHistoryDialog";
import CancelSubscriptionDialog from "./CancelSubscriptionDialog";
import LastPaymentDialog from "./LastPaymentDialog";

export default function MySubscriptions() {
  const { session } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubForUpload, setSelectedSubForUpload] = useState(null);
  const [selectedSubForHistory, setSelectedSubForHistory] = useState(null);
  const [selectedSubForLastPayment, setSelectedSubForLastPayment] =
    useState(null);
  const [selectedSubForCancellation, setSelectedSubForCancellation] =
    useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadSubscriptions();
    }
  }, [session?.user?.id]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await MembershipService.getUserSubscriptions(
        session.user.id,
      );
      setSubscriptions(data);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "past_due":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "Activa",
      pending: "Pendiente",
      cancelled: "Cancelada",
      past_due: "Vencida",
      inactive: "Inactiva",
    };
    return labels[status] || status;
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">
          No tienes suscripciones activas
        </h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Suscríbete a un plan para disfrutar de todos los beneficios de
          nuestras instalaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MembershipPaymentUploadDialog
        open={!!selectedSubForUpload}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubForUpload(null);
            loadSubscriptions(); // Reload to update status if payment uploaded
          }
        }}
        subscription={selectedSubForUpload}
      />

      <PaymentHistoryDialog
        open={!!selectedSubForHistory}
        onOpenChange={(open) => !open && setSelectedSubForHistory(null)}
        subscription={selectedSubForHistory}
      />

      <LastPaymentDialog
        open={!!selectedSubForLastPayment}
        onOpenChange={(open) => !open && setSelectedSubForLastPayment(null)}
        payment={
          selectedSubForLastPayment
            ? selectedSubForLastPayment.payments &&
              selectedSubForLastPayment.payments.length > 0
              ? selectedSubForLastPayment.payments[0]
              : null
            : null
        }
        currency={selectedSubForLastPayment?.plan?.currency || "QTZ"}
      />

      <CancelSubscriptionDialog
        open={!!selectedSubForCancellation}
        onOpenChange={(open) => !open && setSelectedSubForCancellation(null)}
        subscription={selectedSubForCancellation}
        onSuccess={() => {
          loadSubscriptions(); // Reload to update status
          setSelectedSubForCancellation(null);
        }}
      />

      {subscriptions.map((sub) => {
        // Payments are already sorted by latest in 'created_at' desc by the service
        const latestPayment =
          sub.payments && sub.payments.length > 0 ? sub.payments[0] : null;

        // Logic for Extend button:
        // 1. Active, Inactive, Past Due
        const canExtend = ["active", "inactive", "past_due"].includes(
          sub.status,
        );

        // Logic for Cancel button:
        // 1. Not already cancelled
        const canCancel = sub.status !== "cancelled";

        return (
          <Card key={sub.id} className="overflow-hidden">
            <CardHeader className="pb-3 bg-muted/5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {sub.plan?.product?.name || "Membresía"}
                    <span className="font-normal text-muted-foreground text-sm">
                      - {sub.plan?.name}
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Beneficiario:
                    <span className="font-medium text-foreground">
                      {sub.family_member
                        ? `${sub.family_member.first_name} ${sub.family_member.last_name}`
                        : "Yo (Titular)"}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(sub.status)} border`}
                    >
                      {getStatusLabel(sub.status)}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button  size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedSubForHistory(sub)}
                        >
                          <History className="mr-2 h-4 w-4" />
                          Ver Historial
                        </DropdownMenuItem>

                        {latestPayment && (
                          <DropdownMenuItem
                            onClick={() => setSelectedSubForLastPayment(sub)}
                          >
                            <Info className="mr-2 h-4 w-4" />
                            Ver Último Pago
                          </DropdownMenuItem>
                        )}

                        {(canExtend || sub.status === "pending") && (
                          <DropdownMenuItem
                            onClick={() => setSelectedSubForUpload(sub)}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {sub.status === "pending"
                              ? "Subir Comprobante"
                              : "Extender Suscripción"}
                          </DropdownMenuItem>
                        )}

                        {canCancel && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSelectedSubForCancellation(sub)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar Suscripción
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Fecha de Inicio</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {sub.start_date
                      ? format(new Date(sub.start_date), "PPP", { locale: es })
                      : "Pendiente"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Próximo Vencimiento</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {sub.end_date
                      ? format(new Date(sub.end_date), "PPP", { locale: es })
                      : "-"}
                  </p>
                </div>
              </div>

              {sub.status === "pending" && !latestPayment && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                  Tu suscripción está pendiente de pago. Por favor sube tu
                  comprobante para activar la membresía.
                </div>
              )}
              {sub.status === "pending" && latestPayment && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400">
                  Tu pago está en revisión. La suscripción se activará una vez
                  confirmado el pago.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
