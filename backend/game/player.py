from uuid import uuid4
import math

from . import consts

class Player(object):

    def __init__(self, websocket, name, x=0, y=0, score=consts.INITIAL_SCORE):
        self.score = score
        self.x = x
        self.y = y
        self.websocket = websocket
        self.name = name
        self.id = Player.generate_id()
        self.in_cooldown = False
    
    def disable_cooldown(self):
        self.in_cooldown = False
    
    def get_cooldown_duration(self):
        size = self.score * consts.SCORE_SIZE + consts.INITIAL_SIZE
        return math.log1p(size) / consts.INITIAL_SPEED

    @staticmethod
    def generate_id():
        return uuid4().hex

    def prepare_json(self):
        """
        Convert object to a serializable form
        """
        return {
            'id': self.id,
            'score': self.score,
            'x': self.x,
            'y': self.y,
            'name': self.name
        }
