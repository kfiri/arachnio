from uuid import uuid4

class Player(object):

    def __init__(self, websocket, x=0, y=0, name="Deuce", score=0):
        self.score = score
        self.x = x
        self.y = y
        self.websocket = websocket
        self.name = name
        self.id = Player.generate_id()
   

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
