import { STATS } from "../data/data";
import { styles } from "../styles/styles";

export default function Stats() {
  return (
    <div style={styles.stats}>
      {STATS.map(([n,l],i)=>(
        <div key={i}>
          <h2>{n}</h2>
          <p>{l}</p>
        </div>
      ))}
    </div>
  );
}