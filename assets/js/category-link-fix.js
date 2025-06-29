// Script para corrigir dinamicamente o link "Voltar para Categoria"
// Suporta exceções entre o nome da pasta e o nome do arquivo da categoria

(function () {
  // Mapeamento de exceções: pasta → arquivo da categoria
  const categoryAliasMap = {
    "machine": "machine-learning",
    "ml": "machine-learning",
    "ai": "machine-learning",
    // Adicione outras exceções personalizadas aqui
  };

  try {
    const pathParts = window.location.pathname.split('/');
    const servicesIndex = pathParts.indexOf("services");
    if (servicesIndex === -1 || !pathParts[servicesIndex + 1]) return;

    const currentCategory = pathParts[servicesIndex + 1];
    const categoryFile = categoryAliasMap[currentCategory] || currentCategory;
    const backLink = document.querySelector(".back-to-category");

    if (backLink) {
      backLink.href = `/Guia-Estudos-AWS-SAA-C03/categories/${categoryFile}.html`;
    }
  } catch (error) {
    console.error("Erro ao configurar o link de categoria:", error);
  }
})();
