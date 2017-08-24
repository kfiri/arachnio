import sys

import click
import logbook
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop, PeriodicCallback
from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer

from . import config
from .app import app
from .game.client_handler import ClientWebSocketHandler
from .game.core import Game


def run_server(ip, port):
    settings = dict()
    flask_container = WSGIContainer(app)
    handlers = [
        (r'/ws', ClientWebSocketHandler),
        (r'.*', FallbackHandler, dict(fallback=flask_container))
    ]
    http_server = HTTPServer(Application(handlers), **settings)
    http_server.listen(port, ip)
    main_loop = IOLoop.instance()
    game_task = PeriodicCallback(None, 100)

    main_loop.start()


def run_server_logged(ip, port):
    # No need for a file handler, since the service directs all output to a file anyway.
    logger_setup = logbook.NestedSetup(
        [logbook.NullHandler(), logbook.StreamHandler(sys.stdout, level=logbook.DEBUG, bubble=True)])
    with logger_setup.applicationbound():
        run_server(ip, port)


@click.command()
@click.option('--ip', default=config.IP)
@click.option('--port', default=config.PORT)
def main(ip, port):
    run_server_logged(ip, port)


if __name__ == '__main__':
    main()
