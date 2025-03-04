console.log('Iniciando servidor...');

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '', // La clave debe configurarse en Secrets
});

// Verificar si la API key está configurada
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\x1b[31m%s\x1b[0m', '⚠️ ADVERTENCIA: No se ha configurado ANTHROPIC_API_KEY');
  console.error('\x1b[33m%s\x1b[0m', 'Por favor, configura esta clave en la pestaña de Secrets del repl');
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para verificar el estado del servidor
app.get('/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    message: 'El servidor está funcionando correctamente'
  });
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
    Eres un guionista profesional con experiencia en marketing digital. Genera un guión altamente profesional y detallado para un ${contentType} en ${platform}, con tono ${tone || 'neutral'}, dirigido a ${targetAge || '18-24'} años de ${targetAudience || 'público general'} en ${region || 'Global'}, que busque ${contentGoal || 'entretener'}, con una duración de ${scriptLength || '1min'} y aproximadamente ${charLength || '500'} caracteres, sobre el tema "${topic}". Ajusta el contenido según las características culturales y de audiencia de ${region}. El guión debe incluir:

    1. **Gancho**: Una introducción impactante para captar la atención inmediatamente.
    2. **Presentación del problema**: Describe un problema relevante para mantener el interés.
    3. **Solución del problema**: Ofrece una solución clara y atractiva.
    4. **CTA (Llamado a la acción)**: Una instrucción específica y persuasiva para cerrar.

    Asegúrate de que el guión sea detallado, adaptado al tipo de contenido (${contentType}) y optimizado para la plataforma (${platform}), considerando su duración y formato típico. Además, proporciona:
    - recommendations: 3-5 recomendaciones específicas para mejorar el impacto.
    - viralityScore: puntuación de viralidad (1-10) con explicación.
    - qualityScore: puntuación de calidad (1-10) con explicación.
    - reasons: 3-5 razones por las que este contenido funcionará.

    Formatea la respuesta como un objeto JSON con las claves: script (con subsecciones gancho, problema, solucion, cta), recommendations, viralityScore, qualityScore, reasons.
  `;

  try {
    // Verificar si la API key está configurada
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY no está configurada. Por favor, configúrala en la pestaña de Secrets.');
    }

    console.log('Generando guión para:', { platform, contentType, topic });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    console.log('Respuesta recibida de Claude');
    const generatedText = response.content[0].text;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta de Claude');
    }
    const result = JSON.parse(jsonMatch[0]);

    console.log('Guión generado exitosamente');
    res.json(result);
  } catch (error) {
    console.error('Error en generate:', error);
    const errorMessage = error.message || 'Error desconocido';
    console.error('Detalles del error:', errorMessage);
    
    res.status(500).json({
      script: { gancho: "Error al procesar", problema: "", solucion: "", cta: "" },
      recommendations: ["Revisa tu conexión o intenta de nuevo."],
      viralityScore: 0,
      qualityScore: 0,
      reasons: [`Error: ${errorMessage}`],
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\x1b[32m%s\x1b[0m', '✅ Servidor iniciado correctamente');
  console.log('\x1b[36m%s\x1b[0m', `🌐 URL local: http://0.0.0.0:${PORT}`);
  console.log('\x1b[36m%s\x1b[0m', `🔗 URL de Replit: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  console.log('\x1b[35m%s\x1b[0m', '🚀 BREND - Generador de Guiones está listo para usar');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\x1b[31m%s\x1b[0m', '⚠️ ADVERTENCIA: La clave API de Anthropic no está configurada');
    console.error('\x1b[33m%s\x1b[0m', '📝 Configura ANTHROPIC_API_KEY en la pestaña Secrets');
  }
});