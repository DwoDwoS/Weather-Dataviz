const SVG = d3.select("#sky");
const WIDTH = 800;
const HEIGHT = 250;
const MARGIN = { top: 40, bottom: 15, left: 50, right: -400 };
const SCALE_X = d3.scaleLinear()
  .domain([0, 23])
  .range([MARGIN.left, WIDTH - MARGIN.right]);

const SCALE_Y = d3.scaleLinear()
  .domain([0, 1])
  .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

const DATA = d3.range(0, 24.1, 0.1).map(h => ({
  hour: h,
  height: Math.sin((Math.PI * h) / 24)
}));

const LINE = d3.line()
  .x(d => SCALE_X(d.hour))
  .y(d => SCALE_Y(d.height))
  .curve(d3.curveMonotoneX);

SVG.append("path")
  .datum(DATA)
  .attr("class", "curve")
  .attr("d", LINE);

const NOW = new Date();
const CURRENT_HOUR = NOW.getHours() + NOW.getMinutes() / 60;

const ISNIGHT = CURRENT_HOUR < 6 || CURRENT_HOUR >= 20;

function updateBackground(hour) {
  const BODY = document.body;

  if (hour < 6) {
    BODY.style.backgroundColor = "#0d1b2a"; 
  } else if (hour < 12) {
    BODY.style.backgroundColor = "#4682b4"; 
  } else if (hour < 18) {
    BODY.style.backgroundColor = "#58b1d4ff"; 
  } else if (hour < 20) {
    BODY.style.backgroundColor = "#ffa07a"; 
  } else if (hour < 22) {
    BODY.style.backgroundColor = "#ff6f61"; 
  } else {
    BODY.style.backgroundColor = "#0d1b2a"; 
  }
}

updateBackground(CURRENT_HOUR);

const SUN = SVG.append("circle")
  .attr("class", ISNIGHT ? "moon" : "sun")
  .attr("r", 12)
  .attr("cx", SCALE_X(0))
  .attr("cy", SCALE_Y(0));

SUN.transition()
  .duration(4000)
  .ease(d3.easeCubicInOut)
  .tween("moveSun", () => {
    const INTERPOLATE_X = d3.interpolate(0, CURRENT_HOUR);
    return function (t) {
      const HOUR = INTERPOLATE_X(t);
      const height = Math.sin((Math.PI * HOUR) / 24);
      SUN.attr("cx", SCALE_X(HOUR)).attr("cy", SCALE_Y(height));
    
      if (HOUR < 6 || HOUR >= 20) {
        SUN.attr("class", "moon");
      } else {
        SUN.attr("class", "sun");
      }

      updateBackground(HOUR);
    };
  });

const HOURS_TO_MARK = [0, 6, 12, 18, 24];
SVG.selectAll("text.hour-label")
  .data(HOURS_TO_MARK)
  .enter()
  .append("text")
  .attr("class", "hour-label")
  .attr("x", d => SCALE_X(d))
  .attr("y", HEIGHT + 7)
  .attr("text-anchor", "middle")
  .attr("fill", "white")
  .text(d => `${d.toString().padStart(2, "0")}h`);
  d3.selectAll("text.hour-label").filter((d) => d === 24).remove();