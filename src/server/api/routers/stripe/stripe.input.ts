import { z } from "zod";

export const manageSubscriptionSchema = z.object({
  stripePriceId: z.string(),
  stripeCustomerId: z.string().optional().nullable(),
  stripeSubscriptionId: z.string().optional().nullable(),
  isPro: z.boolean(),
});

export type ManageSubscriptionInput = z.infer<typeof manageSubscriptionSchema>;
