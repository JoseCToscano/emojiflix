import type { NextPage } from "next";
import Link from 'next/link';
import { useState } from 'react'
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {SignInButton, useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);


const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: ()=>{
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e)=>{
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if(errorMessage && errorMessage[0]){
          toast.error(errorMessage[0]);
        } else{
          toast.error( 'Failed to post! Please try again later')
        }
    }
  });

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
        <input
          placeholder="Type some emojis!" 
          className="bg-transparent grow outline-none"
          type="text"
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e)=>{
            if(e.key === "Enter"){
              e.preventDefault();
              if(input !== ""){
                mutate({content: input});
              }
            }
          }}
        />
        {input !== "" && !isPosting &&  <button onClick={()=>mutate({content: input })} disabled={isPosting}>Post</button>}
        {isPosting && 
          <div className="flex justify-center items-center">
            <LoadingSpinner size={20}/>
          </div>
        }
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
        <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
        <Link href={`/post/${post.id}`}><span>{` • ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <Link href={`/post/${post.id}`}><span className="text-2xl">{post.content}</span></Link>
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
      <main className="flex h-screen justify-center">
          <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {!!isSignedIn && <CreatePostWizard /> }
        </div>
          <Feed />
          </div>
      </main>
  );
};

export default Home;
