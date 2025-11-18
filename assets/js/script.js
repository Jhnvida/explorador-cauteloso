const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const cores = {
    parede: '#4b5563',
    caminho: '#f3f4f6',
    inicio: '#10b981',
    fim: '#ef4444'
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
        const inicioX = 1;
        const inicioY = 1;

        this.grid[inicioY][inicioX].tipo = 'caminho';
        this.grid[inicioY][inicioX].visitada = true;

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
                    const paredeX = x + direcao.dx;
                    const paredeY = y + direcao.dy;
                    this.grid[paredeY][paredeX].tipo = 'caminho';
                }
            }
        }

        this.grid[1][1].tipo = 'inicio';
        this.grid[this.altura - 2][this.largura - 2].tipo = 'fim';
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