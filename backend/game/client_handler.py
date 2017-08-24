import json
import logbook
from tornado.websocket import WebSocketHandler

from .core import Game
from .. import config

class ClientWebSocketHandler(WebSocketHandler):

    game = Game()
    message_handlers = dict()

    def open(self, *args, **kwargs):
        ClientWebSocketHandler.game.send_welcome(self)
    
    def on_message(self, message):
        try:
            message = json.dumps(message)
            ClientWebSocketHandler.message_handlers[message['type']](self, message['data'])

        except (KeyError, json.JSONDecodeError):
            logbook.debug('Malformed message: {}'.format(repr(message)))
            logbook.warn('Received a malformed message from <{}>, disconnecting..'
                .format(ClientWebSocketHandler.game.socket_to_player[self].id))
            ClientWebSocketHandler.game.socket_to_player.pop(self, None)
            self.close()
    
    def check_origin(self, origin):
        """
        This was override for supporting Tornado > 4.0.
        """
        return True
    
    @classmethod
    def register_message_type_handler(cls, message_type, callback):
        """
        Registers a callback for a certain event type (string).
        Callback receives a message object (dict).
        """
        cls.message_handlers[message_type] = callback

def type_knock_handler(src_socket, data):
    player = ClientWebSocketHandler.game.create_new_player(src_socket, data['name'])
    ClientWebSocketHandler.game.socket_to_player[src_socket] = player
    src_socket.game.send_knockack(src_socket)
    

ClientWebSocketHandler.register_message_type_handler("knock", type_knock_handler)
