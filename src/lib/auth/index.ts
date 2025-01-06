import { env } from "@/env.js";
import { absoluteUrl } from "@/lib/utils";
import { Discord } from "arctic";
import utils from "./utils";

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("/login/discord/callback"),
);

export const validateRequest = utils.validateRequest;
