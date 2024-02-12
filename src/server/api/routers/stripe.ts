import { subscriptionPlans } from "@/config/subscriptions";
import { absoluteUrl } from "@/lib/utils";
import { manageSubscriptionSchema } from "@/lib/validators/stripe";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { stripe } from "@/lib/stripe";

export const stripeRouter = createTRPCRouter({
  getSubscriptionPlan: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, ctx.user.id),
        columns: {
          stripePriceId: true,
          stripeCurrentPeriodEnd: true,
          stripeSubscriptionId: true,
          stripeCustomerId: true,
        },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      // Check if user is on a pro plan
      const isPro =
        !!user.stripePriceId &&
        (user.stripeCurrentPeriodEnd?.getTime() ?? 0) + 86_400_000 > Date.now();

      const plan = isPro ? subscriptionPlans[1] : subscriptionPlans[0];

      // Check if user has canceled subscription
      let isCanceled = false;
      if (isPro && !!user.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId,
        );
        isCanceled = stripePlan.cancel_at_period_end;
      }

      return {
        ...plan,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        stripeCustomerId: user.stripeCustomerId,
        isPro,
        isCanceled,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }),
  manageSubscription: protectedProcedure
    .input(manageSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const billingUrl = absoluteUrl("/dashboard/billing");

      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, ctx.user.id),
        columns: {
          id: true,
          email: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
        },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      // If the user is already subscribed to a plan, we redirect them to the Stripe billing portal
      if (input.isPro && input.stripeCustomerId) {
        const stripeSession = await ctx.stripe.billingPortal.sessions.create({
          customer: input.stripeCustomerId,
          return_url: billingUrl,
        });

        return {
          url: stripeSession.url,
        };
      }

      // If the user is not subscribed to a plan, we create a Stripe Checkout session
      const stripeSession = await ctx.stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.email,
        line_items: [
          {
            price: input.stripePriceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
        },
      });

      return {
        url: stripeSession.url,
      };
    }),
});
