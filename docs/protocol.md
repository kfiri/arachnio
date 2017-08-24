## Abstract
While a player participates in the game, the server needs to feed the player with information about the current state of the game world. In the meantime, the player should notify the server about their next move.

## General message structure
All messages are composed with JSON, where there are basic two fields required:
* type field: Message type name, should be string. This field should distinguish messages with different handlers.
* data field: Message data. This is where the message passes its data. Structure of the data is up to the message type to define

## Server to Client messages
### Welcome message
This message will feed the player client with general parameters and information about the game world.

#### type name: welcome
#### Message fields:
* General players state - This message contains information about world and players that participate in the game. This information consists of:
  * board_width: int, game board width
  * board_height: int, game board height
  * is_cyclic: bool, sets player abillity to move through board walls to the other side

### Update message
This message contains information about current game state. Such message should be sent repeatedly to players to help them to make decisions ingame.

#### type name: info
#### message fields:
* players_info: array of objects which represent a single player, and contain the following fields:
  * id: player id
  * name: player name
  * x: x location
  * y: y location
  * score: player score
