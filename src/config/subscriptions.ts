import { env } from "@/env";

export const subscriptionPlans = [
  {
    name: "Free",
    description: "The free plan is limited to 3 posts.",
    features: ["Up to 3 posts", "Limited support"],
    stripePriceId: "",
  },
  {
    name: "Pro",
    description: "The Pro plan has unlimited posts.",
    features: ["Unlimited posts", "Priority support"],
    stripePriceId: env.STRIPE_PRO_MONTHLY_PLAN_ID,
  },
];
