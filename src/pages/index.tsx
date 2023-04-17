import type { NextPage } from "next";
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);


const CreatePostWizard = () => {
  const { user } = useUser();

  if(!user) return null;

  return (
    <div  className="flex gap-3 w-full">
        <Image
          src={user.profileImageUrl} 
          className="h-14 w-14 rounded-full"
          alt="Profile image"
          width={56}
          height={56}
         />
        <input placeholder="Type some emojis!" className="bg-transparent grow outline-none"/>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser)=>{
  const {post, author} = props;

  return (
    <div key={post.id} className="flex border-b border-slate-400 p-4 gap-4">
      <Image
        src={author.profileImageUrl} 
        className="h-14 w-14 rounded-full" 
        alt={`@${author.username}'s profile pic'`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
      <div className="flex gap-1 text-slate-300">
        <span>{`@${author.username}`}</span>
        <span>{` • ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
}

const Feed = ()=>{
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if( postsLoading ) return <LoadingPage />;

  if(!data) return <div> Something went wrong :(</div>

  return (
      <div className="flex flex-col">
        {data?.map((fullPost)=>(<PostView {...fullPost} key={fullPost.post.id}/>))}
      </div>
  );
}

const Home: NextPage = () => {
    const { isLoaded: userLoaded, isSignedIn} = useUser();
    
    // Start fetching asap
    api.posts.getAll.useQuery();
    
    if(!userLoaded ) return <div/>;


  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
          <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {!!isSignedIn && <CreatePostWizard /> }
        </div>
          <Feed />
          </div>
      </main>
    </>
  );
};

export default Home;
