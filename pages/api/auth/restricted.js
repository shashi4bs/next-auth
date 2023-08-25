import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextAuth]";

export default async (req, res) =>{
    const session = await getServerSession(req, res, authOptions);
    if(session){
        res.send({
            content: "This is protected Content"
        })
    }else{
        res.send({
            error: "SignIn to Access"
        })
    }
}