import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { MembershipService } from "@/services/membership.service";
import { toast } from "sonner";
import { Loader2, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SubscriptionDialog({ open, onOpenChange, plan, user }) {
    const { data: familyMembers, isLoading: loadingFamily } = useFamilyMembers();
    const [selectedBeneficiary, setSelectedBeneficiary] = useState("self"); // 'self' or family_member_id
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubscribe = async () => {
        try {
            setSubmitting(true);

            const subscriptionData = {
                userId: user.id,
                planId: plan.id,
                familyMemberId: selectedBeneficiary === "self" ? null : selectedBeneficiary
            };

            await MembershipService.subscribe(subscriptionData);

            toast.success("¡Solicitud de suscripción creada exitosamente!");
            onOpenChange(false);
            // Optionally redirect to My Subscriptions or payment
            navigate("/memberships?tab=mysubs"); // Adjust route as needed
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la suscripción: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>Confirmar Suscripción</DialogTitle>
                    <DialogDescription>
                        Estás a punto de suscribirte al plan <strong>{plan.product_name} - {plan.name}</strong> por <strong>{plan.currency} {plan.price}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">¿Para quién es esta membresía?</h4>

                    <RadioGroup value={selectedBeneficiary} onValueChange={setSelectedBeneficiary} className="grid grid-cols-1 gap-4">
                        <div className={`flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 ${selectedBeneficiary === "self" ? "border-primary bg-primary/5" : ""}`}>
                            <RadioGroupItem value="self" id="self" />
                            <Label htmlFor="self" className="flex items-center gap-3 cursor-pointer w-full font-normal">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">Para mí</div>
                                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                                </div>
                            </Label>
                        </div>

                        {familyMembers?.map(member => (
                            <div key={member.id} className={`flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50 ${selectedBeneficiary === member.id ? "border-primary bg-primary/5" : ""}`}>
                                <RadioGroupItem value={member.id} id={member.id} />
                                <Label htmlFor={member.id} className="flex items-center gap-3 cursor-pointer w-full font-normal">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">{member.first_name} {member.last_name}</div>
                                        <div className="text-xs text-muted-foreground">Familiar</div>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {familyMembers?.length === 0 && (
                        <div className="text-xs text-center text-muted-foreground bg-muted/20 p-2 rounded">
                            ¿Necesitas inscribir a un hijo? Agrega familiares en la pestaña "Grupo Familiar".
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubscribe} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Suscripción
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
