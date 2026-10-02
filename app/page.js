export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 32,
      fontFamily: "Arial, sans-serif",
      background: "#111",
      color: "#fff"
    }}>
      <div style={{maxWidth: 760}}>
        <h1>Life Calendar API</h1>
        <p>
          This application generates a PNG goal/life calendar directly from URL parameters.
        </p>
        <h2>Example</h2>
        <code style={{wordBreak: "break-all"}}>
          /goal?goal=175%20Days%20Hard&start_date=2026-09-27&goal_date=2027-03-20&width=1080&height=2640
        </code>
        <h2>Background</h2>
        <p>
          Put a background image at <code>/public/background.jpg</code>, or pass
          <code> background=https://...</code> to the API.
        </p>
      </div>
    </main>
  );
}
