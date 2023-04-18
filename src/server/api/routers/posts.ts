import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import clerkClient from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";


// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */ 
  prefix: "@upstash/ratelimit",
});


export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.input(z.object({
        limit: z.number().optional()
    }).optional()).query(async ({ ctx, input }) => {

        let limit = 100;
        if(input?.limit){
            limit = input?.limit;
        }

        const posts = await  ctx.prisma.post.findMany({
            take: limit, orderBy: [{createdAt: 'desc'}]
        });

        const users = (await clerkClient.users.getUserList({
            userId: posts.map(p => p.authorId), limit
        })).map(filterUserForClient);

        return posts.map(post=>{
            const author = users.find(user=> user.id === post.authorId);

            if(!author || !author.username){
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Author for post not found"
                });
            }

            return {
                post, 
                author: {
                    ...author,
                    username: author.username
                }
            }
        })
    }),
    create: privateProcedure.input(z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(280),
    })).mutation(async({ctx, input})=>{

    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);

    if(!success){
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS'
        })
    }

    const post = await ctx.prisma.post.create({
        data: {authorId, content: input.content }
    });

    return post;

    })
});
