const subtitles = [
    "Tu historia, nuestro guión",
    "Crea contenido que conecte",
    "Guiones que venden"
  ];
  let subtitleIndex = 0;
  
  function rotateSubtitles() {
    const rotatingText = document.getElementById("rotating-text");
    subtitleIndex = (subtitleIndex + 1) % subtitles.length;
    rotatingText.textContent = subtitles[subtitleIndex];
  }
  
  setInterval(rotateSubtitles, 3000);
  
  document.getElementById("script-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
  
    const resultContainer = document.getElementById("result-container");
    resultContainer.innerHTML = "<p>Generando tu guión, por favor espera...</p>";
  
    try {
      const response = await fetch("https://brend-backend.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
  
      resultContainer.innerHTML = `
        <h4>Guión</h4>
        <p><strong>Gancho:</strong> ${result.script.gancho}</p>
        <p><strong>Problema:</strong> ${result.script.problema}</p>
        <p><strong>Solución:</strong> ${result.script.solucion}</p>
        <p><strong>CTA:</strong> ${result.script.cta}</p>
      `;
    } catch (error) {
      resultContainer.innerHTML = "<p>Error al generar el guión. Intenta de nuevo.</p>";
      console.error(error);
    }
  });