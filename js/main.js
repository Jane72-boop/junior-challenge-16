import info from "/data.json" assert { type: "json" };

let labels = info.map((a) => a.day);
let amounts = info.map((a) => a.amount);

const ctx = document.querySelector("#myChart").getContext("2d");

//external tooltip
const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("section");

  if (!tooltipEl) {
    tooltipEl = document.createElement("section");
    tooltipEl.classList = "tooltip-style";

    const table = document.createElement("table");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b) => b.lines);

    const tableHead = document.createElement("thead");

    bodyLines.forEach((body) => {
      const tr = document.createElement("tr");
      tr.style.borderWidth = 0;

      const th = document.createElement("th");
      th.classList = "th-style";

      const text = document.createTextNode(`$${body}`);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.top = positionY + tooltip.caretY + "px";
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + "px " + tooltip.options.padding + "px";
  (tooltipEl.style.fontFamily = "DM Sans"), "sans-serif";
};

//gradient
let gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "rgba(236,119,80,1)");
gradient.addColorStop(0.5, "rgba(236,119,80,0.8)");
gradient.addColorStop(1, "rgba(236,119,80,0.4)");

let gradientHover = ctx.createLinearGradient(0, 0, 0, 400);
gradientHover.addColorStop(0, "rgba(0, 191, 255,1)");
gradientHover.addColorStop(0.5, "rgba(0, 191, 255,0.8)");
gradientHover.addColorStop(1, "rgba(0, 191, 255,0.4)");

//data
const data = {
  labels,
  datasets: [
    {
      data: amounts,
      label: "",
      fill: true,
      backgroundColor: gradient,
      borderColor: "#fff",
      pointBackgroundColor: "rgb(189, 195, 199)",
      tension: 0.1,
      hoverBackgroundColor: gradientHover,
    },
  ],
};

let delayed;

const config = {
  type: "bar",
  data: data,
  options: {
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0]
        ? "pointer"
        : "default";
      if (chartElement.length == 1) {
        event.native.target.style.cursor = "pointer";
      } else if (chartElement.length == 0) {
        event.native.target.style.cursor = "default";
      }
    },
    radius: 5,
    hitRadius: 30,
    hoverRadius: 12,
    responsive: true,
    scales: {
      y: {
        display: false,
      },
      x: {
        ticks: {
          font: {
            family: "DM Sans, sans-serif",
            size: "20px",
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          color: "rgb(255, 99, 132)",
        },
      },
      tooltip: {
        enabled: false,
        position: "nearest",
        external: externalTooltipHandler,
        // callbacks: {
        //   footer: footer,
        // }
      },
    },
    animation: {
      onComplete: () => {
        delayed = true;
      },
      delay: (context) => {
        let delay = 0;
        if (context.type === "data" && context.mode === "default" && !delayed) {
          delay = context.dataIndex * 300 + context.datasetIndex * 100;
        }
        return delay;
      },
    },
  },
};

const myChart = new Chart(ctx, config);
