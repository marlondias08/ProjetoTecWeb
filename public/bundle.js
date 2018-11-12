(function () {
  'use strict';

  angular.module("app", ["ngRoute"]);

  angular.module("app").directive("logout", (Auth, $location) => ({
    restrict: "A",
    controller($element) {
      $element.bind("click", () => {
        Auth.logout().then(() => {
          $location.path("login");
        });
      });
    }
  }));

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider.when("/login", {
        template: "<login>"
      });
    })
    .component("login", {
      templateUrl: "login.html",
      controller(Auth, $location, $http) {
        this.reset = () => {
          this.loginInvalido = false;
        };

        this.login = () => {
          this.isLoading = true;
          Auth.login(this.usuario).then(
            () => {
              $location.path("/home");
            },
            () => {
              this.loginInvalido = true;
            }
          );
        };

        this.cadastrar = () => {
          $location.path("/cadastro");
        };
      }
    });

  const m = angular.module("app");

  m.config($httpProvider => {
    $httpProvider.interceptors.push(($q, $location) => ({
      responseError(response) {
        if (response.status === 401) {
          $location.path("login");
        }

        return $q.reject(response);
      }
    }));
  });

  m.service("Auth", AuthService);

  function AuthService($http, $httpParamSerializer) {
    const observers = [];

    const notify = value => {
      observers.forEach(observer => {
        observer(value);
      });
    };

    this.login = credenciais =>
      $http.post("/api/session", credenciais).then(
        ({ data }) => {
          notify(true);

          return data;
        },
        err => {
          notify(false);
          throw err;
        }
      );

    this.logout = () =>
      $http.delete("/api/session").then(({ data }) => {
        notify(false);

        return data;
      });

    this.getSession = () =>
      $http.get("/api/session").then(
        ({ data }) => {
          notify(true);

          return data;
        },
        err => {
          notify(false);
          throw err;
        }
      );

    this.subscribe = observer => {
      observers.push(observer);

      return () => {
        const index = observers.find(observer);

        observers.splice(index, 1);
      };
    };
  }

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider.when("/cadastro", {
        template: "<cadastro>"
      });
    })
    .component("cadastro", {
      templateUrl: "cadastro.html",
      controller($http, $location) {
        this.cadastrar = () => {
          $http
            .post("/api/usuarios", this.usuario)
            .then(usuario => {
              $location.path("/login");
            })
            .catch(err => {
              this.erroCadastro = true;
            });
        };
      }
    });

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider.when("/home", {
        template: "<home>"
      });
    })
    .component("home", {
      templateUrl: "home.html",
      controller() {}
    });

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider
        .when("/perfil", {
          template: "<perfil>"
        })
        .when("/resultados", {
          template: "<resultados>"
        })
        .when("/refeicoes", {
          template: "<refeicoes>"
        });
    })
    .component("navbar", {
      templateUrl: "navbar.html",
      controller($location) {
        this.navegar = componentName => {
          $location.path(componentName);
        };
      }
    });

  angular.module("app").component("loader", {
    templateUrl: "loader.html"
  });

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider.when("/perfil-usuario", {
        template: "<perfil-usuario>"
      });
    })
    .component("perfilUsuario", {
      templateUrl: "perfil-usuario.html",
      controller($http, $httpParamSerializer, Auth) {
        this.$onInit = () => {
          this.modoEdicao = false;
          this.generos = ["Feminino", "Masculino"];

          this.niveis = [
            {
              label: "Sedentário (Nenhum exercício por semana)",
              valor: "Sedentário"
            },
            {
              label:
                "Ligeiramente ativo (Exercícios físicos de 1 a 3 vezes por semana)",
              valor: "Ligeiramente ativo"
            },
            {
              label:
                "Moderadamento ativo (Exercícios físicos de 3 a 5 vezes por semana)",
              valor: "Moderadamento ativo"
            },
            {
              label: "Ativo (Exercícios físicos de 6 a 7 vezes por semana)",
              valor: "Ativo"
            },
            {
              label:
                "Hiperativo (Exercícios físicos muito intensos, 2 horas ou mais )",
              valor: "Hiperativo"
            }
          ];

          this.objetivos = [
            {
              valor: "Perder peso",
              label: "Perder peso (Diminuir os requisitos calóricos em 20%)"
            },
            {
              valor: "Perder peso lentamente",
              label:
                "Perder peso lentamente (Diminuir os requisitos calóricos em 10%)"
            },
            {
              valor: "Manter o peso",
              label: "Manter o peso (Não alterar os requisitos calóricos)"
            },
            {
              valor: "Aumentar o peso lentamente",
              label:
                "Aumentar o peso lentamente (Aumentar os requisitos calóricos em 10%)"
            },
            {
              valor: "Aumentar o peso",
              label: "Aumentar o peso (Aumentar os requisitos calóricos em 20%)"
            }
          ];

          this.carregarPerfil();
        };

        this.carregarPerfil = () => {
          this.isLoading = true;
          $http.get("/api/perfil-usuario").then(({ data }) => {
            this.perfil = data;
            this.isLoading = false;
          });
        };

        this.salvar = () => {
          this.isLoading = true;
          $http.post("/api/perfil-usuario", this.perfil).then(() => {
            this.fecharEdicao();
            this.isLoading = false;
          });
        };

        this.fecharEdicao = () => {
          this.modoEdicao = false;
        };

        this.editar = () => {
          this.modoEdicao = true;
        };
      }
    });

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider.when("/resultados", {
        template: "<resultados>"
      });
    })
    .component("resultados", {
      templateUrl: "resultados.html",
      controller($http) {
        this.$onInit = () => {
          this.query();

          this.descricoes = {
            imc: false,
            taxaMetabolicaBasal: false,
            exigenciaAgua: false,
            gorduraCorporal: false
          };
        };

        this.query = () => {
          this.isLoading = true;
          $http.get("/api/resultados-usuario").then(({ data }) => {
            this.resultados = data;
            console.log(this.resultados);
            this.isLoading = false;
            this.getFaixaIMC();
          });
        };

        this.exibirDescricao = atributo => {
          this.descricoes[atributo] = !this.descricoes[atributo];
        };

        this.getFaixaIMC = () => {
          if (this.resultados.imc <= 17) {
            this.faixaIMC = 0;
          } else if (this.resultados.imc <= 18.49) {
            this.faixaIMC = 1;
          } else if (this.resultados.imc <= 24.99) {
            this.faixaIMC = 2;
          } else if (this.resultados.imc <= 29.99) {
            this.faixaIMC = 3;
          } else if (this.resultados.imc <= 34.99) {
            this.faixaIMC = 4;
          } else if (this.resultados.imc >= 40) {
            this.faixaIMC = 5;
          }
        };

        this.linhasIMC = [
          {
            resultado: "Abaixo de 17",
            situacao: "Muito abaixo do peso"
          },
          {
            resultado: "Entre 17 e 18,49",
            situacao: "Abaixo do peso"
          },
          {
            resultado: "Entre 18,5 e 24,99",
            situacao: "Peso normal"
          },
          {
            resultado: "Entre 25 e 29,99",
            situacao: "Acima do peso"
          },
          {
            resultado: "Entre 30 e 34,99",
            situacao: "Obesidade I"
          },
          {
            resultado: "Entre 35 e 39,99",
            situacao: "Obesidade II (severa)"
          },
          {
            resultado: "Acima de 40",
            situacao: "Obesidade III (mórbida)"
          }
        ];

        this.calcularGorduraCorporal = event => {
          event.preventDefault();
          event.stopPropagation();
          $http
            .post("/api/resultados-usuario/gordura-corporal", this.resultados)
            .then(resultado => {
              this.query();
            });
        };
      }
    });

  angular
    .module("app")
    .config($routeProvider => {
      $routeProvider.when("/refeicoes", {
        template: "<refeicoes>"
      });
    })
    .component("refeicoes", {
      templateUrl: "refeicoes.html",
      controller() {}
    });

  const m$1 = angular.module("app");

  m$1.config($routeProvider => {
    $routeProvider
      .when("/login", {
        template: "<login>"
      })
      .otherwise({
        redirectTo: "login"
      });
  });

}());
