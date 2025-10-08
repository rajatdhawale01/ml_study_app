from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, flash
import requests

app = Flask(__name__)
app.secret_key = "replace-with-a-strong-secret-key"  # use env var in prod

# reCAPTCHA keys (keep yours, or load from env)
RECAPTCHA_SITE_KEY = "6Leia9grAAAAANlSX7hcOxUh5afONz77LG8twThz"
RECAPTCHA_SECRET_KEY = "6Leia9grAAAAAMJsKqvuRZ9ewNxSzgnnPFUoBP5a"

# Demo users (use DB + hashing in production)
DEMO_USERS = {"rajat": "pass123", "admin": "admin123", "guest": "guest","student":"student","new_user":"new_password"}

def verify_recaptcha(response_token, remote_ip=None):
    """Return True/False based on Google reCAPTCHA v2 verification."""
    if not RECAPTCHA_SECRET_KEY:
        return True
    payload = {"secret": RECAPTCHA_SECRET_KEY, "response": response_token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    try:
        r = requests.post("https://www.google.com/recaptcha/api/siteverify", data=payload, timeout=5)
        return bool(r.json().get("success"))
    except Exception:
        return False

def login_required(view_fn):
    @wraps(view_fn)
    def wrapped(*args, **kwargs):
        if "user" not in session:
            flash("Please log in to continue.", "warning")
            return redirect(url_for("login"))
        return view_fn(*args, **kwargs)
    return wrapped

@app.route("/")
@login_required
def home():
    sections = [
        {"id": "intro",   "title": "ML Intro",              "summary": "What ML is and key terminology.",                  "href": url_for("intro")},
        {"id": "process", "title": "ML Process",            "summary": "From problem framing to deployment & monitoring.", "href": url_for("process")},
        {"id": "mindmap", "title": "Interactive Mind Map",  "summary": "Explore models, theory, and parameters.",          "href": url_for("mindmap")},
        {"id": "theory",  "title": "Data Prep Theory",      "summary": "Cleaning, preprocessing, feature engineering, data types & more.", "href": url_for("theory")},
    ]
    return render_template("home.html", user=session.get("user"), sections=sections)

@app.route("/theory")
@login_required
def theory():
    return render_template("theory.html", user=session.get("user"))

@app.route("/intro")
@login_required
def intro():
    return render_template("intro.html", user=session.get("user"))

@app.route("/process")
@login_required
def process():
    return render_template("process.html", user=session.get("user"))

@app.route("/mindmap")
@login_required
def mindmap():
    # Loads React/ReactDOM/Babel via CDN and your JSX from static/js/mlmindmap.jsx
    return render_template("mindmap.html", user=session.get("user"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        token = request.form.get("g-recaptcha-response", "")
        ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if not verify_recaptcha(token, ip):
            flash("CAPTCHA verification failed. Please try again.", "danger")
            return render_template("login.html", recaptcha_site_key=RECAPTCHA_SITE_KEY), 400

        u = request.form.get("username", "").strip()
        p = request.form.get("password", "").strip()
        if u in DEMO_USERS and DEMO_USERS[u] == p:
            session["user"] = u
            flash(f"Welcome, {u}!", "success")
            return redirect(url_for("home"))

        flash("Invalid username or password.", "danger")
        return render_template("login.html", recaptcha_site_key=RECAPTCHA_SITE_KEY), 401

    return render_template("login.html", recaptcha_site_key=RECAPTCHA_SITE_KEY)

@app.route("/logout")
def logout():
    session.pop("user", None)
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
