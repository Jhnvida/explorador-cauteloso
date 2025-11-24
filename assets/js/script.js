const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const elemento_fase = document.getElementById('fase');
const elemento_vida = document.getElementById('vida');
const botao_iniciar = document.getElementById('iniciar');
const botao_resetar = document.getElementById('resetar');

const cores = {
    parede: '#4b5563',
    caminho: '#f3f4f6',
    inicio: '#10b981',
    fim: '#ef4444',
    monstro: '#b91c1c',
    vida: '#22c55e',
    rastro: '#3b82f6'
};

const tamanho_celula = 10;
const largura_grid = 75;
const altura_grid = 45;

canvas.width = largura_grid * tamanho_celula;
canvas.height = altura_grid * tamanho_celula;

class Jogador {
    constructor(vida_inicial) {
        this.vida_maxima = vida_inicial;
        this.vida_atual = vida_inicial;
        this.fase_atual = 1;
        this.vivo = true;
        this.atualizarInterface();
    }

    atualizarInterface() {
        elemento_fase.textContent = this.fase_atual;
        elemento_vida.textContent = this.vida_atual;
    }

    interagir(celula) {
        if (!this.vivo) return;

        if (celula.tipo === 'monstro') {
            this.vida_atual -= 15;
        } else if (celula.tipo === 'vida') {
            this.vida_atual += 10;
            if (this.vida_atual > this.vida_maxima) {
                this.vida_atual = this.vida_maxima;
            }
        }

        if (this.vida_atual <= 0) {
            this.vida_atual = 0;
            this.vivo = false;
        }

        this.atualizarInterface();
    }

    subirFase() {
        this.fase_atual++;
        this.atualizarInterface();
    }

    resetar() {
        this.vida_atual = this.vida_maxima;
        this.fase_atual = 1;
        this.vivo = true;
        this.atualizarInterface();
    }
}

class Celula {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tipo = 'parede';
        this.visitada = false;
    }

    desenhar() {
        context.fillStyle = cores[this.tipo];
        context.fillRect(
            this.x * tamanho_celula,
            this.y * tamanho_celula,
            tamanho_celula,
            tamanho_celula
        );
    }
}

class Labirinto {
    constructor(largura, altura) {
        this.largura = largura;
        this.altura = altura;
        this.grid = [];
        this.criarGrid();
    }

    criarGrid() {
        this.grid = [];

        for (let y = 0; y < this.altura; y++) {
            let linha = [];

            for (let x = 0; x < this.largura; x++) {
                linha.push(new Celula(x, y));
            }

            this.grid.push(linha);
        }

        this.gerarDFS();
    }

    gerarDFS() {
        let pilha = [];
        let inicio_x = 1;
        let inicio_y = 1;

        this.grid[inicio_y][inicio_x].tipo = 'caminho';
        this.grid[inicio_y][inicio_x].visitada = true;
        pilha.push(this.grid[inicio_y][inicio_x]);

        while (pilha.length > 0) {
            let atual = pilha[pilha.length - 1];
            let vizinhos = [];

            let direcoes = [
                { dx: 0, dy: -2 },
                { dx: 0, dy: 2 },
                { dx: -2, dy: 0 },
                { dx: 2, dy: 0 }
            ];

            for (let i = 0; i < direcoes.length; i++) {
                let dir = direcoes[i];
                let viz_x = atual.x + dir.dx;
                let viz_y = atual.y + dir.dy;

                if (viz_x > 0 && viz_x < this.largura - 1 &&
                    viz_y > 0 && viz_y < this.altura - 1) {

                    let vizinho = this.grid[viz_y][viz_x];

                    if (!vizinho.visitada) {
                        vizinhos.push({
                            vizinho: vizinho,
                            parede_x: atual.x + dir.dx / 2,
                            parede_y: atual.y + dir.dy / 2
                        });
                    }
                }
            }

            if (vizinhos.length > 0) {
                let indice = Math.floor(Math.random() * vizinhos.length);
                let escolhido = vizinhos[indice];

                this.grid[escolhido.parede_y][escolhido.parede_x].tipo = 'caminho';
                escolhido.vizinho.visitada = true;
                escolhido.vizinho.tipo = 'caminho';
                pilha.push(escolhido.vizinho);
            } else {
                pilha.pop();
            }
        }

        this.grid[1][1].tipo = 'inicio';
        this.grid[this.altura - 2][this.largura - 2].tipo = 'fim';

        this.criarElementos();
    }

