// =====================================================
// MAPA DO CÓDIGO
//  1. Configurações e variáveis
//  2. Utilitários (capitalizar e escapar)
//  3. API: buscar Pokémon na PokéAPI
//  4. Pesquisa e filtro por tipo
//  5. Seu time (até 6 Pokémon, com anotação)
//  6. Times salvos (barra lateral: salvar, carregar, excluir)
//  7. Aviso de erro
//  8. Eventos (cliques e teclas)
//  9. Início da página
// =====================================================


// ---------- 1. CONFIGURAÇÕES E VARIÁVEIS ----------

const API = "https://pokeapi.co/api/v2";
const MAX_RESULTADOS = 12;   // quantos Pokémon aparecem em cada pesquisa
const MAX_TIME = 6;          // tamanho máximo do time
const IMG_PADRAO = "https://placehold.co/160x160";   // imagem dos espaços vazios

// Pesquisa
const inputBusca = document.getElementById("busca");
const btnPesquisar = document.getElementById("btn-pesquisar");
const btnFiltro = document.getElementById("btn-filtro");
const painelFiltro = document.getElementById("painel-filtro");
const selectTipo = document.getElementById("filtro-tipo");
const divResultados = document.getElementById("resultados");

// Time
const divTime = document.getElementById("time");
const spanContador = document.getElementById("contador");
const btnSalvarTime = document.getElementById("btn-salvar-time");

// Barra lateral de times salvos
const btnTimes = document.getElementById("btn-times");
const barraTimes = document.getElementById("barra-times");
const fundoBarra = document.getElementById("fundo-barra");
const btnFecharBarra = document.getElementById("btn-fechar-barra");
const listaTimes = document.getElementById("lista-times");

// Aviso para dar nome ao time
const modalSalvar = document.getElementById("modal-salvar");
const inputNomeTime = document.getElementById("nome-time");
const erroModal = document.getElementById("erro-modal");
const btnCancelarModal = document.getElementById("btn-cancelar-modal");
const btnConfirmarSalvar = document.getElementById("btn-confirmar-salvar");

// Aviso de erro
const avisoErro = document.getElementById("aviso-erro");
const avisoErroTitulo = document.getElementById("aviso-erro-titulo");
const avisoErroDetalhe = document.getElementById("aviso-erro-detalhe");
const btnFecharErro = document.getElementById("btn-fechar-erro");

// Dados da página (o time e os times salvos ficam guardados no localStorage)
let todosNomes = [];       // nomes de todos os Pokémon da API
let pokemonsNaTela = [];   // Pokémon que estão aparecendo nos resultados
let time = JSON.parse(localStorage.getItem("time")) || [];
let timesSalvos = JSON.parse(localStorage.getItem("timesSalvos")) || [];


// ---------- 2. UTILITÁRIOS ----------

