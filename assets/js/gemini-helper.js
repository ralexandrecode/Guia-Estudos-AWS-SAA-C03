async function perguntarIA() {
  const pergunta = document.getElementById("user-question").value.trim();
  const respostaDiv = document.getElementById("ia-response");

  if (!pergunta) {
    respostaDiv.innerHTML = "❗Digite uma pergunta antes de enviar.";
    return;
  }

  respostaDiv.innerHTML = "💬 Processando...";

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_API_KEY_AQUI";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `Você é um especialista AWS, focado no serviço Amazon Comprehend. Responda com clareza e objetividade esta dúvida:\n\n"${pergunta}"` }]
      }
    ]
  };

  try {
    const resposta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await resposta.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Não foi possível responder.";
    respostaDiv.innerHTML = `<strong>Resposta:</strong><br>${texto}`;
  } catch (error) {
    respostaDiv.innerHTML = "❌ Erro ao conectar com a API.";
    console.error(error);
  }
}
