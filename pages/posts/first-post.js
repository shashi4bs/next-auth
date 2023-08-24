import Image from "next/image";
import Layout from "../../components/layout";

export default function FirstPost(){
    return <Layout>
        <h1>Creating Page as first-post endpoint</h1>
        <Image
            src="/images/profile.jpg"
            alt="profile image"
            width={144}
            height={144}
        />
    </Layout>
}