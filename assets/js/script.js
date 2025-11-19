const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

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

        this.gerarArvoreBinaria();
    }

    gerarArvoreBinaria() {
        const inicio_x = 1;
        const inicio_y = 1;

        this.grid[inicio_y][inicio_x].tipo = 'caminho';
        this.grid[inicio_y][inicio_x].visitada = true;

        for (let y = 1; y < this.altura; y += 2) {
            for (let x = 1; x < this.largura; x += 2) {
                this.grid[y][x].tipo = 'caminho';

                const direcoes = [];

                if (y > 1) {
                    direcoes.push({ dx: 0, dy: -1 });
                }

                if (x > 1) {
                    direcoes.push({ dx: -1, dy: 0 });
                }

                if (direcoes.length > 0) {
                    const direcao = direcoes[Math.floor(Math.random() * direcoes.length)];
                    const parede_x = x + direcao.dx;
                    const parede_y = y + direcao.dy;

                    this.grid[parede_y][parede_x].tipo = 'caminho';
                }
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

        const porcentagem_monstros = 0.01;
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

const labirinto = new Labirinto(largura_grid, altura_grid);
labirinto.desenhar();