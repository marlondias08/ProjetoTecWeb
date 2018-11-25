angular.module("app").component("tabelaAlimentos", {
  templateUrl: "tabela-alimentos.html",
  bindings: {
    query: "&",
    titulo: "<"
  },
  controller($filter, $location, $http) {
    this.$onInit = () => {
      this.isLoading = true;
      this.queryRefeicoes();
      this.query().then(({ data }) => {
        this.isLoading = false;
        this.alimentos = data;
        this.atualizarFiltros();
      });
    };

    this.queryRefeicoes = () => {
      this.isLoadingRefeicoes = true;
      $http.get("/api/refeicoes").then(({ data }) => {
        this.refeicoes = data;
        this.isLoadingRefeicoes = false;
      });
    };

    this.atualizarFiltros = () => {
      this.alimentosFiltrados = $filter("filter")(this.alimentos, {
        description: this.searchText || undefined
      });
    };

    this.novoAlimento = () => {
      $location.path("/novo-alimento");
    };

    this.exibirAlimento = id => {
      if (this.titulo === "Alimentos") {
        $location.path(`/alimentos/${id}`);
      } else {
        $location.path(`/meus-alimentos/${id}`);
      }
    };

    this.adicionarAlimento = alimento => {
      const alimentoRefeicao = {
        alimento,
        nomeModelo:
          this.titulo === "Alimentos" ? "Alimento" : "AlimentoUsuario",
        quantidade: this.quantidadeAlimento,
        totalCalorias: this.quantidadeAlimento * (alimento.energy_kcal / 100),
        totalProteinas: this.quantidadeAlimento * (alimento.protein_g / 100),
        totalCarboidratos:
          this.quantidadeAlimento * (alimento.carbohydrate_g / 100),
        totalLipidios: this.quantidadeAlimento * (alimento.lipidius_g / 100)
      };

      $http.post(
        `/api/refeicoes/${this.refeicao._id}/alimentos`,
        alimentoRefeicao
      );
    };
  }
});
