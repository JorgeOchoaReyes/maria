import Image from "next/image"; 
import { Chat } from "@/components/chat";
 

export default function Home() { 
  return (
    <div>
      <main className=" "> 
        <Chat />
      </main> 
    </div>
  );
}
