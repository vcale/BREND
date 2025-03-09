const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('script-form');
  const resultContent = document.getElementById('result-content');
  const loadingContainer = document.getElementById('loading-container');
  const generateBtn = document.getElementById('generate-btn');
  const resultActions = document.getElementById('result-actions');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const copyBtn = document.getElementById('copy-btn');
  const lightModeBtn = document.getElementById('light-mode-btn');
  const darkModeBtn = document.getElementById('dark-mode-btn');
  let currentResult = null;

  // Theme toggle
  lightModeBtn.addEventListener('click', () => {
    document.body.classList.remove('dark-mode');
    lightModeBtn.classList.add('active');
    darkModeBtn.classList.remove('active');
  });

  darkModeBtn.addEventListener('click', () => {
    document.body.classList.add('dark-mode');
    darkModeBtn.classList.add('active');
    lightModeBtn.classList.remove('active');
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.platform || !data.contentType || !data.topic) {
      resultContent.innerHTML = '<p style="color: red;">Por favor, completa los campos obligatorios: Plataforma, Tipo de Contenido y Tema.</p>';
      return;
    }

    generateBtn.disabled = true;
    resultContent.style.display = 'none';
    loadingContainer.style.display = 'block';
    resultActions.style.display = 'none';

    try {
      const response = await fetch('https://brend-backend.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      currentResult = result;

      resultContent.innerHTML = `
        <h3>Guión</h3>
        <p><strong>Gancho:</strong> ${result.script.gancho}</p>
        <p><strong>Problema:</strong> ${result.script.problema}</p>
        <p><strong>Solución:</strong> ${result.script.solucion}</p>
        <p><strong>CTA:</strong> ${result.script.cta}</p>
        <h3>Recomendaciones</h3>
        <ul>${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
        <h3>Puntuación</h3>
        <p>Viralidad: ${result.viralityScore}/10</p>
        <p>Calidad: ${result.qualityScore}/10</p>
        <h3>Razones</h3>
        <ul>${result.reasons.map(reason => `<li>${reason}</li>`).join('')}</ul>
      `;
      resultContent.style.display = 'block';
      resultActions.style.display = 'flex';
    } catch (error) {
      console.error('Error:', error);
      resultContent.innerHTML = '<p style="color: red;">Error al generar el guión. Intenta de nuevo.</p>';
      resultContent.style.display = 'block';
    } finally {
      loadingContainer.style.display = 'none';
      generateBtn.disabled = false;
    }
  });

  // Export to PDF
  exportPdfBtn.addEventListener('click', () => {
    if (!currentResult) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Guión - BREND", 10, 10);
    doc.setFontSize(12);
    doc.text(`Gancho: ${currentResult.script.gancho}`, 10, 20);
    doc.text(`Problema: ${currentResult.script.problema}`, 10, 30);
    doc.text(`Solución: ${currentResult.script.solucion}`, 10, 40);
    doc.text(`CTA: ${currentResult.script.cta}`, 10, 50);
    doc.text("Recomendaciones:", 10, 60);
    currentResult.recommendations.forEach((rec, i) => doc.text(`- ${rec}`, 10, 70 + i * 10));
    doc.text(`Viralidad: ${currentResult.viralityScore}/10`, 10, 70 + currentResult.recommendations.length * 10 + 10);
    doc.text(`Calidad: ${currentResult.qualityScore}/10`, 10, 70 + currentResult.recommendations.length * 10 + 20);
    doc.text("Razones:", 10, 70 + currentResult.recommendations.length * 10 + 30);
    currentResult.reasons.forEach((reason, i) => doc.text(`- ${reason}`, 10, 70 + currentResult.recommendations.length * 10 + 40 + i * 10));
    doc.save('guion-brend.pdf');
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    if (!currentResult) return;
    const text = `Gancho: ${currentResult.script.gancho}\nProblema: ${currentResult.script.problema}\nSolución: ${currentResult.script.solucion}\nCTA: ${currentResult.script.cta}\n\nRecomendaciones:\n${currentResult.recommendations.join('\n')}\n\nViralidad: ${currentResult.viralityScore}/10\nCalidad: ${currentResult.qualityScore}/10\n\nRazones:\n${currentResult.reasons.join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles!');
  });
});