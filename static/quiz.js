(function () {
  "use strict";

  // --- Question Sets (global) ---
  window.questions = {
    easy: [
      { question: "Who directed the movie 'Baahubali'?", options: ["S. S. Rajamouli", "Trivikram Srinivas", "Puri Jagannadh", "Sukumar"], answer: "S. S. Rajamouli" },
      { question: "Who is called the 'Megastar' of Telugu cinema?", options: ["Chiranjeevi", "Nagarjuna", "Venkatesh", "Balakrishna"], answer: "Chiranjeevi" },
      { question: "Which movie stars Allu Arjun as 'Pushpa Raj'?", options: ["Pushpa", "Arya", "DJ", "Sarrainodu"], answer: "Pushpa" },
      { question: "Who played 'Mahendra Baahubali'?", options: ["Prabhas", "NTR Jr.", "Ram Charan", "Mahesh Babu"], answer: "Prabhas" },
      { question: "Which movie’s song is 'Butta Bomma'?", options: ["Ala Vaikunthapurramuloo", "Pushpa", "Sarileru Neekevvaru", "Bheeshma"], answer: "Ala Vaikunthapurramuloo" },
      { question: "Who is known as the 'Prince' of Tollywood?", options: ["Mahesh Babu", "Ram Charan", "Nani", "Varun Tej"], answer: "Mahesh Babu" },
      { question: "Which movie features the character 'Bheemla Nayak'?", options: ["Bheemla Nayak", "Vakeel Saab", "Gabbar Singh", "Attarintiki Daredi"], answer: "Bheemla Nayak" }
    ],
    medium: [
      { question: "Who composed the score for 'Eega'?", options: ["M. M. Keeravani", "Thaman S", "DSP", "Anirudh Ravichander"], answer: "M. M. Keeravani" },
      { question: "Which actor is known as the 'Mass Maharaja'?", options: ["Ravi Teja", "Balakrishna", "Allari Naresh", "Nani"], answer: "Ravi Teja" },
      { question: "Which film won the National Award for Best Telugu Film in 2018?", options: ["Mahanati", "C/O Kancharapalem", "Rangasthalam", "Arjun Reddy"], answer: "Mahanati" },
      { question: "Who directed 'Rangasthalam'?", options: ["Sukumar", "Koratala Siva", "Boyapati Srinu", "Trivikram Srinivas"], answer: "Sukumar" },
      { question: "Which film starred Dulquer Salmaan and was acclaimed?", options: ["Mahanati", "Sita Ramam", "Kalki 2898 AD", "Yevade Subramanyam"], answer: "Mahanati" },
      { question: "Who directed 'Arjun Reddy'?", options: ["Sandeep Reddy Vanga", "Sukumar", "Trivikram Srinivas", "Harish Shankar"], answer: "Sandeep Reddy Vanga" },
      { question: "Which Telugu film was India's official entry to the Oscars in 2021?", options: ["Jathi Ratnalu", "Cinema Bandi", "Vakeel Saab", "Koozhangal"], answer: "Koozhangal" }
    ],
    hard: [
      { question: "Who directed the film 'Sankarabharanam'?", options: ["K. Viswanath", "Bapu", "Dasari Narayana Rao", "Kodi Ramakrishna"], answer: "K. Viswanath" },
      { question: "Which cinematographer frequently works with S. S. Rajamouli?", options: ["Senthil Kumar", "Ravi Varman", "Madhie", "K. K. Senthil Nathan"], answer: "Senthil Kumar" },
      { question: "Which Telugu actor received the Padma Bhushan in 2006?", options: ["Chiranjeevi", "Venkatesh", "Nagarjuna", "Balakrishna"], answer: "Chiranjeevi" },
      { question: "Which year was 'Magadheera' released?", options: ["2008", "2009", "2010", "2011"], answer: "2009" },
      { question: "Who played the antagonist in 'Athadu'?", options: ["Sayaji Shinde", "Prakash Raj", "Sonu Sood", "Nassar"], answer: "Sayaji Shinde" },
      { question: "Who wrote the story for 'Baahubali'?", options: ["Vijayendra Prasad", "S. S. Rajamouli", "Koratala Siva", "Trivikram Srinivas"], answer: "Vijayendra Prasad" },
      { question: "Which was the first Telugu film to cross ₹100 crore at the box office?", options: ["Magadheera", "Pokiri", "Baahubali", "Srimanthudu"], answer: "Magadheera" }
    ]
  };

  // --- Utilities for leaderboard ---
  function loadLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem("leaderboard")) || [];
    } catch (e) {
      return [];
    }
  }
  function saveLeaderboard(board) {
    localStorage.setItem("leaderboard", JSON.stringify(board));
  }
  window.saveToLeaderboard = function (name, score, difficulty) {
    const board = loadLeaderboard();
    board.push({ name, score, difficulty, ts: Date.now() });
    board.sort((a, b) => b.score - a.score || a.ts - b.ts); // highest score first, then earlier timestamp
    saveLeaderboard(board.slice(0, 20));
  };

  // --- Page-specific behaviour on DOMContentLoaded ---
  document.addEventListener("DOMContentLoaded", function () {
    // determine which page by class in body
    const body = document.body;

    // ---------- QUIZ PAGE ----------
    if (body.classList.contains("page-quiz")) {
      const params = new URLSearchParams(window.location.search);
      const level = (params.get("level") || "easy").toLowerCase();
      const qset = window.questions[level] || window.questions.easy;

      const questionEl = document.getElementById("question");
      const optionsEl = document.getElementById("options");
      const nextBtn = document.getElementById("next-btn");
      const quitBtn = document.getElementById("quit-btn");
      const progressFill = document.getElementById("progress-fill");
      const progressText = document.getElementById("progress-text");
      const modeLabel = document.getElementById("mode-label");
      const pageTitle = document.getElementById("page-title");

      pageTitle.textContent = "Telugu Cinema Quiz";
      modeLabel.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)} mode`;

      let current = 0;
      let score = 0;
      let locked = false; // prevent double-clicks

      function renderQuestion() {
        locked = false;
        const q = qset[current];
        questionEl.textContent = q.question;
        optionsEl.innerHTML = "";
        // shuffle options copy to keep original answer mapping? We'll keep original order for clarity
        q.options.forEach((opt, idx) => {
          const label = document.createElement("label");
          label.className = "option";
          label.setAttribute("role", "listitem");
          label.innerHTML = `<input type="radio" name="option" value="${opt}" aria-label="${opt}"> <span class="opt-text">${opt}</span>`;
          // click on label selects the radio
          label.addEventListener("click", () => {
            // visual select
            const radios = optionsEl.querySelectorAll("input[type=radio]");
            radios.forEach(r => r.checked = false);
            label.querySelector("input[type=radio]").checked = true;
          });
          optionsEl.appendChild(label);
        });

        updateProgress();
      }

      function updateProgress() {
        progressFill.style.width = `${((current) / qset.length) * 100}%`;
        progressText.textContent = `${current}/${qset.length}`;
      }

      // handle answer check + move next
      nextBtn.addEventListener("click", () => {
        if (locked) return;
        const selected = optionsEl.querySelector("input[type=radio]:checked");
        if (!selected) return alert("Please choose an option.");

        locked = true;
        const val = selected.value;
        const q = qset[current];

        // mark options with classes
        const labels = Array.from(optionsEl.querySelectorAll(".option"));
        labels.forEach(label => {
          const input = label.querySelector("input");
          if (input.value === q.answer) {
            label.classList.add("correct");
          } else if (input.checked && input.value !== q.answer) {
            label.classList.add("wrong");
          }
        });

        if (val === q.answer) score++;

        // small delay to show feedback, then next
        setTimeout(() => {
          current++;
          if (current >= qset.length) {
            // finish quiz
            localStorage.setItem("lastScore", String(score));
            localStorage.setItem("lastLevel", level);
            localStorage.setItem("lastTotal", String(qset.length));
            window.location.href = "/result";
          } else {
            // reset classes
            optionsEl.querySelectorAll(".option").forEach(l => { l.classList.remove("correct", "wrong"); });
            renderQuestion();
          }
        }, 700);
      });

      quitBtn.addEventListener("click", () => {
        if (confirm("Quit the quiz? Your progress will be lost.")) {
          window.location.href = "/";
        }
      });

      // initial render
      renderQuestion();
      updateProgress();
    }

    // ---------- RESULT PAGE ----------
    else if (body.classList.contains("page-result")) {
      const scoreDisplay = document.getElementById("score-display");
      const playerName = document.getElementById("player-name");
      const saveBtn = document.getElementById("save-score-btn");
      const confettiHolder = document.getElementById("confetti-holder");

      const lastScore = parseInt(localStorage.getItem("lastScore") || "0", 10);
      const lastLevel = localStorage.getItem("lastLevel") || "easy";
      const lastTotal = parseInt(localStorage.getItem("lastTotal") || "0", 10);

      scoreDisplay.textContent = `${lastScore} / ${lastTotal}`;
      const resultSub = document.getElementById("result-sub");
      resultSub.textContent = `${lastLevel.charAt(0).toUpperCase() + lastLevel.slice(1)} mode`;

      // simple confetti (small circles) — lightweight
      function fireConfetti() {
        if (!confettiHolder) return;
        confettiHolder.innerHTML = "";
        for (let i = 0; i < 18; i++) {
          const el = document.createElement("div");
          el.style.position = "absolute";
          el.style.left = `${Math.random() * 80}%`;
          el.style.top = `${Math.random() * 30}%`;
          el.style.width = el.style.height = `${8 + Math.random() * 12}px`;
          el.style.borderRadius = "50%";
          el.style.opacity = 0.95;
          el.style.background = ['#FFD166', '#06D6A0', '#4CC9F0', '#EF476F', '#9B5DE5'][Math.floor(Math.random()*5)];
          el.style.transform = `translateY(-10px)`;
          el.style.transition = `transform 1.2s cubic-bezier(.2,.8,.2,1), opacity 1.2s`;
          confettiHolder.appendChild(el);
          // animate
          requestAnimationFrame(() => {
            el.style.transform = `translateY(${200 + Math.random()*180}px) rotate(${Math.random()*360}deg)`;
            el.style.opacity = 0;
          });
        }
      }

      // show confetti if good score
      setTimeout(() => {
        if (lastScore >= Math.ceil(lastTotal * 0.6)) fireConfetti();
      }, 250);

      saveBtn.addEventListener("click", () => {
        const name = playerName.value.trim();
        if (!name) return alert("Please enter your name to save the score.");
        window.saveToLeaderboard(name, lastScore, lastLevel);
        alert("Score saved! Check leaderboard.");
        window.location.href = "/leaderboard";
      });
    }

    // ---------- LEADERBOARD PAGE ----------
    else if (body.classList.contains("page-leaderboard")) {
      const tbody = document.getElementById("leaderboard-body");
      const board = loadLeaderboard();
      if (!tbody) return;
      if (board.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="color:var(--muted)">No scores yet. Play a quiz to add your score.</td></tr>`;
      } else {
        tbody.innerHTML = board.map((row, i) => {
          return `<tr>
            <td>${i+1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${row.score}</td>
            <td>${escapeHtml(row.difficulty)}</td>
          </tr>`;
        }).join("");
      }
    }

    // Utilities
    function loadLeaderboard() {
      try {
        return JSON.parse(localStorage.getItem("leaderboard")) || [];
      } catch (e) {
        return [];
      }
    }
    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]);
      });
    }
  });
})();
