
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSubscriptionPayments } from "@/hooks/admin/useAdminSubscriptions";

export function SubscriptionPaymentsModal({ subscriptionId, open, onOpenChange }) {
    const { data: payments, isLoading } = useSubscriptionPayments(subscriptionId);

    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>;
            case "pending":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendiente</Badge>;
            case "failed":
                return <Badge variant="destructive">Fallido</Badge>;
            case "refunded":
                return <Badge variant="secondary">Reembolsado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Historial de Pagos</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="rounded-md border overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Comprobante</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!payments || payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No hay pagos registrados para esta suscripción.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {format(new Date(payment.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                {payment.amount} {payment.currency}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {payment.payment_method || "-"}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            <TableCell className="text-right">
                                                {payment.proof_url ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => window.open(payment.proof_url, "_blank")}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="sr-only">Ver comprobante</span>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
