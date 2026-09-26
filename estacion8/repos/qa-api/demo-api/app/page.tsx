export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Demo API — QA API Testing</h1>
      <p>Esta es la API simulada para las pruebas de la Clase 8.</p>
      <h2>Endpoints disponibles:</h2>
      <ul>
        <li><code>GET /api/health</code></li>
        <li><code>POST /api/conversations</code></li>
        <li><code>GET /api/conversations</code></li>
        <li><code>GET /api/conversations/:id</code></li>
        <li><code>DELETE /api/conversations/:id</code></li>
        <li><code>POST /api/conversations/:id/messages</code></li>
        <li><code>GET /api/conversations/:id/messages</code></li>
        <li><code>POST /api/agent/chat</code></li>
      </ul>
    </main>
  );
}
