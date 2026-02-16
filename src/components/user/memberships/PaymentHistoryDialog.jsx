import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, Receipt } from "lucide-react";

export default function PaymentHistoryDialog({ open, onOpenChange, subscription }) {
    if (!subscription) return null;

    const payments = subscription.payments || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Historial de Pagos</DialogTitle>
                    <DialogDescription>
                        Pagos registrados para el plan <strong>{subscription.plan?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[300px] w-full pr-4">
                    {payments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay pagos registrados.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-start justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    payment.status === "paid"
                                                        ? "default"
                                                        : payment.status === "pending"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                            >
                                                {payment.status === "paid"
                                                    ? "Pagado"
                                                    : payment.status === "pending"
                                                        ? "Pendiente"
                                                        : payment.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(payment.created_at), "PPP", {
                                                    locale: es,
                                                })}
                                            </span>
                                        </div>
                                        <div className="font-semibold text-lg">
                                            {subscription.plan?.currency} {payment.amount}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Receipt className="h-3 w-3" />
                                            {payment.payment_method || "Transferencia"}
                                        </div>
                                    </div>
                                    {payment.proof_url && (
                                        <a
                                            href={payment.proof_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                            title="Ver Comprobante"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
