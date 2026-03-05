import { useEffect, useState } from "react";
import {
  useProfile,
  useUpdateProfile,
  useUploadProfileImage,
} from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export function ProfileCompletionModal() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: profile, isLoading } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    date_birth: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (profile && !isLoading) {
      const isIncomplete =
        !profile.first_name || !profile.last_name || !profile.phone;

      const shouldOpen = isIncomplete; // Could also check for optional fields if we wanted to prompt, but user only wants mandatory for modal trigger.

      if (shouldOpen) {
        setOpen(true);
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          date_birth: profile.date_birth || "",
        });
        if (profile.profile_image_url) {
          setPreviewUrl(profile.profile_image_url);
        }
      } else {
        setOpen(false);
      }
    }
  }, [profile, isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.phone) {
      toast.error("Por favor completa los campos obligatorios (*).");
      return;
    }

    try {
      let imageUrl = profile.profile_image_url;

      if (selectedImage) {
        imageUrl = await uploadImage.mutateAsync({
          userId,
          file: selectedImage,
        });
      }

      const dataToUpdate = {
        ...formData,
        profile_image: imageUrl,
      };

      await updateProfile.mutateAsync({ userId, data: dataToUpdate });

      toast.success("Perfil actualizado correctamente.");
      setOpen(false);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil.");
    }
  };

  if (isLoading || !profile) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Prevent closing if incomplete (mandatory fields only)
        if (
          !val &&
          (!profile.first_name || !profile.last_name || !profile.phone)
        ) {
          return;
        }
        setOpen(val);
      }}

    >
      <DialogContent
        className="sm:max-w-xl max-h-[85vh] overflow-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Completa tu Perfil</DialogTitle>
          <DialogDescription>
            Por favor completa tu información personal para continuar. Los
            campos marcados con (*) son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="bg-muted">
                  {formData.first_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
                onClick={() => document.getElementById("image-upload").click()}
              >
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Label
              htmlFor="image-upload"
              className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
            >
              Cambiar foto de perfil
            </Label>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_birth">
                Fecha de Nacimiento <span className="text-muted-foreground text-xs">(Opcional)</span>
              </Label>
              <Input
                id="date_birth"
                name="date_birth"
                type="date"
                value={formData.date_birth}
                onChange={handleChange}
              />
            </div>
          </div>


          <DialogFooter>
            <Button
              type="submit"
              disabled={updateProfile.isPending || uploadImage.isPending}
            >
              {updateProfile.isPending || uploadImage.isPending
                ? "Guardando..."
                : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
