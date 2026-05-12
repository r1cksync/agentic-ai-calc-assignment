

## STACK
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (for all animations and transitions)
- Groq SDK (model: llama-3.3-70b-versatile) for LLM inference
- Plotly.js (via react-plotly.js) for all 2D/3D graphs
- Recharts for analytics charts
- MathJax or KaTeX for LaTeX rendering
- jsPDF for PDF export
- Zustand for global state

---

## PROJECT STRUCTURE

/app
  /page.tsx              ← Landing/home with suggested prompts
  /chat/page.tsx         ← Main chat + agent interface
  /analytics/page.tsx    ← Full analytics dashboard
  /notebook/page.tsx     ← Notebook/scratchpad mode
/components
  /chat/
    ChatPanel.tsx
    MessageBubble.tsx
    SuggestedPrompts.tsx
    StepByStepSolver.tsx
  /graphs/
    GraphPanel.tsx
    Graph2D.tsx
    Graph3D.tsx
    CurveLibrary.tsx
    ComparisonMode.tsx
  /analytics/
    AnalyticsDashboard.tsx
    SessionHeatmap.tsx
    QueryHistory.tsx
    ComputationStats.tsx
  /ui/
    Sidebar.tsx
    AnimatedCounter.tsx
    LatexExporter.tsx
    NotebookPanel.tsx

---

## FEATURE 1: AI AGENT WITH CALCULATOR TOOL

The agent uses Groq's tool-calling API. Define these tools:

**Tool: calculator**
Input: { expression: string }
Logic: Use mathjs to evaluate the expression safely. Return result and steps.

**Tool: solve_equation**
Input: { equation: string, variable: string }
Logic: Use mathjs to solve for the variable. Return step-by-step working as an array of strings.

**Tool: unit_converter**
Input: { value: number, from_unit: string, to_unit: string }
Logic: Support SI units, imperial, energy (J, eV, kcal), angles (deg, rad), temperature. Return converted value and the conversion factor chain.

**Tool: matrix_operation**
Input: { matrix_a: number[][], matrix_b?: number[][], operation: "determinant"|"inverse"|"multiply"|"eigenvalues"|"transpose" }
Logic: Use mathjs for all operations. Return result matrix and intermediate steps.

**Tool: plot_function**
Input: { expression: string, type: "2d"|"3d"|"parametric"|"polar", x_range?: [number,number], y_range?: [number,number], curve_type?: string }
Logic: Parse and return the data points needed to plot. The frontend renders with Plotly.

**Tool: compare_functions**
Input: { expressions: string[], x_range: [number,number] }
Logic: Evaluate all functions over the range, find intersections numerically, return all datasets.

The agent API route is at /api/chat. It runs an agentic loop: call Groq, if tool_calls are returned execute the tools, append results, call Groq again, repeat until a final text response.

---

## FEATURE 2: 2D AND 3D SCIENTIFIC GRAPHING

Build a <GraphPanel> component that renders based on the agent's plot tool output.

Support these named curve types (with their formulas pre-loaded in a CurveLibrary):
- Parabola: y = ax² + bx + c
- Hyperbola: x²/a² - y²/b² = 1 (parametric form)
- Ellipse: x²/a² + y²/b² = 1 (parametric form)
- Circle
- Sine / Cosine / Tangent
- Lissajous curves: x=A·sin(at+δ), y=B·sin(bt)
- Cycloid: x=r(t-sin t), y=r(1-cos t)
- Butterfly curve (polar): r = e^(sin θ) - 2cos(4θ)
- Archimedean spiral: r = aθ
- Cardioid: r = a(1 + cos θ)
- Rose curve: r = cos(nθ)
- Astroid: x = a·cos³t, y = a·sin³t
- 3D surfaces: z = sin(√(x²+y²)), saddle, paraboloid, torus
- 3D parametric curves: helix

Each curve has an info tooltip explaining its equation and properties.

The GraphPanel has:
- Tabs: 2D Cartesian | Polar | 3D Surface | 3D Parametric | Parametric 2D
- Zoom, pan, axis labels
- Toggle grid
- Export graph as PNG
- Copy equation as LaTeX button on every graph

---

## FEATURE 3: COMPARISON MODE

A dedicated panel (accessible via button or agent trigger) where:
- Up to 4 function expressions can be entered manually or from chat
- All are plotted on the same axes with distinct colors
- Intersection points are computed numerically and marked with dots + coordinates
- Each function has a color legend and on/off toggle
- Animated entrance for each new function (Framer Motion)

---

## FEATURE 4: STEP-BY-STEP SOLVER

When the solve_equation or calculator tool is called, render a <StepByStepSolver> component:
- Each step appears as an animated card (Framer Motion stagger)
- Equations are rendered with KaTeX
- Final answer is highlighted
- A "copy steps" button exports all steps as LaTeX
- Suggested follow-up prompts shown below (e.g. "Plot this equation", "Solve for another variable", "What does this mean geometrically?")

---

## FEATURE 5: UNIT CONVERTER TOOL UI

