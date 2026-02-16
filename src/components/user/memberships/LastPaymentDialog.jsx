import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function LastPaymentDialog({
    open,
    onOpenChange,
    payment,
    currency,
}) {
    if (!payment) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Detalles del Último Pago</DialogTitle>
                    <DialogDescription>
                        Información detallada del pago más reciente registrado.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                    <div className="font-semibold">Estado:</div>
                    <div>
                        <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : payment.status}
                        </Badge>
                    </div>

                    <div className="font-semibold">Monto:</div>
                    <div className="font-medium text-lg text-primary">
                        {currency} {payment.amount}
                    </div>

                    <div className="font-semibold">Fecha de Creación:</div>
                    <div>{format(new Date(payment.created_at), "PPP p", { locale: es })}</div>

                    {payment.payment_date && (
                        <>
                            <div className="font-semibold">Fecha de Pago:</div>
                            <div>{format(new Date(payment.payment_date), "PPP", { locale: es })}</div>
                        </>
                    )}

                    {payment.payment_method && (
                        <>
                            <div className="font-semibold">Método:</div>
                            <div className="capitalize">{payment.payment_method}</div>
                        </>
                    )}

                    {payment.proof_url && (
                        <div className="col-span-2 mt-4 pt-4 border-t">
                            <a
                                href={payment.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/80 text-primary transition-colors text-sm font-medium"
                            >
                                Ver Comprobante de Pago
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
