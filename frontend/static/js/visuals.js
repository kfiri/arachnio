const COLS = 8;
const ROWS = 8;
const TILE_SIZE = 48;

let playerSvgs = {};

let draw = SVG('board').size(TILE_SIZE * COLS, TILE_SIZE * ROWS);

let tiles = [];
for (let x = 0; x < COLS; x++) {
    let row = [];
    for (let y = 0; y < ROWS; y++) {
        let tile = draw.rect(TILE_SIZE, TILE_SIZE).move(x * TILE_SIZE, y * TILE_SIZE)
            .attr({
                stroke: '#ddd',
                fill: 'transparent'
            });
        row.push(tile);
    }
    tiles.push(row);
}

function addPlayer(player) {
    playerSvgs[player.id] = draw.circle(32)
        .attr({
            cx: player.xPosition * TILE_SIZE + TILE_SIZE / 2,
            cy: player.yPosition * TILE_SIZE + TILE_SIZE / 2
        });
}

function updatePlayer(player) {
    playerSvgs[player.id].animate(600, '<>')
        .attr({
            cx: player.xPosition * TILE_SIZE + TILE_SIZE / 2,
            cy: player.yPosition * TILE_SIZE + TILE_SIZE / 2
        });
}

function deletePlayer(player) {
    playerSvgs[player.id].remove();
}
