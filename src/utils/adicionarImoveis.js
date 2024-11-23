const imoveis = [
    { id: "Ap102", moradorId: "" },
    { id: "Ap103", moradorId: "" },
    { id: "Ap104", moradorId: "" },
    { id: "Ap105", moradorId: "" },
    { id: "Ap106", moradorId: "" },
    { id: "Ap107", moradorId: "" },
    { id: "Ap108", moradorId: "" },
    { id: "Ap109", moradorId: "" },
    { id: "Ap110", moradorId: "" },
    { id: "Ap111", moradorId: "" },
    { id: "Ap112", moradorId: "" },
    { id: "Ap113", moradorId: "" },
    { id: "Ap114", moradorId: "" },
    { id: "Ap115", moradorId: "" },
    { id: "Ap116", moradorId: "" },
    { id: "Ap117", moradorId: "" },
    { id: "Ap118", moradorId: "" },
    { id: "Ap119", moradorId: "" },
    { id: "Ap120", moradorId: "" },
  ];
  

adicionarImoveis("recantoDosPassaros", imoveis)
  .then(() => console.log("Imóveis adicionados com sucesso"))
  .catch(error => console.error("Erro ao adicionar imóveis: ", error));
