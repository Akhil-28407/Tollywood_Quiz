from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime

app = Flask(__name__)

# simple file-backed leaderboard (no DB)
LEADERBOARD_FILE = os.path.join(os.path.dirname(__file__), 'leaderboard.json')

def read_leaderboard():
    try:
        if not os.path.exists(LEADERBOARD_FILE):
            return []
        with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def write_leaderboard(entries):
    try:
        with open(LEADERBOARD_FILE, 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        return True
    except Exception:
        return False

def append_score(name, score, difficulty):
    entries = read_leaderboard()
    entry = {
        'name': str(name)[:64],
        'score': int(score),
        'difficulty': str(difficulty)[:32],
        'ts': datetime.utcnow().isoformat() + 'Z'
    }
    entries.append(entry)
    # sort by score desc, then earlier timestamp
    entries.sort(key=lambda e: (-e.get('score', 0), e.get('ts', '')))
    # keep top 100
    entries = entries[:100]
    write_leaderboard(entries)
    return entry

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/difficulty')
def difficulty():
    return render_template('difficulty.html')


@app.route('/quiz')
def quiz():
    return render_template('quiz.html')


@app.route('/result')
def result():
    return render_template('result.html')


@app.route('/leaderboard')
def leaderboard():
    # render server-side leaderboard entries so all players see the same list
    entries = read_leaderboard()
    return render_template('leaderboard.html', entries=entries)


@app.route('/save_score', methods=['POST'])
def save_score():
    # accepts JSON {name, score, difficulty}
    data = request.get_json() or {}
    name = data.get('name') or data.get('player') or ''
    try:
        score = int(data.get('score', 0))
    except Exception:
        score = 0
    difficulty = data.get('difficulty', '')
    if not name:
        return jsonify({'ok': False, 'error': 'missing name'}), 400
    entry = append_score(name, score, difficulty)
    return jsonify({'ok': True, 'entry': entry})


@app.route('/clear_leaderboard', methods=['POST'])
def clear_leaderboard():
    # simple clear endpoint (no auth) — useful for development
    write_leaderboard([])
    return jsonify({'ok': True})


if __name__ == '__main__':
    app.run(debug=True)
