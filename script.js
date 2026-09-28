const $ = (selector) => document.querySelector(selector);

const yesBtn = $("#yesBtn");
const noBtn = $("#noBtn");
const mainCard = $("#mainCard");
const successCard = $("#successCard");
const calendarCard = $("#calendarCard");
const foodCard = $("#foodCard");
const timeCard = $("#timeCard");
const summaryCard = $("#summaryCard");

const datePicker = $("#datePicker");
const hourPicker = $("#hourPicker");
const minutePicker = $("#minutePicker");
const ampmPicker = $("#ampmPicker");
const foodItems = document.querySelectorAll(".food-item");

let selectedFood = "";
let yesScale = 1;

// Gumawa ng pagpipiliang oras mula 1 hanggang 12.
for (let hour = 1; hour <= 12; hour++) {
  const option = document.createElement("option");
  option.value = String(hour);
  option.textContent = String(hour);

  if (hour === 6) {
    option.selected = true;
  }

  hourPicker.appendChild(option);
}

// Minutes: 00, 05, 10, hanggang 55.
for (let minute = 0; minute < 60; minute += 5) {
  const option = document.createElement("option");
  option.value = String(minute).padStart(2, "0");
  option.textContent = String(minute).padStart(2, "0");

  if (minute === 0) {
    option.selected = true;
  }

  minutePicker.appendChild(option);
}

// Kunin ang petsa ayon sa local timezone.
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

datePicker.min = getLocalDateString();
datePicker.value = datePicker.min;

// Umiwas ang No button, pero manatili sa loob ng screen.
function moveNoButton(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const margin = 16;
  const buttonWidth = noBtn.offsetWidth;
  const buttonHeight = noBtn.offsetHeight;

  const maxX = Math.max(
    margin,
    window.innerWidth - buttonWidth - margin
  );

  const maxY = Math.max(
    margin,
    window.innerHeight - buttonHeight - margin
  );

  // Sa unang paggalaw, gawing fixed para malayang gumalaw sa screen.
  noBtn.style.position = "fixed";

  let x = margin;
  let y = margin;

  for (let attempt = 0; attempt < 20; attempt++) {
    x = margin + Math.random() * (maxX - margin);
    y = margin + Math.random() * (maxY - margin);

    const currentRect = noBtn.getBoundingClientRect();

    const farFromPointer =
      !event ||
      Math.hypot(x - event.clientX, y - event.clientY) > 140;

    const changedPosition =
      Math.hypot(x - currentRect.left, y - currentRect.top) > 100;

    if (farFromPointer && changedPosition) {
      break;
    }
  }

  // Limitahan ang puwesto para hindi lumabas sa viewport.
  x = Math.min(Math.max(x, margin), maxX);
  y = Math.min(Math.max(y, margin), maxY);

  noBtn.style.left = `${Math.round(x)}px`;
  noBtn.style.top = `${Math.round(y)}px`;

  yesScale = Math.min(yesScale + 0.07, 1.35);
  yesBtn.style.transform = `scale(${yesScale})`;
}

noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("pointerdown", moveNoButton);
noBtn.addEventListener("click", moveNoButton);

// Kapag pinili ang Yes, ipakita ang next screen.
yesBtn.addEventListener("click", () => {
  mainCard.classList.add("hidden");
  noBtn.classList.add("hidden");
  successCard.classList.remove("hidden");
  startConfetti();
});

$("#startPlanBtn").addEventListener("click", () => {
  successCard.classList.add("hidden");
  calendarCard.classList.remove("hidden");
});

$("#toFoodBtn").addEventListener("click", () => {
  if (!datePicker.value) {
    alert("Pick a date first! 📅");
    return;
  }

  foodCard.dataset.date = datePicker.value;
  calendarCard.classList.add("hidden");
  foodCard.classList.remove("hidden");
});

foodItems.forEach((item) => {
  item.addEventListener("click", () => {
    foodItems.forEach((food) => food.classList.remove("selected"));
    item.classList.add("selected");
    selectedFood = item.dataset.food;
  });
});

$("#toTimeBtn").addEventListener("click", () => {
  if (!selectedFood) {
    alert("Choose what you want to eat first! 🍕");
    return;
  }

  foodCard.classList.add("hidden");
  timeCard.classList.remove("hidden");
});

$("#finishBtn").addEventListener("click", () => {
  const dateValue = foodCard.dataset.date;
  const date = new Date(`${dateValue}T12:00:00`);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  $("#resDate").textContent = formattedDate;
  $("#resFood").textContent = selectedFood;
  $("#resTime").textContent =
    `${hourPicker.value}:${minutePicker.value} ${ampmPicker.value}`;

  timeCard.classList.add("hidden");
  summaryCard.classList.remove("hidden");
  spawnCelebrationBlast();
});

// Confetti animation.
const canvas = $("#confettiCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let animationStarted = false;

function resizeCanvas() {
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function addConfetti(count, burst = false) {
  const colors = [
    "#ff4f79",
    "#ff92aa",
    "#ffc857",
    "#a78bfa",
    "#72d6c9"
  ];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: burst
        ? window.innerWidth / 2
        : Math.random() * window.innerWidth,

      y: burst
        ? window.innerHeight / 2
        : -12,

      vx: burst
        ? (Math.random() - 0.5) * 12
        : (Math.random() - 0.5) * 2,

      vy: burst
        ? (Math.random() - 0.8) * 11
        : Math.random() * 2 + 1,

      size: Math.random() * 7 + 4,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }
}

function animateConfetti() {
  if (!animationStarted) {
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((particle) => particle.life > 0);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.12;
    particle.rotation += particle.spin;
    particle.life -= 0.008;

    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;

    ctx.fillRect(
      -particle.size / 2,
      -particle.size / 2,
      particle.size,
      particle.size
    );

    ctx.restore();
  });

  requestAnimationFrame(animateConfetti);
}

function startConfetti() {
  if (!animationStarted) {
    animationStarted = true;
    animateConfetti();
  }

  addConfetti(100, true);
}

function spawnCelebrationBlast() {
  addConfetti(140, true);
}