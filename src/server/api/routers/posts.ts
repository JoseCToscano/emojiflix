import clerkClient from "@clerk/clerk-sdk-node";
import type {User} from "@clerk/nextjs/dist/api"
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl
    }
}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.input(z.object({
        limit: z.number().optional()
    }).optional()).query(async ({ ctx, input }) => {

        let limit = 100;
        if(input?.limit){
            limit = input?.limit;
        }

        const posts = await  ctx.prisma.post.findMany({
            take: limit
        });

        const users = (await clerkClient.users.getUserList({
            userId: posts.map(p => p.authorId), limit
        })).map(filterUserForClient);

        return posts.map(post=>{
            const author = users.find(user=> user.id === post.authorId);

            if(!author){
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
});
