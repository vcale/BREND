console.log('Iniciando servidor...');

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/generate', async (req, res) => {
  const { platform, contentType, tone, targetAge, targetAudience, contentGoal, region, scriptLength, charLength, topic } = req.body;

  if (!platform || !contentType || !topic) {
    return res.status(400).json({
      script: { gancho: "Error", problema: "Error", solucion: "Error", cta: "Error" },
      recommendations: ["Faltan datos requeridos (plataforma, tipo de contenido o tema)."],
      viralityScore: 0,
      qualityScore: 0,
      reasons: ["Completa todos los campos."],
    });
  }

  const prompt = `
    Eres un creador de guiones profesional con experiencia en creación de contenido para redes sociales, expecificamente para video con amplia experiencia escribiendo guiones virales y de impacto. Genera un guión altamente profesional y detallado para un ${contentType} en ${platform}, con tono ${tone || 'neutral'}, dirigido a ${targetAge || '18-24'} años de ${targetAudience || 'público general'} en ${region || 'Global'}, que busque ${contentGoal || 'entretener'}, con una duración de ${scriptLength || '1min'} y aproximadamente ${charLength || '500'} caracteres, sobre el tema "${topic}". Ajusta el contenido según las características culturales y de audiencia de ${region}. El guión debe incluir:

    1. **Gancho**: Una introducción impactante para captar la atención inmediatamente.
    2. **Presentación del problema**: Describe un problema relevante para mantener el interés.
    3. **Solución del problema**: Ofrece una solución clara y atractiva.
    4. **CTA (Llamado a la acción)**: Una instrucción corta, específica y persuasiva para cerrar.

    Asegúrate de que el guión sea detallado, adaptado al tipo de contenido (${contentType}) y optimizado para la plataforma (${platform}). Además, proporciona:
    - recommendations: 3-5 recomendaciones específicas para mejorar el impacto.
    - viralityScore: puntuación de viralidad (1-10) con explicación.
    - qualityScore: puntuación de calidad (1-10) con explicación.
    - reasons: 3-5 razones por las que este contenido funcionará.

    Formatea la respuesta como un objeto JSON con las claves: script (con subsecciones gancho, problema, solucion, cta), recommendations, viralityScore, qualityScore, reasons.
  `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedText = response.content[0].text;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta');
    }
    const result = JSON.parse(jsonMatch[0]);

    res.json(result);
  } catch (error) {
    console.error('Error en generate:', error);
    res.status(500).json({
      script: { gancho: "Error al procesar", problema: "", solucion: "", cta: "" },
      recommendations: ["Revisa tu conexión o intenta de nuevo."],
      viralityScore: 0,
      qualityScore: 0,
      reasons: [`Error: ${error.message}`],
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));