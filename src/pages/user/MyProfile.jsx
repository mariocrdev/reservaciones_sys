import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfile,
  useUpdateProfile,
  useUploadProfileImage,
} from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/global/Loading";

export default function MyProfile() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: profile, isLoading, refetch } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    email: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(true); // Default to editing mode for now, or view mode. Let's make it always editable form.

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        email: profile.email || session?.user?.email || "",
      });
      if (profile.profile_image_url) {
        setPreviewUrl(profile.profile_image_url);
      }
    }
  }, [profile, session]);

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
      let imageUrl = profile?.profile_image_url;
      

      if (selectedImage) {
        imageUrl = await uploadImage.mutateAsync({
          userId,
          file: selectedImage,
        });
      }

      console.log("🚀 ~ handleSubmit ~ imageUrl:", imageUrl)

      const dataToUpdate = {
        ...formData,
        profile_image: imageUrl,
      };

      await updateProfile.mutateAsync({ userId, data: dataToUpdate });
      await refetch();
      toast.success("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar el perfil.");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y de contacto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Actualiza tus datos personales y foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer">
                <Avatar className="h-32 w-32 border-4 border-background shadow-sm">
                  <AvatarImage src={previewUrl} className="object-cover" />
                  <AvatarFallback className="bg-muted text-4xl">
                    {formData.first_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full transition-opacity transition-all duration-200"
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
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
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
              >
                Cambiar foto de perfil
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  El correo electrónico no se puede cambiar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  placeholder="Tu ciudad"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  placeholder="Tu dirección"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateProfile.isPending || uploadImage.isPending}
                className="w-full md:w-auto"
              >
                {updateProfile.isPending || uploadImage.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