    criarElementos() {
        let vazias = [];

        for (let y = 0; y < this.altura; y++) {
            for (let x = 0; x < this.largura; x++) {
                if (this.grid[y][x].tipo === 'caminho') {
                    vazias.push(this.grid[y][x]);
                }
            }
        }

        for (let i = vazias.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = vazias[i];

            vazias[i] = vazias[j];
            vazias[j] = temp;
        }

        let quantidade_monstros = Math.floor(vazias.length * 0.01);
        let quantidade_vidas = Math.floor(vazias.length * 0.01);

        for (let i = 0; i < quantidade_monstros; i++) {
            vazias[i].tipo = 'monstro';
        }

        for (let i = quantidade_monstros; i < quantidade_monstros + quantidade_vidas; i++) {
            vazias[i].tipo = 'vida';
        }
    }

    desenhar() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < this.altura; y++) {
            for (let x = 0; x < this.largura; x++) {
                this.grid[y][x].desenhar();
            }
        }
    }
}

function buscarCaminho(labirinto, inicio, fim) {
    let visitado = [];

    for (let y = 0; y < altura_grid; y++) {
        let linha = [];

        for (let x = 0; x < largura_grid; x++) {
            linha.push(false);
        }

        visitado.push(linha);
    }

    let caminho = [];

    function procurar(x, y) {
        if (visitado[y][x]) return false;
        visitado[y][x] = true;

        let celula = labirinto.grid[y][x];
        if (celula.tipo === 'parede') return false;

        caminho.push(celula);

        if (x === fim.x && y === fim.y) return true;

        let direcoes = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ];

        for (let i = direcoes.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = direcoes[i];

            direcoes[i] = direcoes[j];
            direcoes[j] = temp;
        }

        for (let i = 0; i < direcoes.length; i++) {
            let d = direcoes[i];
            if (procurar(x + d.dx, y + d.dy)) return true;
        }

        caminho.pop();
        return false;
    }

    if (procurar(inicio.x, inicio.y)) {
        return caminho;
    }

    return null;
}

let animacao_id = null;

function animarCaminho(caminho, i) {
    if (i >= caminho.length) {
        jogador.subirFase();
        labirinto = new Labirinto(largura_grid, altura_grid);
        labirinto.desenhar();
        botao_iniciar.disabled = false;
        botao_iniciar.textContent = "Iniciar";

        return;
    }

    let celula = caminho[i];
    jogador.interagir(celula);

    if (!jogador.vivo) {
        context.fillStyle = cores.rastro;
        context.fillRect(
            celula.x * tamanho_celula,
            celula.y * tamanho_celula,
            tamanho_celula,
            tamanho_celula
        );

        jogador.resetar();
        labirinto = new Labirinto(largura_grid, altura_grid);
        labirinto.desenhar();
        botao_iniciar.disabled = false;
        botao_iniciar.textContent = "Iniciar";

        return;
    }

    context.fillStyle = cores.rastro;
    context.fillRect(
        celula.x * tamanho_celula,
        celula.y * tamanho_celula,
        tamanho_celula,
        tamanho_celula
    );

    animacao_id = setTimeout(function () {
        animarCaminho(caminho, i + 1);
    }, 25);
}

let labirinto = new Labirinto(largura_grid, altura_grid);
let jogador = new Jogador(100);
labirinto.desenhar();

botao_iniciar.addEventListener("click", function () {
    let inicio = { x: 1, y: 1 };
    let fim = { x: labirinto.largura - 2, y: labirinto.altura - 2 };
    let caminho = buscarCaminho(labirinto, inicio, fim);

    if (!caminho) {
        labirinto = new Labirinto(largura_grid, altura_grid);
        labirinto.desenhar();
        return;
    }

    botao_iniciar.disabled = true;
    botao_iniciar.textContent = "Explorando...";

    labirinto.desenhar();
    animarCaminho(caminho, 0);
});

botao_resetar.addEventListener("click", function () {
    clearTimeout(animacao_id);

    jogador.resetar();
    labirinto = new Labirinto(largura_grid, altura_grid);
    labirinto.desenhar();

    botao_iniciar.disabled = false;
    botao_iniciar.textContent = "Iniciar";
});