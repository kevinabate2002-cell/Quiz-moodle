const state = {
  allQuestions: [],
  questions: [],
  currentIndex: 0,
  answers: {}
};

const letters = ["A", "B", "C", "D"];

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const finishBtn = document.getElementById("finishBtn");
const shuffleQuestionsCheckbox = document.getElementById("shuffleQuestions");

const quizPanel = document.getElementById("quizPanel");
const resultPanel = document.getElementById("resultPanel");

const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressText = document.getElementById("progressText");
const answeredText = document.getElementById("answeredText");
const progressBar = document.getElementById("progressBar");
const scoreText = document.getElementById("scoreText");
const resultSummary = document.getElementById("resultSummary");
const reviewContainer = document.getElementById("reviewContainer");

async function loadQuestions() {
  const response = await fetch("questions.json");
  if (!response.ok) {
    throw new Error("Impossibile caricare questions.json");
  }
  state.allQuestions = await response.json();
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startQuiz() {
  state.questions = shuffleQuestionsCheckbox.checked
    ? shuffleArray(state.allQuestions)
    : [...state.allQuestions];
  state.currentIndex = 0;
  state.answers = {};
  resultPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const current = state.questions[state.currentIndex];
  const selected = state.answers[current.id];

  questionNumber.textContent = `Domanda ${state.currentIndex + 1}`;
  questionText.textContent = current.question;
  progressText.textContent = `Domanda ${state.currentIndex + 1} di ${state.questions.length}`;
  const answeredCount = Object.keys(state.answers).length;
  answeredText.textContent = `Risposte date: ${answeredCount}/${state.questions.length}`;
  progressBar.style.width = `${((state.currentIndex + 1) / state.questions.length) * 100}%`;

  optionsContainer.innerHTML = "";
  current.options.forEach((optionText, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option" + (selected === index ? " selected" : "");
    button.innerHTML = `
      <span class="option-letter">${letters[index]}</span>
      <span class="option-text">${optionText}</span>
    `;
    button.addEventListener("click", () => {
      state.answers[current.id] = index;
      renderQuestion();
    });
    optionsContainer.appendChild(button);
  });

  prevBtn.disabled = state.currentIndex === 0;
  nextBtn.disabled = state.currentIndex === state.questions.length - 1;
}

function goPrevious() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
}

function goNext() {
  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  }
}

function finishQuiz() {
  let correct = 0;
  reviewContainer.innerHTML = "";

  state.questions.forEach((question, idx) => {
    const userAnswer = state.answers[question.id];
    const isCorrect = userAnswer === question.correctIndex;
    if (isCorrect) correct += 1;

    const item = document.createElement("article");
    item.className = "review-item";

    const userText = userAnswer === undefined
      ? "Nessuna risposta selezionata"
      : `${letters[userAnswer]}) ${question.options[userAnswer]}`;

    item.innerHTML = `
      <h3>${idx + 1}. ${question.question}</h3>
      <p class="review-answer ${isCorrect ? "correct" : "wrong"}"><strong>La tua risposta:</strong> ${userText}</p>
      <p class="review-answer correct"><strong>Risposta corretta:</strong> A) ${question.options[question.correctIndex]}</p>
    `;

    reviewContainer.appendChild(item);
  });

  scoreText.textContent = `Hai risposto correttamente a ${correct} domande su ${state.questions.length}.`;
  resultSummary.textContent = `Percentuale: ${Math.round((correct / state.questions.length) * 100)}%.`;
  quizPanel.classList.add("hidden");
  resultPanel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", startQuiz);
prevBtn.addEventListener("click", goPrevious);
nextBtn.addEventListener("click", goNext);
finishBtn.addEventListener("click", finishQuiz);

loadQuestions().catch((error) => {
  document.body.innerHTML = `
    <main class="app">
      <section class="card">
        <h1>Errore di caricamento</h1>
        <p>${error.message}</p>
        <p>Controlla di aver caricato insieme index.html, style.css, script.js e questions.json.</p>
      </section>
    </main>
  `;
});
