import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailablePlans from "@/components/user/memberships/AvailablePlans";
import MySubscriptions from "@/components/user/memberships/MySubscriptions";
import FamilyMembers from "@/pages/user/FamilyMembers"; // Reusing the page component
import { useSearchParams } from "react-router-dom";

export default function MembershipsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "plans";

    const handleTabChange = (value) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Membresías</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona tus suscripciones, explora nuevos planes y administra tu grupo familiar.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="plans">Planes Disponibles</TabsTrigger>
                    <TabsTrigger value="mysubs">Mis Suscripciones</TabsTrigger>
                    <TabsTrigger value="family">Grupo Familiar</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="space-y-6">
                    <AvailablePlans />
                </TabsContent>

                <TabsContent value="mysubs" className="space-y-6">
                    <MySubscriptions />
                </TabsContent>

                <TabsContent value="family">
                    <div className="-m-6">
                        <FamilyMembers />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
