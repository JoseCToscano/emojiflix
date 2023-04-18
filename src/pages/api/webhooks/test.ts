import type { NextApiRequest, NextApiResponse } from 'next';
import { postsRouter } from '~/server/api/routers/posts';
import { prisma } from "~/server/db";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    
const caller = postsRouter.createCaller({
  prisma, userId: 'user_2OWTrl2fJzFfbLlO41CBXUU0J0o' // Hardcoded
}); 

const content = ["😒","🥵","😂","🇪🇸","🇩🇪","😩","😁","😳","😉","😑","🙈","🎶"];
const index = Math.floor(Math.random() * content.length);

const result = await caller.create({content: content[index] as string});


    // Handle the webhook event and data
    // ...

    res.status(200).json({result});
  } else {
    res.status(405).end();
  }
}
