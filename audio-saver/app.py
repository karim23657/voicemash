from flask import Flask, request, redirect, url_for, request, send_from_directory, send_file
import hashlib, re, json
import logging
try:
    from flask.ext.cors import CORS  # The typical way to import flask-cors
except ImportError:
    # Path hack allows examples to be run without installation.
    import os
    parentdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.sys.path.insert(0, parentdir)

    from flask.ext.cors import CORS

app = Flask(__name__, static_folder='/files')
logging.basicConfig(level=logging.INFO)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.config['UPLOAD_FOLDER'] = './files/'
app.config['SALT'] = 'bigomega'

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
from werkzeug import secure_filename
import os

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

@app.route("/download/<path:filename>")
@crossdomain(origin='*')
def download(filename):
    return send_file('./files/' + filename, mimetype="audio/wav", attachment_filename="voicemash-"+filename[:10]+".wav")

@app.route("/")
def hello():
    f = open('count', 'w')
    return "Hello World!"

@app.route("/save", methods=['GET', 'POST'])
@crossdomain(origin='*')
def save():
    if request.method == 'POST':
        file = request.files['data']
        url = request.args['url']
        start = request.args['start']
        end = request.args['end']
        if file:
            filename = secure_filename(file.filename)
            f = open('count', 'r')
            c = int(f.read()) + 1
            f.close()
            f = open('count', 'w')
            f.write(str(c))
            f.close()
            m = hashlib.md5();
            m.update(app.config['SALT'] + str(c))
            name = m.hexdigest()
            m = hashlib.md5()
            m.update(name)
            aud = m.hexdigest()
            f = open('db', 'a')
            f.write('\n'+str(name)+','+str(c)+','+str(aud)+','+str(url)+','+str(start)+','+str(end)+'\n')
            f.close()
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], str(aud)+'.wav'))
            return str(name)
    else:
      key = request.args['k']
      f = open('db', 'r')
      x = f.read()
      v = re.search(r'\n(.*'+key+'.*)\n', x, re.M|re.I)
      return json.dumps(v.group(1).split(','));

if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True)
