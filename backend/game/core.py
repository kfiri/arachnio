import json
from random import randint

from .player import Player
from .. import config

class Game(object):
    """
    Core game singleton. Holds game data and dispatches it to clients
    """
    __instance = None

    def __new__(cls, *args, **kwargs):
        if cls.__instance == None:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    def __init__(self, width=config.WIDTH, height=config.HEIGHT,
        is_cyclic=config.IS_CYCLIC):
        self.width = width
        self.height = height
        self.socket_to_player = dict()
        self.is_cyclic = is_cyclic
    
    def create_new_player(self, websocket, name="Deuce"):
        return Player(websocket=websocket, x=randint(0, self.width),
            y=randint(0, self.height), name=name)
    
    def send_welcome(self, player_socket):
        player_socket.write_message(json.loads({
            'type': 'welcome',
            'data': {
                'width': self.width,
                'height': self.height,
                'is_cyclic': self.is_cyclic
            }
        }))
    
    def send_update(self):
        game_state = {
            'players': 
                {player.id: player.prepare_json() for player in self.socket_to_player.values()}
        }

        for player_socket in self.socket_to_player.keys():
            player_socket.write_message(json.loads({
                'type': 'info',
                'data': game_state
            }))

    def send_knockack(self, player_socket):
        player_socket.write_message(json.loads({
            'type': 'knockack',
            'data': self.socket_to_player[player_socket].prepare_json()
        }))
    
    def game_iteration(self):
        """
        A game iteration ran on main loop
        """
        self.send_update()
