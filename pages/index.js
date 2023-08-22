import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useRef } from 'react';
import Page from './page';

function Header({title}){
  return <h1>Develop. Preview Ship {title}</h1>;
}
function Counter(){
  let ref = useRef(0);
  let handleClick = () =>{
    ref.current = ref.current + 1;
    alert('You Clicked '+ ref.current + ' times')
  }
  return (<div>
  <button onClick={handleClick}>Click Me!</button>
        <br/> <div>clicked {ref.current} times</div>
        </div>
  )
}
export default function Home() {
  return (
   <div>
    <Header title="React"/>
    <Counter/>
    <Page/>
   </div>
  )
}
