import type {  NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";



const ProfilePage: NextPage = () => {

const {data, isLoading} = api.profile.getUserByUserName.useQuery({username: 'josectoscano'});

if(isLoading) {
    console.log('Loading!!!!')
}

if(!data) return <div> 404 not found </div>

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center">
          <div>{data.username}</div>
      </main>
    </>
  );
};

// import { createProxySSGHelpers } from '@trpc/react-query/ssg';
// import { appRouter } from "~/server/api/root";
// import { prisma } from "~/server/db";
// import superjson from "superjson";

// export const getStaticProps: GetStaticProps = async (context ) =>{
// const ssg = createProxySSGHelpers({
//   router: appRouter,
//   ctx: { prisma, userId: null },
//   transformer: superjson, // optional - adds superjson serialization
// });

// const slug = context.params?.slug;


// if( typeof slug !== 'string') throw new Error("no slug");

// const username = slug.replace('@', "");

// await ssg.profile.getUserByUserName.prefetch({username });

// return {
//     props: {
//         trpcState: ssg.dehydrate()
//     },
// };
// }

// export const getStaticPaths = ()=>{
//     return {paths: [], fallback: "blocking"}
// }

export default ProfilePage;
