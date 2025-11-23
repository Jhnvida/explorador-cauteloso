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
    vida: '#22c55e'
};

const tamanho_celula = 10;
const largura_grid = 75;
const altura_grid = 45;

canvas.width = largura_grid * tamanho_celula;
canvas.height = altura_grid * tamanho_celula;

class Jogador {
    constructor(vida_inicial = 100) {
        this.vida_maxima = vida_inicial;
        this.vida_atual = vida_inicial;
        this.fase_atual = 1;
        this.vivo = true;

        this.atualizarInterface();
    }

    atualizarInterface() {
        document.getElementById('fase').textContent = this.fase_atual;
        document.getElementById('vida').textContent = this.vida_atual;
    }

    processarCelula(celula) {
        if (!this.vivo) return false;

        if (celula.tipo == 'monstro') this.receberDano(10);
        if (celula.tipo == 'vida') this.curar(15);

        return this.vivo;
    }

    receberDano(quantidade) {
        this.vida_atual -= quantidade;

        if (this.vida_atual <= 0) {
            this.vida_atual = 0;
            this.vivo = false;
        }

        this.atualizarInterface();
    }

    curar(quantidade) {
        this.vida_atual += quantidade;

        if (this.vida_atual > this.vida_maxima) {
            this.vida_atual = this.vida_maxima;
        }

        this.atualizarInterface();
    }

    proximaFase() {
        if (!this.vivo) return false;

        this.fase_atual++;
        this.atualizarInterface();
        return true;
    }

    estaVivo() {
        return this.vivo;
    }

    resetar() {
        this.vida_atual = this.vida_maxima;
        this.fase_atual = 1;
        this.vivo = true;
        this.atualizarInterface();
    }

    pegarVida() {
        return this.vida_atual;
    }

    pegarFase() {
        return this.fase_atual;
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
        context.fillRect(this.x * tamanho_celula, this.y * tamanho_celula, tamanho_celula, tamanho_celula);
    }
}

class Labirinto {
    constructor(largura, altura) {
        this.largura = largura;
        this.altura = altura;
        this.grid = [];
        this.fronteiras = [];

        this.criarGrid();
    }

    criarGrid() {
        this.grid = [];
        this.fronteiras = [];

        for (let y = 0; y < this.altura; y++) {
            const linha = [];

            for (let x = 0; x < this.largura; x++) {
                const celula = new Celula(x, y);
                linha.push(celula);
            }

            this.grid.push(linha);
        }

        this.gerarDFS();
    }

    gerarDFS() {
        const pilha = [];
        const inicio_x = 1;
        const inicio_y = 1;

        this.grid[inicio_y][inicio_x].tipo = 'caminho';
        this.grid[inicio_y][inicio_x].visitada = true;
        pilha.push(this.grid[inicio_y][inicio_x]);

        while (pilha.length > 0) {
            const atual = pilha[pilha.length - 1];
            const x = atual.x;
            const y = atual.y;

            const vizinhos = [];

            const direcoes = [
                { dx: 0, dy: -2 },
                { dx: 0, dy: 2 },
                { dx: -2, dy: 0 },
                { dx: 2, dy: 0 }
            ];

            for (const dir of direcoes) {
                const viz_x = x + dir.dx;
                const viz_y = y + dir.dy;

                if (viz_x > 0 && viz_x < this.largura - 1 && viz_y > 0 && viz_y < this.altura - 1) {
                    const vizinho = this.grid[viz_y][viz_x];

                    if (!vizinho.visitada) {
                        vizinhos.push({ vizinho: vizinho, parede_x: x + dir.dx / 2, parede_y: y + dir.dy / 2 });
                    }
                }
            }

            if (vizinhos.length > 0) {
                const { vizinho, parede_x, parede_y } = vizinhos[Math.floor(Math.random() * vizinhos.length)];

                this.grid[parede_y][parede_x].tipo = 'caminho';

                vizinho.visitada = true;
                vizinho.tipo = 'caminho';

                pilha.push(vizinho);
            } else {
                pilha.pop();
            }
        }

        this.grid[1][1].tipo = 'inicio';
        this.grid[this.altura - 2][this.largura - 2].tipo = 'fim';

        this.criarElementos();
    }

    criarElementos() {
        const celulas_vazias = [];

        for (let y = 0; y < this.altura; y++) {
            for (let x = 0; x < this.largura; x++) {
                const celula = this.grid[y][x];

                if (celula.tipo === 'caminho') {
                    celulas_vazias.push(celula);
                }
            }
        }

        const porcentagem_monstros = 0.02;
        const porcentagem_vidas = 0.01;

        for (let i = celulas_vazias.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [celulas_vazias[i], celulas_vazias[j]] = [celulas_vazias[j], celulas_vazias[i]];
        }

        const quantidade_monstros = Math.floor(celulas_vazias.length * porcentagem_monstros);
        for (let i = 0; i < quantidade_monstros; i++) {
            celulas_vazias[i].tipo = 'monstro';
        }

        const quantidade_vidas = Math.floor(celulas_vazias.length * porcentagem_vidas);
        for (let i = quantidade_monstros; i < quantidade_monstros + quantidade_vidas; i++) {
            celulas_vazias[i].tipo = 'vida';
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
    const visitado = new Set();
    const caminho = [];

    function dfs(x, y) {
        const chave = `${x},${y}`;
        if (visitado.has(chave)) return false;
        visitado.add(chave);

        const celula = labirinto.grid[y][x];
        if (celula.tipo === 'parede') return false;

        caminho.push(celula);

        if (x === fim.x && y === fim.y) return true;

        const direcoes = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ];

        for (const d of direcoes) {
            const nx = x + d.dx;
            const ny = y + d.dy;

            if (nx >= 0 && nx < labirinto.largura && ny >= 0 && ny < labirinto.altura) {
                if (dfs(nx, ny)) return true;
            }
        }

        caminho.pop();
        return false;
    }

    return dfs(inicio.x, inicio.y) ? caminho : null;
}

function animarCaminho(caminho, i = 0) {
    if (i >= caminho.length) return;

    const cel = caminho[i];

    labirinto.desenhar();
    context.fillStyle = "#3b82f6";
    context.fillRect(
        cel.x * tamanho_celula,
        cel.y * tamanho_celula,
        tamanho_celula,
        tamanho_celula
    );

    setTimeout(() => animarCaminho(caminho, i + 1), 40);
}

const labirinto = new Labirinto(largura_grid, altura_grid);
const jogador = new Jogador(100);

labirinto.desenhar();

botao_iniciar.addEventListener("click", () => {
    const inicio = { x: 1, y: 1 };
    const fim = { x: labirinto.largura - 2, y: labirinto.altura - 2 };
    const caminho = buscarCaminho(labirinto, inicio, fim);

    if (!caminho) {
        alert("Nenhum caminho encontrado!");
        return;
    }

    animarCaminho(caminho);
});