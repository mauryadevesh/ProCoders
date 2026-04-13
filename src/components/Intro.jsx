import { useEffect, useState } from "react";
import { styles } from "../styles/styles";
import { LETTERS } from "../data/data";

export default function Intro() {
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    setTimeout(() => setShow(false), 3000);
  }, []);

  return (
    <div style={styles.intro(show)}>
      <h1>
        {LETTERS.map((l,i)=><span key={i}>{l}</span>)}
      </h1>
      <div style={styles.ibar(pct)} />
    </div>
  );
}