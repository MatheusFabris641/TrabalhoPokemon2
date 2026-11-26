# Pokedex       /       Criador de Times Pokémon

Projeto desenvolvido para montar e organizar times de Pokémon de forma
simples e visual.

## Sobre o projeto

O **Montador de Times Pokémon** permite pesquisar Pokémon, consultar
seus tipos e montar um time com até 6 integrantes. Também é possível
adicionar anotações para cada Pokémon e salvar times para consultar
depois.

Os dados dos Pokémon são obtidos pela [PokéAPI](https://pokeapi.co/).

## Funcionalidades

-   Pesquisar o Pokémon pelo seu nome.
-   Filtrar Pokémon por tipagem.
-   Visualizar imagem e tipos de cada Pokémon.
-   Adicionar Pokémon ao time.
-   Montar um time com até 6 Pokémon.
-   Adicionar anotações individuais aos Pokémon do time.
-   Remover Pokémon do time.
-   Salvar times com um nome.
-   Carregar ou excluir times salvos.
-   Manter o time e os times salvos no navegador usando `localStorage`.
-   Exibir avisos quando ocorre algum erro.

## Tecnologias utilizadas

-   **HTML:** estrutura da página.
-   **CSS:** aparência, cores, organização dos elementos e adaptação
    para telas menores.
-   **JavaScript:** pesquisa, filtros, montagem do time, salvamento e
    interações.
-   **PokéAPI:** API externa usada para buscar informações dos Pokémon.
-   **localStorage:** recurso do navegador usado para guardar os dados
    localmente.

## Como executar o projeto

1.  Baixe ou clone os arquivos do projeto.
2.  Mantenha a organização das pastas e arquivos.
3.  Abra o arquivo `index.html` em um navegador.
4.  Aguarde o carregamento dos dados da PokéAPI.
5.  Pesquise Pokémon e comece a montar seu time.

> É necessário ter conexão com a internet para consultar a PokéAPI.

## Organização dos arquivos

``

-   `index.html`: contém os elementos e as seções da página.
-   `css/pok.css`: define o visual e o layout do projeto.
-   `js/pok.js`: contém a lógica de pesquisa, filtros, montagem e
    salvamento dos times.

## Como funciona o salvamento?

O nosso projeto utiliza o `localStorage` do navegador. Assim, o time atual e
os times salvos ficam guardados no próprio navegador e podem ser
recuperados quando a página for aberta novamente no mesmo navegador.

**Atenção:** os dados não são enviados para uma conta ou banco de dados
online. Eles ficam armazenados localmente no navegador utilizado.

## API que foi utilizada

A [PokéAPI](https://pokeapi.co/) serve para fornecer os dados dos Pokémon
no projeto, como nome, imagem e tipos.

## Membros da Equipe

Projeto desenvolvido pelo [Grupo09].
Nome dos membros: Bruno Toshihiko Mori, Matheus Garcia Fabris, Pedro Henrique de Lima Franco, Pedro Henrique Gomes da Silva Ribeiro.
Matéria de *Programação para Web 2* do curso de Ciências da Computação da **FIB BAURU**.