When the unit_converter tool is called, render a visual chain:
- Input value → conversion factor → output value
- Animated left-to-right flow (Framer Motion)
- Multi-step chains shown as a sequence of cards
- Support: length, mass, time, energy, temperature, angle, pressure, data storage

---

## FEATURE 6: MATRIX VISUALIZATION

When the matrix_operation tool is called:
- Render the input matrix(es) as styled grids
- Animate the transformation (fade/scale with Framer Motion)
- Show the result matrix
- For eigenvalues: show the eigenvectors as arrows on a 2D Plotly plot
- For determinant: explain the geometric meaning (area/volume scaling)

---

## FEATURE 7: ANALYTICS DASHBOARD (/analytics)

A full-page analytics dashboard with the following panels:

1. **Session Overview** — animated counters (Framer Motion) for: Total queries, Tool calls made, Graphs generated, Equations solved

2. **Query History Table** — searchable, filterable table of all past prompts, timestamps, tool used, and result type

3. **Tool Usage Bar Chart** (Recharts) — how many times each tool was called

4. **Computation Heatmap** (Recharts) — a grid showing query activity by hour of day × day of week

5. **Query Type Distribution** (Recharts Pie) — breakdown: arithmetic, graphing, equations, unit conversion, matrix ops

6. **Response Time Line Chart** (Recharts) — time-series of Groq API response latency per query

7. **Top Expressions** — most-evaluated expressions ranked by frequency

8. **Graph Gallery** — thumbnail grid of all graphs generated in the session, click to expand

All data is stored in Zustand and persisted in localStorage.

---

## FEATURE 8: GRAPH MEMORY + CONVERSATION LINKING

Each message in the chat that triggered a graph stores a reference to that graph.
When scrolling chat history, a small graph thumbnail is shown inline with the message.
Clicking it reopens the full graph in the GraphPanel.
The chat sidebar shows a "Graphs" tab listing all graphs generated in order.

---

## FEATURE 9: NOTEBOOK MODE (/notebook)

A split-pane layout:
- Left: a markdown-enabled scratchpad where the user can type notes and paste results from chat
- Right: a live preview with LaTeX rendering (KaTeX)
- "Import from chat" button pulls the last N results from the session into the notebook
- "Export as PDF" button uses jsPDF to render the notebook content to a downloadable PDF, including graphs as base64 images

---

## FEATURE 10: NATURAL LANGUAGE → FORMULA RECOGNITION

In the chat input and in the GraphPanel, if the user types a curve name (e.g. "butterfly curve", "lemniscate of Bernoulli", "Archimedean spiral"), the agent (or a local lookup table) automatically maps it to its parametric form and plots it without the user needing to know the equation.

Include a lookup table of at least 20 named curves with their formulas, parameter ranges, and a one-sentence description.

---

## UI / UX REQUIREMENTS

**Layout:**
- Sidebar (collapsible) with: Chat, Analytics, Notebook, Curve Library, Settings
- Main area is split: Chat on left (~45%), Graph/Result panel on right (~55%)
- Responsive: on mobile, panels stack vertically with tab switching

**Suggested Prompts:**
Show suggested prompt chips in these locations:
1. Home page: "Plot sin(x) vs cos(x)", "Solve x² - 5x + 6 = 0", "What is the determinant of [[1,2],[3,4]]?", "Convert 100 joules to eV", "Graph a 3D saddle surface", "Compare parabola and hyperbola"
2. Below every agent response: 3 contextually relevant follow-ups generated by the agent
3. In GraphPanel: curve-specific prompts like "Find intersections with y=0", "What is the derivative of this curve?", "Show this in 3D"
4. In Analytics: "Show my most used tool", "Export session report"

**Animations (all Framer Motion):**
- Page transitions: slide + fade
- Message bubbles: stagger in from bottom
- Graph panel: scale up from center on first render
- Step-by-step solver steps: stagger with slide-in-left
- Analytics counters: count up animation on mount
- Sidebar: smooth collapse/expand
- Tool call indicator: pulsing spinner while agent is executing tools
- Graph lines: animate drawing (SVG stroke-dashoffset or Plotly animation)

**Color scheme:**
- Dark mode by default
- Accent: electric violet (#7C3AED) for primary actions
- Secondary accent: cyan (#06B6D4) for graphs and math
- Background: #0F0F1A (deep navy-black)
- Surface: #1A1A2E
- Text: white / gray-400

---

## API ROUTES

POST /api/chat
- Body: { messages: Message[], session_id: string }
- Runs the agentic loop with Groq
- Returns: { message: string, tool_calls: ToolCall[], graph_data?: PlotlyData, steps?: string[] }

POST /api/export/pdf
- Body: { notebook_content: string, graphs: base64[] }
- Returns: PDF buffer

---

## ENV VARIABLES
GROQ_API_KEY=your_key_here

---

## PACKAGE.JSON DEPENDENCIES TO INSTALL
- groq-sdk
- mathjs
- react-plotly.js plotly.js
- recharts
- framer-motion
- zustand
- katex react-katex
- jspdf html2canvas
- @types/plotly.js

---
