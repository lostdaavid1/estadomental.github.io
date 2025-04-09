const questions = [
  "¿Te has sentido triste o deprimido en los últimos días?",
  "¿Has tenido dificultad para dormir o has dormido en exceso?",
  "¿Te sientes con poca energía o motivación?",
  "¿Te resulta difícil concentrarte en tus tareas diarias?",
  "¿Has perdido el interés en actividades que antes disfrutabas?",
  "¿Has tenido pensamientos negativos sobre ti mismo?",
  "¿Te sientes ansioso o preocupado constantemente?",
  "¿Has tenido cambios en tu apetito o peso sin razón aparente?",
  "¿Te sientes irritable o frustrado con facilidad?",
  "¿Has pensado en hacerte daño o en que la vida no vale la pena?"
];

const options = [
  { label: "Nunca", value: 0 },
  { label: "A veces", value: 1 },
  { label: "Frecuentemente", value: 2 },
  { label: "Siempre", value: 3 }
];

let current = 0;
const answers = [];
const content = document.getElementById("content");
const resultsTable = document.querySelector("#resultsTable tbody");

let storedResults = JSON.parse(localStorage.getItem("mentalResults") || "[]");

function renderQuestion() {
  const progress = (current / questions.length) * 100;
  content.innerHTML = `
    <div class="progress-container">
      <div class="progress-bar" style="width: ${progress}%"></div>
    </div>
    <p class="question">${questions[current]}</p>
    <div class="options">
      ${options.map(opt => `<button onclick="submitAnswer(${opt.value})">${opt.label}</button>`).join('')}
    </div>
  `;
}

function submitAnswer(value) {
  answers.push(value);
  current++;
  if (current < questions.length) {
    renderQuestion();
  } else {
    renderResult();
  }
}

function getDiagnosis(score) {
  if (score <= 5) return "Estado mental saludable.";
  if (score <= 15) return "Leve malestar emocional.";
  if (score <= 25) return "Malestar moderado.";
  return "Alto riesgo. Busca ayuda profesional.";
}

function renderResult() {
  const total = answers.reduce((a, b) => a + b, 0);
  const max = questions.length * 3;
  const percentage = Math.round((total / max) * 100);
  const diagnosis = getDiagnosis(total);

  content.innerHTML = `
    <h2>Resultado: ${percentage}%</h2>
    <p>${diagnosis}</p>
    <input class="input-id" type="text" id="userId" placeholder="Ingresa tu ID" />
    <button class="btn-submit" onclick="submitResult(${total}, ${max}, '${diagnosis.replace(/'/g, "\\'")}')">Enviar resultado</button>
    <p id="warningMsg" style="color:red;"></p>
  `;
}

function submitResult(score, max, diagnosis) {
  const userId = document.getElementById("userId").value.trim();
  const warning = document.getElementById("warningMsg");

  if (!userId) {
    warning.textContent = "Por favor ingresa tu ID.";
    return;
  }

  if (userId.toLowerCase() === "borrar") {
    localStorage.removeItem("mentalResults");
    storedResults = [];
    renderTable();
    content.innerHTML = `<p style="color:green;">Todos los resultados han sido borrados.</p>`;
    return;
  }

  const exists = storedResults.some(r => r.id === userId);
  if (exists) {
    warning.textContent = "Este ID ya ha enviado una respuesta.";
    return;
  }

  const date = new Date().toLocaleString();
  const percentage = Math.round((score / max) * 100);
  const result = { id: userId, date, percentage, diagnosis };

  storedResults.push(result);
  localStorage.setItem("mentalResults", JSON.stringify(storedResults));
  renderTable();

  content.innerHTML = `<p style="color:green;">Gracias por tu respuesta.</p>`;
}

function renderTable() {
  resultsTable.innerHTML = "";
  storedResults.forEach(r => {
    const row = `<tr><td>${r.id}</td><td>${r.date}</td><td>${r.percentage}%</td></tr>`;
    resultsTable.innerHTML += row;
  });
}

renderQuestion();
renderTable();
