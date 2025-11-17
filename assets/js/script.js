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