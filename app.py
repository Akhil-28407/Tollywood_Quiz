from flask import Flask, render_template

app = Flask(__name__)

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
    return render_template('leaderboard.html')


if __name__ == '__main__':
    app.run(debug=True)
