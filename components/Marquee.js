export default function Marquee({ text, accent }) {
  const repeated = Array(6).fill(text).join("");
  return (
    <div className="marquee-wrap" style={{ "--accent": accent }}>
      <div className="marquee-track">
        <span>{repeated}</span>
        <span aria-hidden="true">{repeated}</span>
      </div>
    </div>
  );
}
