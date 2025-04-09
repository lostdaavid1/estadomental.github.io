
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
const resultsTable = document.getElementById("results-table");

let storedResults = JSON.parse(localStorage.getItem("mentalResults") || "[]");

function renderQuestion() {
  const progress = ((current) / questions.length) * 100;
  content.innerHTML = \`
    <div class="progress-container">
      <div class="progress-bar" style="width: \${progress}%"></div>
    </div>
    <p class="question">\${questions[current]}</p>
    <div class="options">
      \${options.map(opt => `<button onclick="submitAnswer(\${opt.value})">\${opt.label}</button>`).join('')}
    </div>
  \`;
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

  content.innerHTML = \`
    <h2>Resultado: \${percentage}%</h2>
    <p>\${diagnosis}</p>
    <input class="input-id" type="text" id="userId" placeholder="Ingresa tu ID" />
    <button class="btn-submit" onclick="submitResult(\${total}, \${max}, '\${diagnosis.replace(/'/g, "\'")}')">Enviar resultado</button>
  \`;
}

function submitResult(score, max, diagnosis) {
  const userId = document.getElementById("userId").value.trim();
  if (!userId) return alert("Ingresa un ID válido");

  if (userId === "borrar") {
    localStorage.removeItem("mentalResults");
    storedResults = [];
    renderTable();
    return;
  }

  const exists = storedResults.some(res => res.userId === userId);
  if (exists) {
    alert("Este ID ya fue utilizado.");
    return;
  }

  const date = new Date().toLocaleString();
  const percentage = Math.round((score / max) * 100);

  const newResult = { userId, date, percentage, diagnosis };
  storedResults.push(newResult);
  localStorage.setItem("mentalResults", JSON.stringify(storedResults));

  // Enviar por Telegram
  const botToken = "7740246432:AAHChYoLLJ1GYzCRMAZ7mExak1FFiEMgKoE";
  const chatId = "1516417215";
  const message = \`🧠 Evaluación Mental\nID: \${userId}\nFecha: \${date}\nPuntaje: \${score}/\${max}\nDiagnóstico: \${diagnosis}\`;

  fetch(\`https://api.telegram.org/bot\${botToken}/sendMessage\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });

  renderTable();
}

function renderTable() {
  if (storedResults.length === 0) {
    resultsTable.innerHTML = "<p>No hay resultados registrados.</p>";
    return;
  }

  resultsTable.innerHTML = \`
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>%</th>
          <th>Diagnóstico</th>
        </tr>
      </thead>
      <tbody>
        \${storedResults.map(res => \`
          <tr>
            <td>\${res.userId}</td>
            <td>\${res.date}</td>
            <td>\${res.percentage}%</td>
            <td>\${res.diagnosis}</td>
          </tr>
        \`).join('')}
      </tbody>
    </table>
  \`;
}

renderTable();
renderQuestion();
