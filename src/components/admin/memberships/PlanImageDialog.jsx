import { useState } from "react";
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
import { Loader2, Trash, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useUpdatePlan, useUploadPlanImage } from "@/hooks/useMembership";
import { MembershipService } from "@/services/membership.service";

export function PlanImageDialog({ open, onOpenChange, plan }) {
  const updatePlanMutation = useUpdatePlan();
  const uploadImageMutation = useUploadPlanImage();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!plan) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageMutation.mutateAsync(file);
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        data: { image_url: url },
      });
      toast.success("Imagen actualizada correctamente");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!plan.image_url) return;

    setDeleting(true);
    try {
      await MembershipService.deleteImage(plan.image_url);
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        data: { image_url: null },
      });
      toast.success("Imagen eliminada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la imagen");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Imagen del Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center gap-4">
            {plan.image_url ? (
              <div className="relative w-48 h-48 rounded-lg overflow-hidden border shadow-sm group">
                <img
                  src={plan.image_url}
                  alt={plan.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center bg-muted/30 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}

            <div className="w-full max-w-xs space-y-4">
              {plan.image_url ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteImage}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 h-4 w-4" />
                  )}
                  Eliminar Imagen Actual
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Nueva Imagen
                      </>
                    )}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Formatos: JPG, PNG. Máx 5MB.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
