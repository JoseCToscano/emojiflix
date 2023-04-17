import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const webhookRouter = createTRPCRouter({
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


        return posts
            
    })
});
