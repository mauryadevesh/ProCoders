import { styles } from "../styles/styles";

const TAGS = [
  "React",
  "HTML + CSS + JS",
  "Node.js",
  "MongoDB",
  "Chart.js",
  "REST API"
];

export default function TechStack() {
  return (
    <section style={styles.sec("#EFD2B0")}>
      <div style={styles.inn}>
        <h2>Technology Stack</h2>
        <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
          {TAGS.map((tag,i)=>(
            <span key={i} style={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
    </section>
  );
}