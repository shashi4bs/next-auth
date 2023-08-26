import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar(){
    const {session, status} = useSession();
    if(status === "authenticated"){
        return (
            <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
            >
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/">Blogs</Link>
            </Typography>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {status}
            </Typography>
            <Button onClick={()=>signOut()} color="inherit">SignOut</Button>
            </Toolbar>
        </AppBar>
        </Box>
        );
    }else{
        return (
            <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
            >
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/">Blogs</Link>
            </Typography>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {status}
            </Typography>
            <Link href="/login"><Button color="inherit">Login</Button>
            </Link>
            </Toolbar>
        </AppBar>
        </Box>
        );
    }
}