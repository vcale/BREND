console.log('Iniciando servidor...');

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Sirve archivos desde la carpeta public

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Sirve el frontend
});

app.post('/generate', async (req, res) => {
  const { contentType, platform, tone, targetAge, targetAudience, contentGoal, region, scriptLength, additionalInfo } = req.body;

  const prompt = `
    Genera un objeto JSON válido y completo con:
    - script: un guión detallado para un ${contentType} en ${platform}, con tono ${tone}, dirigido a ${targetAge} años de ${targetAudience} en ${region}, que busque ${contentGoal}, longitud ${scriptLength}. Usa ${additionalInfo || "sin información adicional"} como contexto.
    - recommendations: 3-5 recomendaciones para mejorar el impacto.
    - viralityScore: puntuación de viralidad (1-10) con explicación.
    - qualityScore: puntuación de calidad (1-10) con explicación.
    - reasons: 3-5 razones por las que este contenido funcionará.
    Asegúrate de cerrar todas las llaves y comillas correctamente.
  `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedText = response.content[0].text;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      script: "Error al generar el guión.",
      recommendations: ["Intenta de nuevo."],
      viralityScore: 0,
      qualityScore: 0,
      reasons: ["Formato inválido."],
    };

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      script: "Error al procesar la solicitud.",
      recommendations: ["Revisa tu conexión o intenta de nuevo."],
      viralityScore: 0,
      qualityScore: 0,
      reasons: [`Error: ${error.message}`],
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));