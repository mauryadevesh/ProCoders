import { styles } from "../styles/styles";

export default function CTA() {
  return (
    <section style={styles.ctaSec}>
      <h2 style={styles.ctaH2}>
        Ready to ace your <span style={{color:"#FFC570"}}>placements</span>?
      </h2>
      <p style={styles.ctaP}>
        Join thousands of students who study smarter with ProCoder.
      </p>

      <div style={{display:"flex",justifyContent:"center",gap:"10px"}}>
        <button style={styles.btng}>Start for Free →</button>
        <button style={styles.btngh}>View Project</button>
      </div>
    </section>
  );
}