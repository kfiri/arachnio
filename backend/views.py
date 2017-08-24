from flask import render_template, Blueprint, request
import json

from . import config

app_views = Blueprint('app_views', __name__,
                      template_folder=config.TEMPLATE_FOLDER)


@app_views.route('/')
def home():
    return render_template('index.html', config=config)
