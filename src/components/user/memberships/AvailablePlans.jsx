import { useState, useEffect } from "react";
import { MembershipService } from "@/services/membership.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import SubscriptionDialog from "./SubscriptionDialog";
import { useAuth } from "@/hooks/useAuth";

export default function AvailablePlans() {
  const { session } = useAuth();
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await MembershipService.getAllProducts();

      // Filter active products
      const activeProducts = productsData.filter((p) => p.active);
      setProducts(activeProducts);

      // Load plans for each product
      const plansMap = {};
      await Promise.all(
        activeProducts.map(async (product) => {
          const productPlans = await MembershipService.getPlansByProductId(
            product.id,
          );
          plansMap[product.id] = productPlans.filter((p) => p.is_active);
        }),
      );

      setPlans(plansMap);
    } catch (error) {
      console.error("Error loading membership data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan, product) => {
    setSelectedPlan({ ...plan, product_name: product.name });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No hay membresías disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SubscriptionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plan={selectedPlan}
        user={session?.user}
      />

      {products.map((product) => {
        const productPlans = plans[product.id] || [];
        if (productPlans.length === 0) return null;

        return (
          <div key={product.id} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full md:w-1/3 max-w-sm rounded-lg object-cover aspect-video shadow-md"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-primary">
                  {product.name}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {product.description}
                </p>

                {product.features && product.features.length > 0 && (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {productPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col border-primary/20 hover:border-primary transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="text-xl flex justify-between items-center">
                      {plan.name || "Standard"}
                      <Badge variant="secondary" className="text-lg">
                        {plan.currency} {plan.price}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {formatDuration(plan.duration)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {/* Additional plan details could go here */}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan, product)}
                    >
                      Suscribirse
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <hr className="my-8 border-muted" />
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(durationObj) {
  // interval object usually comes as keys (years, months, days) from Postgres if parsed by a library,
  // but supabase js client might return it as a string if not typed?
  // Usually it returns a string like "1 year" or ISO format.
  // Let's assume it's a string or we render it simply.
  // If it is a string from PG:
  return String(durationObj);
}
