import json
from random import randint

from tornado.ioloop import IOLoop

from .player import Player
from . import message
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
        self.location_to_player = dict()
        self.is_cyclic = is_cyclic
    
    def move_player(self, player, x_delta, y_delta):
        if (player.x + x_delta > self.width or player.x + x_delta <= 0) and self.is_cyclic:
            player.x = (player.x + x_delta) % self.width
        elif (0 <= player.x + x_delta < self.width):
            player.x = player.x + x_delta
        
        if (player.y + y_delta > self.height or player.y + y_delta <= 0) and self.is_cyclic:
            player.y = (player.y + y_delta) % self.height
        elif (0 <= player.y + y_delta < self.height):
            player.y = player.y + y_delta

        if not player.in_cooldown:
            IOLoop.current().call_later(player.get_cooldown_duration(), player.disable_cooldown)
        player.in_cooldown = True
        # TODO: Ultimate todo.. see bottom comments
        # Maybe update locations here?
        players_at_location = self.get_players_at(player.x, player.y)
        # Solve possible conflicts here..
        self.update_location_to_players()
    
    def get_players_at(self, x, y):
        return self.location_to_player.get((x, y), [])

    # TODO: replace update function you need to remember calling with automatic solution
    def update_location_to_players(self):
        self.location_to_player = dict()
        for player in self.socket_to_player.values():
            location = (player.x, player.y)
            self.location_to_player.setdefault(location, [])
            self.location_to_player[location].append(player)
    
    def create_new_player(self, websocket, name):
        while True:
            player = Player(websocket=websocket, x=randint(0, self.width),
                y=randint(0, self.height), name=name)
            if self.get_players_at(player.x, player.y) == []:
                # No conflicting players
                break
        self.socket_to_player[websocket] = player
        self.update_location_to_players()
        return player
    
    def send_welcome(self, player_socket):
        player_socket.write_message(json.dumps({
            'type': message.WELCOME,
            'data': {
                'width': self.width,
                'height': self.height,
                'is_cyclic': self.is_cyclic
            }
        }))
    
    def send_info(self):
        game_state = {
            'players': 
                {player.id: player.prepare_json() for player in self.socket_to_player.values()}
        }

        for player_socket in self.socket_to_player.keys():
            player_socket.write_message(json.dumps({
                'type': message.INFO,
                'data': game_state
            }))

    def send_knockack(self, player_socket):
        player_socket.write_message(json.dumps({
            'type': message.KNOCKACK,
            'data': self.socket_to_player[player_socket].prepare_json()
        }))
    
    def game_iteration(self):
        """
        A game iteration. Executed on main loop
        """
        self.send_info()
