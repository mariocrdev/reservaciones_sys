import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateFacility,
  useUploadFacilityImages,
  useDeleteFacilityImage,
} from "@/hooks/admin/useAdminFacilities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FacilityImagesDialog({ open, onOpenChange, facility }) {
  const [uploading, setUploading] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);

  const updateFacilityMutation = useUpdateFacility();
  const uploadImagesMutation = useUploadFacilityImages();
  const deleteImageMutation = useDeleteFacilityImage();

  // Sync state with prop when dialog opens or facility changes
  useEffect(() => {
    if (facility && facility.image_urls) {
      setCurrentImages(facility.image_urls);
    } else {
      setCurrentImages([]);
    }
  }, [facility, open]);

  if (!facility) return null;

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // 1. Upload new images
      const newUrls = await uploadImagesMutation.mutateAsync(files);
      const updatedUrls = [...currentImages, ...newUrls];

      // 2. Update local state immediately
      setCurrentImages(updatedUrls);

      // 3. Update backend facility record
      await updateFacilityMutation.mutateAsync({
        id: facility.id,
        data: { image_urls: updatedUrls },
      });

      toast.success("Imágenes subidas correctamente");
      // Reset input
      e.target.value = null;
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (urlToDelete) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    try {
      // 1. Delete from bucket
      await deleteImageMutation.mutateAsync(urlToDelete);

      // 2. Update facility record
      const updatedUrls = currentImages.filter((url) => url !== urlToDelete);

      // Update local state immediately
      setCurrentImages(updatedUrls);

      await updateFacilityMutation.mutateAsync({
        id: facility.id,
        data: { image_urls: updatedUrls },
      });

      toast.success("Imagen eliminada");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar imagen");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestionar Imágenes - {facility.name}</DialogTitle>
        </DialogHeader>

        {/* Contenedor scrollable solo para el contenido, no el header */}
        <div className="space-y-6 overflow-y-auto">
          {/* Upload Section */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Agregar Imágenes</Label>
              <Input
                id="picture"
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>
            {uploading && (
              <div className="text-sm text-muted-foreground animate-pulse">
                Subiendo...
              </div>
            )}
          </div>

          {/* Carousel Section */}
          {currentImages && currentImages.length > 0 ? (
            <div className="w-full px-4">
              <Carousel className="w-full max-w-2xl mx-auto">
                <CarouselContent>
                  {currentImages.map((url, index) => (
                    <CarouselItem key={index}>
                      <Card className="overflow-hidden self-start p-0">
                        {/* Contenedor de imagen con altura máxima controlada */}
                        <CardContent className="relative flex items-center justify-center p-0 rounded-lg overflow-hidden h-[50vh] max-h-125">
                          <img
                            src={url}
                            alt={`Facility ${index + 1}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain"
                          />
                        </CardContent>
                        <CardFooter className="justify-center p-4 bg-background border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full max-w-xs"
                            onClick={() => handleDelete(url)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
              <div className="text-center text-sm text-muted-foreground mt-4">
                {currentImages.length} imágen
                {currentImages.length !== 1 ? "es" : ""}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              No hay imágenes. Sube algunas para mostrarlas aquí.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
