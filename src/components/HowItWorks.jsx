import { styles } from "../styles/styles";

const STEPS = [
  ["👤","01","Login"],
  ["📝","02","Take Quiz"],
  ["🔍","03","AI Analysis"],
  ["⚡","04","Weak Areas"],
  ["💡","05","Recommendations"],
  ["📊","06","Dashboard"]
];

export default function HowItWorks() {
  return (
    <section style={styles.sec("#1A3263")}>
      <div style={styles.inn}>
        <h2 style={{color:"#EFD2B0"}}>How It Works</h2>
        <div style={styles.steps}>
          {STEPS.map(([icon,num,label],i)=>(
            <div key={i} style={styles.step}>
              <div style={styles.sc}>{icon}</div>
              <h4 style={{color:"#FFC570"}}>{num}</h4>
              <p style={{color:"#EFD2B0"}}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}