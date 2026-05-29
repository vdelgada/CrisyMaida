const TARGET_DATE = "2024-06-08";

const dateForm = document.querySelector("#date-form");
const dateInput = document.querySelector("#date-input");
const feedback = document.querySelector("#feedback");
const submitButton = dateForm.querySelector("button");

const errorMessages = [
  "¿Enserio? va, dadle una vuelta.",
  "¿Esa fecha era importante?",
  "Ala mañas espabilad",
  "Mira me estoy empezando a cansar",
  "Bah, paso de esta mierda",
  "No",
  "Esta tampoco",
  "Negativo",
  "Igual os hemos sobreestimado",
];

const runawayButtonMessages = [
  "Jeje séd más rápidas",
  "Ups",
  "Le das o qué",
  "Eso te pasa por fallar",
];

let failedAttempts = 0;
let isButtonRunning = false;
let remainingButtonEscapes = 0;
let runawayButtonMessageIndex = 0;

function rotateRunawayButtonText() {
  submitButton.textContent = runawayButtonMessages[runawayButtonMessageIndex];
  runawayButtonMessageIndex = (runawayButtonMessageIndex + 1) % runawayButtonMessages.length;
}

function moveButtonOnce() {
  const buttonRect = submitButton.getBoundingClientRect();
  const inputRect = dateInput.getBoundingClientRect();
  const currentX = Number.parseFloat(submitButton.style.getPropertyValue("--run-x")) || 0;
  const currentY = Number.parseFloat(submitButton.style.getPropertyValue("--run-y")) || 0;
  const maxDistance = Math.min(340, 130 + failedAttempts * 22);
  const minDistance = Math.min(170, maxDistance);
  const viewportPadding = 12;
  const inputPadding = 14;

  for (let attempt = 0; attempt < 36; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    const nextRect = {
      left: buttonRect.left - currentX + offsetX,
      right: buttonRect.right - currentX + offsetX,
      top: buttonRect.top - currentY + offsetY,
      bottom: buttonRect.bottom - currentY + offsetY,
    };

    const overlapsInput =
      nextRect.left < inputRect.right + inputPadding &&
      nextRect.right > inputRect.left - inputPadding &&
      nextRect.top < inputRect.bottom + inputPadding &&
      nextRect.bottom > inputRect.top - inputPadding;

    const staysInViewport =
      nextRect.left > viewportPadding &&
      nextRect.right < window.innerWidth - viewportPadding &&
      nextRect.top > viewportPadding &&
      nextRect.bottom < window.innerHeight - viewportPadding;

    if (!overlapsInput && staysInViewport) {
      submitButton.style.setProperty("--run-x", `${Math.round(offsetX)}px`);
      submitButton.style.setProperty("--run-y", `${Math.round(offsetY)}px`);
      return;
    }
  }

  submitButton.style.setProperty("--run-x", `${Math.round(Math.min(maxDistance, 220))}px`);
  submitButton.style.setProperty("--run-y", "96px");
}

function moveButtonAway() {
  if (remainingButtonEscapes === 0 || dateInput.value === TARGET_DATE) {
    return;
  }

  if (isButtonRunning) {
    return;
  }

  isButtonRunning = true;
  remainingButtonEscapes -= 1;
  rotateRunawayButtonText();
  moveButtonOnce();

  window.setTimeout(() => {
    isButtonRunning = false;
  }, 230);
}

function getErrorMessage() {
  if (failedAttempts < errorMessages.length) {
    const message = errorMessages[failedAttempts];
    failedAttempts += 1;
    return message;
  }

  const extraOs = "O".repeat(failedAttempts - errorMessages.length + 1);
  failedAttempts += 1;
  return `QUE N${extraOs}`;
}

dateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  feedback.className = "feedback";

  const selectedDate = dateInput.value;

  if (!selectedDate) {
    feedback.textContent = "Elige una fecha para intentarlo.";
    return;
  }

  if (selectedDate === TARGET_DATE) {
    feedback.textContent = "¿Veis como era facil? Ahora a contar billetes guapas :)";
    feedback.classList.add("is-success");
    remainingButtonEscapes = 0;
    submitButton.textContent = "Probar";
    submitButton.style.setProperty("--run-x", "0px");
    submitButton.style.setProperty("--run-y", "0px");
    return;
  }

  feedback.textContent = getErrorMessage();
  feedback.classList.add("is-close");
  remainingButtonEscapes = failedAttempts;
});

submitButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse" || event.pointerType === "pen") {
    moveButtonAway();
  }
});

submitButton.addEventListener("pointerdown", (event) => {
  if (
    event.pointerType === "touch" &&
    remainingButtonEscapes > 0 &&
    dateInput.value !== TARGET_DATE
  ) {
    event.preventDefault();
    moveButtonAway();
  }
});