// "mr-mime" vira "Mr Mime"
function capitalizar(nome) {
  return nome
    .split("-")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// Troca símbolos especiais (aspas, < e >) para que um texto digitado
// não quebre o HTML quando é colocado dentro de um template
function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ---------- 3. API ----------

// Pega o nome de todos os Pokémon (uma vez, quando a página abre)
async function carregarNomes() {
  const res = await fetch(`${API}/pokemon?limit=2000`);
  const data = await res.json();
  todosNomes = data.results.map(p => p.name);
}

// Pega só os nomes dos Pokémon de um tipo (ex.: "fire")
async function nomesPorTipo(tipo) {
  const res = await fetch(`${API}/type/${tipo}`);
  const data = await res.json();
  return data.pokemon.map(p => p.pokemon.name);
}

// Pega os dados de um Pokémon e devolve só o que o site usa
async function buscarPokemon(nome) {
  const res = await fetch(`${API}/pokemon/${nome}`);
  if (!res.ok) return null;
  const d = await res.json();

  return {
    id: d.id,
    nome: d.name,
    imagem:
      d.sprites.other?.["official-artwork"]?.front_default ||
      d.sprites.front_default ||
      IMG_PADRAO,
    tipos: d.types.map(t => t.type.name),
  };
}


// ---------- 4. PESQUISA E FILTRO ----------

async function pesquisar() {
  const texto = inputBusca.value.trim().toLowerCase().replace(/\s+/g, "-");
  const tipo = selectTipo.value;

  divResultados.innerHTML = '<p class="mensagem">Carregando...</p>';

  try {
    // ERRO PROPOSITAL (simulado): pesquisar "erro" finge que a API caiu (erro 503)
    if (texto === "erro") {
      await new Promise(r => setTimeout(r, 800));
      throw new Error("503");
    }

    // 1) pega os nomes (todos, ou só do tipo escolhido)
    let lista = tipo ? await nomesPorTipo(tipo) : todosNomes;

    // 2) filtra pelo texto digitado e limita a quantidade
    if (texto) lista = lista.filter(nome => nome.includes(texto));
    lista = lista.slice(0, MAX_RESULTADOS);

    if (lista.length === 0) {
      divResultados.innerHTML = '<p class="mensagem">Nenhum Pokémon encontrado.</p>';
      return;
    }

    // 3) busca os dados de cada Pokémon ao mesmo tempo e mostra na tela
    const pokemons = await Promise.all(lista.map(buscarPokemon));
    pokemonsNaTela = pokemons.filter(Boolean);
    renderResultados();
  } catch (erro) {
    console.error(erro);
    divResultados.innerHTML = '<p class="mensagem">Erro ao buscar. Tente novamente.</p>';
    mostrarAviso(
      "Erro ao buscar Pokémon",
      erro.message === "503"
        ? "A PokéAPI não respondeu (erro 503 simulado). Tente novamente em instantes."
        : "Não foi possível falar com a PokéAPI. Verifique sua internet."
    );
  }
}

// Cria um card para cada Pokémon da pesquisa
function renderResultados() {
  divResultados.innerHTML = pokemonsNaTela.map(p => `
    <div class="quadrado">
      <p class="nome">${escapar(capitalizar(p.nome))}</p>
      <img class="foto" src="${p.imagem}" alt="${escapar(p.nome)}">
      <span class="tipos">${escapar(p.tipos.join(" / "))}</span>
      <button class="botao botao-add" data-id="${p.id}">Adicionar ao time</button>
    </div>
  `).join("");
}


// ---------- 5. SEU TIME ----------

// Guarda o time no navegador (continua depois de recarregar a página)
function guardarTime() {
  localStorage.setItem("time", JSON.stringify(time));
}

// Desenha os 6 espaços do time: card do Pokémon ou espaço vazio
function renderTime() {
  let html = "";

  for (let i = 0; i < MAX_TIME; i++) {
    const p = time[i];

    if (p) {
      html += `
        <div class="quadrado">
          <p class="nome">${escapar(capitalizar(p.nome))}</p>
          <img class="foto" src="${p.imagem}" alt="${escapar(p.nome)}">
          <input type="text" class="caixa-texto" placeholder="Escreva aqui..."
                 value="${escapar(p.nota || "")}">
          <div class="botoes">
            <button class="botao botao-add" data-acao="salvar-nota" data-id="${p.id}">Adicionar</button>
            <button class="botao botao-remover" data-acao="limpar-nota" data-id="${p.id}">Remover</button>
          </div>
          <button class="botao botao-remover" data-acao="remover-time" data-id="${p.id}">Remover do Time</button>
        </div>`;
    } else {
      html += `
        <div class="quadrado vazio">
          <p class="nome">Vazio</p>
          <img class="foto" src="${IMG_PADRAO}" alt="Espaço vazio">
        </div>`;
    }
  }

  divTime.innerHTML = html;
  spanContador.textContent = time.length;
  guardarTime();
}

// Botão "Adicionar ao time" de um card da pesquisa
function adicionarAoTime(id) {
  if (time.length >= MAX_TIME) return alert("Seu time já tem 6 Pokémons!");
  if (time.some(p => p.id === id)) return alert("Esse Pokémon já está no time.");

  const poke = pokemonsNaTela.find(p => p.id === id);
  time.push({ ...poke });
  renderTime();
}


// ---------- 6. TIMES SALVOS (barra lateral) ----------

function guardarTimesSalvos() {
  localStorage.setItem("timesSalvos", JSON.stringify(timesSalvos));
}

// Desenha a lista de times salvos na barra lateral
function renderTimesSalvos() {
  if (timesSalvos.length === 0) {
    listaTimes.innerHTML = '<p class="mensagem">Nenhum time salvo ainda.</p>';
    return;
  }

  listaTimes.innerHTML = timesSalvos.map(t => `
    <div class="item-time">
      <div class="item-time-info">
        <strong class="item-time-nome">${escapar(t.nome)}</strong>
        <span class="item-time-pokes">${escapar(t.pokemons.map(p => capitalizar(p.nome)).join(", "))}</span>
      </div>
      <div class="item-time-acoes">
        <button class="botao botao-add botao-mini" data-acao="carregar" data-id="${t.id}">Carregar</button>
        <button class="botao botao-remover botao-mini" data-acao="excluir" data-id="${t.id}">Excluir</button>
      </div>
    </div>
  `).join("");
}

// Abrir e fechar a barra lateral (a classe "aberta" faz ela deslizar para a tela)
function abrirBarra() {
  barraTimes.classList.add("aberta");
  fundoBarra.classList.remove("oculto");
}

function fecharBarra() {
  barraTimes.classList.remove("aberta");
  fundoBarra.classList.add("oculto");
}

// Abrir e fechar o aviso onde se digita o nome do time
function abrirModal() {
  if (time.length === 0) {
    mostrarAviso("Time vazio", "Adicione pelo menos um Pokémon ao time antes de salvar.");
    return;
  }
  erroModal.textContent = "";
  inputNomeTime.value = "";
  modalSalvar.classList.remove("oculto");
  inputNomeTime.focus();
}

function fecharModal() {
  modalSalvar.classList.add("oculto");
}

// Botão "Salvar" do aviso: valida o nome e guarda uma cópia do time atual
function confirmarSalvarTime() {
  const nome = inputNomeTime.value.trim();

  if (!nome) {
    erroModal.textContent = "Digite um nome para o time.";
    return;
  }
  if (timesSalvos.some(t => t.nome.toLowerCase() === nome.toLowerCase())) {
    erroModal.textContent = "Já existe um time com esse nome.";
    return;
  }

  timesSalvos.push({ id: Date.now(), nome, pokemons: time.map(p => ({ ...p })) });
  guardarTimesSalvos();
  renderTimesSalvos();
  fecharModal();

  btnSalvarTime.textContent = "Salvo!";
  setTimeout(() => { btnSalvarTime.textContent = "Salvar time"; }, 1000);
}

// Botão "Carregar": o time salvo vira o time atual
function carregarTimeSalvo(id) {
  const salvo = timesSalvos.find(t => t.id === id);

  time = salvo.pokemons.map(p => ({ ...p }));
  renderTime();
  fecharBarra();
}

// Botão "Excluir": tira o time da lista
function excluirTimeSalvo(id) {
  timesSalvos = timesSalvos.filter(t => t.id !== id);
  guardarTimesSalvos();
  renderTimesSalvos();
}


// ---------- 7. AVISO DE ERRO ----------

// Mostra a faixa vermelha no topo e some sozinha depois de 6 segundos
function mostrarAviso(titulo, detalhe) {
  avisoErroTitulo.textContent = titulo;
  avisoErroDetalhe.textContent = detalhe;
  avisoErro.classList.remove("oculto");
  setTimeout(fecharAviso, 6000);
}

function fecharAviso() {
  avisoErro.classList.add("oculto");
}


// ---------- 8. EVENTOS ----------
// Os cards são criados pelo JavaScript, então um único "ouvinte" fica na
// lista inteira e descobre qual botão foi clicado com e.target.closest().

// Pesquisa
btnPesquisar.addEventListener("click", pesquisar);

inputBusca.addEventListener("keydown", e => {
  if (e.key === "Enter") pesquisar();
});

btnFiltro.addEventListener("click", () => {
  painelFiltro.classList.toggle("oculto");
});

selectTipo.addEventListener("change", pesquisar);

// Botão "Adicionar ao time" (cards da pesquisa)
divResultados.addEventListener("click", e => {
  const btn = e.target.closest(".botao-add");
  if (!btn) return;
  adicionarAoTime(Number(btn.dataset.id));
});

// Botões dentro dos cards do time
divTime.addEventListener("click", e => {
  const btn = e.target.closest("button[data-acao]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const poke = time.find(p => p.id === id);
  const acao = btn.dataset.acao;

  if (acao === "salvar-nota") {
    const campo = btn.closest(".quadrado").querySelector(".caixa-texto");
    poke.nota = campo.value.trim();
    guardarTime();
    btn.textContent = "Salvo!";
    setTimeout(() => { btn.textContent = "Adicionar"; }, 1000);
  } else if (acao === "limpar-nota") {
    delete poke.nota;
    renderTime();
  } else if (acao === "remover-time") {
    time = time.filter(p => p.id !== id);
    renderTime();
  }
});

// Barra lateral de times salvos
btnTimes.addEventListener("click", abrirBarra);
btnFecharBarra.addEventListener("click", fecharBarra);
fundoBarra.addEventListener("click", fecharBarra);

listaTimes.addEventListener("click", e => {
  const btn = e.target.closest("button[data-acao]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  if (btn.dataset.acao === "carregar") carregarTimeSalvo(id);
  if (btn.dataset.acao === "excluir") excluirTimeSalvo(id);
});

// Aviso para salvar o time
btnSalvarTime.addEventListener("click", abrirModal);
btnCancelarModal.addEventListener("click", fecharModal);
btnConfirmarSalvar.addEventListener("click", confirmarSalvarTime);

inputNomeTime.addEventListener("keydown", e => {
  if (e.key === "Enter") confirmarSalvarTime();
});

// Aviso de erro
btnFecharErro.addEventListener("click", fecharAviso);


// ---------- 9. INÍCIO DA PÁGINA ----------

(async function iniciar() {
  renderTime();          // desenha o time guardado
  renderTimesSalvos();   // desenha os times salvos da barra lateral

  try {
    await carregarNomes();
  } catch (erro) {
    console.error(erro);
    divResultados.innerHTML = '<p class="mensagem">Não foi possível carregar a PokéAPI.</p>';
    return;
  }

  pesquisar();           // mostra os primeiros Pokémon
})();
