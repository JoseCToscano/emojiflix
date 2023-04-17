import clerkClient from "@clerk/clerk-sdk-node";
import type {User} from "@clerk/nextjs/dist/api"
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

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
        content: z.string().emoji().min(1).max(280),
    })).mutation(async({ctx, input})=>{

    const authorId = ctx.userId;

    const post = await ctx.prisma.post.create({
        data: {authorId, content: input.content }
    });

    return post;

    })
});
