import { subscriptionPlans } from "@/config/subscriptions";
import { absoluteUrl } from "@/lib/utils";
import { manageSubscriptionSchema } from "@/lib/validators/stripe";
import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const stripeRouter = createTRPCRouter({
  getSubscriptionPlan: protectedProcedure.query(async ({ ctx }) => {
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
      const subscription = await ctx.stripe.subscriptions.retrieve(
        user.stripeSubscriptionId,
      );

      isCanceled = subscription.status === "canceled";
    }

    return {
      ...plan,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      stripeCustomerId: user.stripeCustomerId,
      isPro,
      isCanceled,
    };
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

  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().default(1),
        perPage: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.posts.findMany({
        where: (table, { eq }) => eq(table.status, "published"),
        offset: (input.page - 1) * input.perPage,
        limit: input.perPage,
        orderBy: (table, { desc }) => desc(table.createdAt),
        columns: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
          createdAt: true,
        },
        with: { user: { columns: { email: true } } },
      }),
    ),
  get: protectedProcedure.input(z.string()).query(({ ctx, input }) =>
    ctx.db.query.posts.findFirst({
      where: (table, { eq }) => eq(table.id, input),
      with: { user: { columns: { email: true } } },
    }),
  ),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        excerpt: z.string().min(3).max(255),
        content: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId(15);
      await ctx.db.insert(posts).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).max(255),
        excerpt: z.string().min(3).max(255),
        content: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
        })
        .where(eq(posts.id, input.id));
    }),

  myPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().int().default(1),
        perPage: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.posts.findMany({
        where: (table, { eq }) => eq(table.userId, ctx.user.id),
        offset: (input.page - 1) * input.perPage,
        limit: input.perPage,
        orderBy: (table, { desc }) => desc(table.createdAt),
        columns: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
          createdAt: true,
        },
      }),
    ),
});
