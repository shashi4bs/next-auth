import Image from "next/image";
import Layout from "../../components/layout";
import { Link } from "@mui/material";

export default function FirstPost(){
    return <Layout>
        <h1>Creating Page as first-post endpoint</h1>
        <Image
            src="/images/profile.jpg"
            alt="profile image"
            width={144}
            height={144}
        />
        <Link href="books">Add Books</Link>
    </Layout>
}