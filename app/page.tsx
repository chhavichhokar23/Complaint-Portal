import Link from "next/link";
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/login")
  return <div>
    {/* <p>Welcome to complaint portal</p>
    <Link href="/login" ><button className="bg-amber-400 cursor-pointer">login</button></Link> */}
  </div>;
}