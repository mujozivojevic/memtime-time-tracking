export default function Panel({ title, className, ref, children }) {
  return (
    <section className={className ? `panel ${className}` : "panel"} ref={ref}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
