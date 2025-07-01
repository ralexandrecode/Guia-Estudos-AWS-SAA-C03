// Arquivo: assets/js/gemini-helper.js

async function perguntarIA() {
  const pergunta = document.getElementById("user-question").value.trim();
  const respostaDiv = document.getElementById("ia-response");
  respostaDiv.innerHTML = "💬 Processando...";

  if (!pergunta) {
    respostaDiv.innerHTML = "❗ Por favor, digite uma pergunta.";
    return;
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_CHAVE_AQUI";

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Você é um instrutor certificado da AWS preparando alunos para a certificação SAA-C03. Responda à pergunta abaixo de forma objetiva, clara e baseada apenas no conteúdo que é cobrado no exame. Foque nas funcionalidades, arquitetura, integração e segurança do serviço Amazon Comprehend. Evite explicações fora do escopo do exame.\n\nPergunta: "${pergunta}"`
          }
        ]
      }
    ]
  };

  try {
    const resposta = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      throw new Error("Erro ao chamar a API");
    }

    const data = await resposta.json();
    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ Não foi possível responder.";

    respostaDiv.innerHTML = `<div style="border-left: 4px solid #007BFF; padding-left: 10px;"><strong>Resposta:</strong><br>${texto}</div>`;
  } catch (error) {
    console.error("Erro ao buscar resposta da IA:", error);
    respostaDiv.innerHTML =
      "❌ Erro ao tentar obter resposta da IA. Verifique a chave da API ou tente novamente mais tarde.";
  }
}

// Permite pressionar Enter+Ctrl para enviar
const textarea = document.getElementById("user-question");
if (textarea) {
  textarea.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      perguntarIA();
    }
  });
}
