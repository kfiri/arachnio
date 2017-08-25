import json
import logbook
from tornado.websocket import WebSocketHandler

from .core import Game
from . import message
from .. import config

class MalformedMessageException(Exception):
    pass

class ClientWebSocketHandler(WebSocketHandler):

    game = Game()
    message_type_handlers = dict()

    def open(self, *args, **kwargs):
        self.game.send_welcome(self)
    
    def on_close(self):
        player = self.game.socket_to_player.pop(self, None)
        if player is not None:
            logbook.info('<{}> disconnected..'.format(player.id))
        else:
            logbook.info('A connection without a player has been closed..')
    
    def on_message(self, message):
        try:
            message = json.loads(message)
            self.message_type_handlers[message['type']](self, message['data'])

        except (KeyError, json.JSONDecodeError, MalformedMessageException):
            logbook.debug('Malformed message: {}'.format(repr(message)))
            logbook.warn('Received a malformed message from <{}>, disconnecting..'
                .format(self.game.socket_to_player[self].id))
            self.game.socket_to_player.pop(self, None)
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
        cls.message_type_handlers[message_type] = callback

def type_knock_handler(src_socket, data):
    ClientWebSocketHandler.game.create_new_player(src_socket, data['name'])
    src_socket.game.send_knockack(src_socket)
    
ClientWebSocketHandler.register_message_type_handler(message.KNOCK, type_knock_handler)

def type_update_handler(src_socket, data):
    x_delta, y_delta = data['direction']
    if x_delta not in [-1,0,1]: raise MalformedMessageException("x_delta needs to be in [-1,0,1]")
    if y_delta not in [-1,0,1]: raise MalformedMessageException("y_delta needs to be in [-1,0,1]")
    player = ClientWebSocketHandler.game.socket_to_player[src_socket]
    ClientWebSocketHandler.game.move_player(player, x_delta, y_delta)

ClientWebSocketHandler.register_message_type_handler(message.UPDATE, type_update_handler)
