import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptionPlans } from "@/config/subscriptions";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { ManageSubscriptionForm } from "./_components/manage-subscription-form";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Billing",
  description: "Manage your billing and subscription",
};

export default async function BillingPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/signin");
  }

  const subscriptionPlan = await api.stripe.getSubscriptionPlan.query();

  return (
    <div className="grid gap-8 py-10 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your billing and subscription
        </p>
      </div>
      <section>
        <Card className="space-y-2 p-6">
          <h3 className="text-lg font-semibold sm:text-xl">
            {subscriptionPlan.name ?? "Free"} plan
          </h3>
          <p className="text-sm text-muted-foreground">
            {!subscriptionPlan?.isPro
              ? "The free plan is limited to 3 posts. Upgrade to the Pro plan to unlock unlimited posts."
              : subscriptionPlan.isCanceled
                ? "Your plan will be canceled on "
                : "Your plan renews on "}
            {subscriptionPlan?.stripeCurrentPeriodEnd
              ? `${new Date(
                  subscriptionPlan.stripeCurrentPeriodEnd,
                ).toLocaleDateString("en-US")}`
              : null}
          </p>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader className="h-full">
              <CardTitle className="line-clamp-1">{plan.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full flex-1 place-items-start space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckIcon className="size-4" aria-hidden="true" />
                  <span>{feature}</span>
                </div>
              ))}
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
                  isPro={subscriptionPlan.isPro}
                  stripePriceId={plan.stripePriceId}
                  stripeCustomerId={subscriptionPlan?.stripeCustomerId}
                  stripeSubscriptionId={subscriptionPlan?.stripeSubscriptionId}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
