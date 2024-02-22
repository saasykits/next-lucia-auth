import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";

// creating redis client
const redis = new Redis({
  url: 'UPSTASH_REDIS_REST_URL',
  token: 'UPSTASH_REDIS_REST_TOKEN',
})