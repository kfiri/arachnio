class Bonus(object):
    def __init__(self, x, y, value=1):
        self.x = x
        self.y = y
        self.value = value

    def prepare_json(self):
        """
        Convert object to a serializable form
        """
        return {
            'x': self.x,
            'y': self.y,
            'value': self.value
        }