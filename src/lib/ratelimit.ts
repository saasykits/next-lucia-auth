import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis:Redis.fromEnv(),
  // using sliding window approach  - found out more - https://github.com/upstash/ratelimit#sliding-window
  limiter:Ratelimit.slidingWindow(1 , "10 m")

})