import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StorageService } from "@/services/storage.service";
import { useCreatePayment } from "@/hooks/usePayments";

export default function MembershipPaymentUploadDialog({ open, onOpenChange, subscription }) {
    const { user } = useAuth();
    const createPaymentMutation = useCreatePayment();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("El archivo no debe superar los 5MB");
                return;
            }
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleUploadAndPay = async () => {
        if (!file || !subscription) return;

        setIsUploading(true);
        try {
            // 1. Upload voucher
            // Reuse the existing method or verify if we need a specific folder
            // The policy allow uploads to 'payment_vouchers' bucket if folder matches user id.
            // StorageService.uploadVoucher likely handles this.
            const publicUrl = await StorageService.uploadVoucher(file, user.id);

            // 2. Create payment record
            await createPaymentMutation.mutateAsync({
                user_id: user.id,
                subscription_id: subscription.id,
                plan_id: subscription.plan_id,
                amount: subscription.plan.price, // Assuming subscription has plan details expanded
                payment_method: "manual_transfer",
                proof_url: publicUrl,
            });

            toast.success("Comprobante subido y pago registrado correctamente.");
            onOpenChange(false);
            clearFile();
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error("Error al procesar el pago: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!subscription) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Subir Comprobante de Membresía</DialogTitle>
                    <DialogDescription>
                        Sube tu comprobante de pago para activar la suscripción: <strong>{subscription.plan?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="voucher">Comprobante de Pago</Label>
                        {!file ? (
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="mem-voucher-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click para subir</span>
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 5MB)</p>
                                    </div>
                                    <Input
                                        id="mem-voucher-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="relative border rounded-lg p-2 bg-muted/20">
                                <Button
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 rounded-full z-10"
                                    onClick={clearFile}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                {file.type.startsWith("image/") ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-contain rounded-md"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-24 bg-gray-100 text-sm text-gray-500">
                                        Archivo seleccionado: {file.name}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={isUploading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleUploadAndPay}
                        disabled={!file || isUploading}
                        className="w-full sm:w-auto"
                    >
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploading ? "Subiendo..." : "Confirmar y Subir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
