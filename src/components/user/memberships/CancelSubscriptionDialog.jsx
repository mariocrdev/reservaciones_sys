import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { MembershipService } from "@/services/membership.service";
import { toast } from "sonner";

export default function CancelSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      await MembershipService.cancelSubscription(subscription.id, reason);

      toast.success("La suscripción ha sido cancelada exitosamente.");

      if (onSuccess) onSuccess();
      onOpenChange(false);
      setReason(""); // Reset reason
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("No se pudo cancelar la suscripción. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancelar Suscripción
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas cancelar tu suscripción? Esta acción no
            se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de la cancelación (Opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Cuéntanos por qué deseas cancelar..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-32"
            />
            <p className="text-xs text-muted-foreground">
              Tus comentarios nos ayudan a mejorar nuestro servicio.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Mantener Suscripción
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Confirmar Cancelación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
