document.addEventListener("DOMContentLoaded", () => {
  const perguntaInput = document.getElementById("user-question");
  const perguntaBtn = document.getElementById("perguntar-btn");
  const respostaDiv = document.getElementById("ia-response");

  perguntaInput.addEventListener("keydown", (e) => {
    // Garante que espaços sejam permitidos
    if (e.key === " " || e.key === "Spacebar") {
      e.stopPropagation();
    }
  });

  perguntaBtn.addEventListener("click", async () => {
    const pergunta = perguntaInput.value.trim();
    if (!pergunta) {
      respostaDiv.innerHTML = "⚠️ Digite sua dúvida.";
      return;
    }

    respostaDiv.innerHTML = "💬 Processando...";

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_CHAVE_AQUI";

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Você é um especialista AWS, focado no serviço Amazon Comprehend. Responda com clareza e objetividade esta dúvida:\n\n"${pergunta}"`
            }
          ]
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
    } catch (e) {
      respostaDiv.innerHTML = "❌ Erro ao processar sua pergunta.";
    }
  });
});
