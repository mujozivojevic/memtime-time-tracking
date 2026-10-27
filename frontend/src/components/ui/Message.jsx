export default function Message({ type, children }) {
  return (
    <p
      className={`message message-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
