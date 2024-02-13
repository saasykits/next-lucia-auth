import Link from "next/link";

import { CheckIcon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/shared";
import { ManageSubscriptionForm } from "./manage-subscription-form";

interface BillingProps {
  stripePromises: Promise<
    [RouterOutputs["stripe"]["getPlans"], RouterOutputs["stripe"]["getPlan"]]
  >;
}

export async function Billing({ stripePromises }: BillingProps) {
  const [subscriptionPlans, subscriptionPlan] = await stripePromises;

  return (
    <>
      <section>
        <Card className="space-y-2 p-8">
          <h3 className="text-lg font-semibold sm:text-xl">
            {subscriptionPlan?.name ?? "Free"} plan
          </h3>
          <p className="text-sm text-muted-foreground">
            {!subscriptionPlan?.isPro
              ? "The free plan is limited to 3 posts. Upgrade to the Pro plan to unlock unlimited posts."
              : subscriptionPlan.isCanceled
                ? "Your plan will be canceled on "
                : "Your plan renews on "}
            {subscriptionPlan?.stripeCurrentPeriodEnd
              ? formatDate(subscriptionPlan.stripeCurrentPeriodEnd)
              : null}
          </p>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.name} className="flex flex-col p-2">
            <CardHeader className="h-full">
              <CardTitle className="line-clamp-1">{plan.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full flex-1 space-y-6">
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="aspect-square shrink-0 rounded-full bg-foreground p-px text-background">
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              {plan.name === "Free" ? (
                <Button className="w-full" asChild>
                  <Link href="/dashboard">
                    Get started
                    <span className="sr-only">Get started</span>
                  </Link>
                </Button>
              ) : (
                <ManageSubscriptionForm
                  isPro={subscriptionPlan?.isPro ?? false}
                  stripePriceId={plan.stripePriceId}
                  stripeCustomerId={subscriptionPlan?.stripeCustomerId}
                  stripeSubscriptionId={subscriptionPlan?.stripeSubscriptionId}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  );
}
