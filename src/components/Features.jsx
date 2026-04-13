import { FEATURES } from "../data/data";

export default function Features() {
  return (
    <div>
      {FEATURES.map(([icon,title,desc])=>(
        <div key={title}>
          <h3>{icon} {title}</h3>
          <p>{desc}</p>
        </div>
      ))}
    </div>
  );
}