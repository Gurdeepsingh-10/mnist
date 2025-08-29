const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

// Initialize canvas: black background
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Mouse & touch events
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    } else {
        return [e.clientX - rect.left, e.clientY - rect.top];
    }
}

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", (e) => { drawing = true; draw(e); e.preventDefault(); });
canvas.addEventListener("touchend", () => drawing = false);
canvas.addEventListener("touchmove", draw);

function draw(e) {
    if (!drawing) return;
    const [x, y] = getPos(e);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2); // circular brush
    ctx.fill();
}


// Buttons
document.getElementById("clear").onclick = () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

document.getElementById("predict").onclick = async () => {
    const dataURL = canvas.toDataURL("image/png");
    const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL })
    });
    const result = await response.json();

    // Display top 3 predictions
    const top3El = document.getElementById("top3");
    top3El.innerHTML = "";
    result.top3.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.digit}: ${(p.confidence * 100).toFixed(2)}%`;
        top3El.appendChild(li);
    });

    // Chart
    const chartCtx = document.getElementById('chart').getContext('2d');
    if (window.barChart) window.barChart.destroy();
    window.barChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: result.confidences.map(c => c.digit),
            datasets: [{
                label: 'Confidence',
                data: result.confidences.map(c => c.confidence),
                backgroundColor: 'rgba(39, 60, 117, 0.7)'
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 1 } },
            plugins: { legend: { display: false } }
        }
    });
};
