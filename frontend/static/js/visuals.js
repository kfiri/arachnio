const TILE_SIZE = 48;

class BoardView {
    constructor(cols, rows) {
        this.playerSvgs = {};
        this.bonusSvgs = {};
        this.nametagSvgs = {};
        this.svg = SVG('board').size(TILE_SIZE * cols, TILE_SIZE * rows);
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                let tile = this.svg.rect(TILE_SIZE, TILE_SIZE).move(x * TILE_SIZE, y * TILE_SIZE)
                    .attr({
                        stroke: '#ddd',
                        fill: 'transparent'
                    });
            }
        }
    }

    addPlayer(player) {
        this.playerSvgs[player.id] = this.svg.circle(0)
            .attr({
                cx: player.x * TILE_SIZE + TILE_SIZE / 2,
                cy: player.y * TILE_SIZE + TILE_SIZE / 2,
                fill: '#' + player.id.slice(0, 3)
            })
            .animate(150, '<>')
            .attr({
                r: player.size
            })
            .animate(1000, '<>')
            .dy(-4)
            .loop(undefined, true);
        this.nametagSvgs[player.id] = this.svg.text(player.name || 'Deuce')
            .move(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2 + 20)
            .font({
                anchor: 'middle',
                family: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
                fill: '#222',
                stroke: '#eee',
                weight: 900
            });
    }

    updatePlayer(player, countOnTile, indexOnTile) {
        let xOffset = countOnTile * 9 - 9;
        this.playerSvgs[player.id]
            .stop(false, true)
            .animate(150, '<>')
            .attr({
                cx: player.x * TILE_SIZE + TILE_SIZE / 2 + xOffset,
                cy: player.y * TILE_SIZE + TILE_SIZE / 2,
                r: player.size,
                dy: 0
            })
            .rotate(360 / countOnTile * indexOnTile, player.x * TILE_SIZE + TILE_SIZE / 2,
                    player.y * TILE_SIZE + TILE_SIZE / 2)
            .animate(1000, '<>')
            .dy(-4)
            .loop(undefined, true);
        this.nametagSvgs[player.id]
            .stop(false, true)
            .animate(100, '-')
            .move(player.x * TILE_SIZE + TILE_SIZE / 2 + xOffset, player.y * TILE_SIZE + TILE_SIZE / 2);
    }

    deletePlayer(player) {
        let playerSvg = this.playerSvgs[player.id];
        playerSvg
            .stop(false, true)
            .animate(800, '<')
            .attr({
                r: 0
            })
            .after(() => {
                playerSvg._target.remove();
            });
        this.nametagSvgs[player.id].remove();
    }

    placeBonus(x, y, circleCount) {
        let bonus = this.svg.group();
        let c1 = this.svg.circle(4)
            .center(x * TILE_SIZE + TILE_SIZE / 2 + circleCount, y * TILE_SIZE + TILE_SIZE / 2)
            .fill('#2ab')
            .addTo(bonus);
        for (let i = 1; i < circleCount; i++) {
            c1.clone()
                .rotate(360 / circleCount * i, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2)
                .addTo(bonus);
        }
        bonus.animate(5000 + Math.random() * 5000, '-')
            .rotate(360, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2)
            .loop();
        this.bonusSvgs[x + ',' + y] = bonus;
    }

    deleteBonus(x, y) {
        let bonus = this.bonusSvgs[x + ',' + y];
        console.log(bonus)
        bonus.stop(false, true)
            .animate(300, '>')
            .scale(1.25)
            .animate(900, '<')
            .scale(0)
            .opacity(0)
            .after(() => {
                bonus.remove();
            })
    }
}
