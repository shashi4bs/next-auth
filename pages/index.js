import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from './navbar';

require("dotenv").config()

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {
  const names = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];

  const [likes, setLikes] = useState(0);

  function handleClick() {
    setLikes(likes + 1);
  }

  return (
    <>
      <Navbar></Navbar>
      <Header title="Develop. Preview. Ship. 🚀" />
      <ul>
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <button onClick={handleClick}>Like ({likes})</button>
      <h1 className='title'>
          Read <Link href="posts/firslogin-post">this page!</Link>
      </h1>
    </>
  );
}