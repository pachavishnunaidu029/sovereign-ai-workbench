import { useState, useRef } from "react"
import Login from "./Login"

import {
  Shield,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Activity,
  Brain,
  ShieldCheck,
  Server,
  Lock,
  Database
} from "lucide-react"

const navigationItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Documents", icon: FileText },
  { name: "Coding Agent", icon: Brain },
  { name: "Assistant", icon: MessageSquare },
  { name: "Activity", icon: Activity },
  { name: "Models", icon: Brain },
  { name: "Security", icon: ShieldCheck }
]

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [activeItem, setActiveItem] = useState("Dashboard")

  const fileInputRef = useRef(null)

  const [documents, setDocuments] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [activitySteps, setActivitySteps] = useState([])

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])

  const [codingTask, setCodingTask] = useState("")
  const [codingResult, setCodingResult] = useState(null)


  // ================= DOCUMENT PROCESSING =================

  const handleFileSelect = (event) => {
    const file = event.target.files[0]

    if (file) {
      setSelectedFile(file)
      setIsProcessing(false)
    }
  }

  const createActivityStep = (
    text,
    status,
    time = new Date().toLocaleTimeString()
  ) => ({
    text,
    status,
    time
  })

  const handleProcessDocument = () => {
    if (!selectedFile) return

    setIsProcessing(true)

    const startTime = new Date()

    setActivitySteps([
      createActivityStep(
        "Document uploaded",
        "completed",
        startTime.toLocaleTimeString()
      ),
      createActivityStep(
        "OCR processing",
        "active",
        startTime.toLocaleTimeString()
      ),
      createActivityStep(
        "AI analysis",
        "pending",
        "--"
      ),
      createActivityStep(
        "Knowledge base search",
        "pending",
        "--"
      ),
      createActivityStep(
        "Generating approval note",
        "pending",
        "--"
      )
    ])

    setTimeout(() => {
      const time = new Date().toLocaleTimeString()

      setActivitySteps([
        createActivityStep(
          "Document uploaded",
          "completed",
          startTime.toLocaleTimeString()
        ),
        createActivityStep(
          "OCR completed",
          "completed",
          time
        ),
        createActivityStep(
          "AI analysis",
          "active",
          time
        ),
        createActivityStep(
          "Knowledge base search",
          "pending",
          "--"
        ),
        createActivityStep(
          "Generating approval note",
          "pending",
          "--"
        )
      ])
    }, 1000)

    setTimeout(() => {
      const time = new Date().toLocaleTimeString()

      setActivitySteps([
        createActivityStep(
          "Document uploaded",
          "completed",
          startTime.toLocaleTimeString()
        ),
        createActivityStep(
          "OCR completed",
          "completed",
          new Date(
            startTime.getTime() + 1000
          ).toLocaleTimeString()
        ),
        createActivityStep(
          "AI analysis completed",
          "completed",
          time
        ),
        createActivityStep(
          "Knowledge base search",
          "active",
          time
        ),
        createActivityStep(
          "Generating approval note",
          "pending",
          "--"
        )
      ])
    }, 2000)

    setTimeout(() => {
      const time = new Date().toLocaleTimeString()

      setActivitySteps([
        createActivityStep(
          "Document uploaded",
          "completed",
          startTime.toLocaleTimeString()
        ),
        createActivityStep(
          "OCR completed",
          "completed",
          new Date(
            startTime.getTime() + 1000
          ).toLocaleTimeString()
        ),
        createActivityStep(
          "AI analysis completed",
          "completed",
          new Date(
            startTime.getTime() + 2000
          ).toLocaleTimeString()
        ),
        createActivityStep(
          "Knowledge base searched",
          "completed",
          time
        ),
        createActivityStep(
          "Generating approval note",
          "active",
          time
        )
      ])
    }, 3000)

    setTimeout(() => {
      const time = new Date().toLocaleTimeString()

      setActivitySteps([
        createActivityStep(
          "Document uploaded",
          "completed",
          startTime.toLocaleTimeString()
        ),
        createActivityStep(
          "OCR completed",
          "completed",
          new Date(
            startTime.getTime() + 1000
          ).toLocaleTimeString()
        ),
        createActivityStep(
          "AI analysis completed",
          "completed",
          new Date(
            startTime.getTime() + 2000
          ).toLocaleTimeString()
        ),
        createActivityStep(
          "Knowledge base searched",
          "completed",
          new Date(
            startTime.getTime() + 3000
          ).toLocaleTimeString()
        ),
        createActivityStep(
          "Approval note generated",
          "completed",
          time
        )
      ])

      setIsProcessing(false)

      setDocuments((prev) => [
        ...prev,
        {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          status: "Processed"
        }
      ])

      // Keep selected file visible
      // setSelectedFile(null)

    }, 4000)
  }


  // ================= CODING AGENT =================

  const handleCodingAgent = () => {
    if (!codingTask.trim()) return

    setCodingResult({
      model: "qwen2.5-coder:1.5b",
      status: "PASSED",
      code: `def solve():
    numbers = [1, 2, 3, 4, 5]
    total = sum(numbers)
    print("Total:", total)

solve()`,
      output: "Total: 15"
    })
  }


  // ================= CHAT =================

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        text: userMessage
      }
    ])

    setChatInput("")

    setTimeout(() => {
      setChatMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          text:
            "I can analyze your confidential documents locally. No external AI calls are required."
        }
      ])
    }, 800)
  }


  // ================= LOGIN CHECK =================

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    )
  }


  // ================= UI =================

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="brand">

          <span className="shield">
            <Shield size={24} />
          </span>

          <span>
            SOVEREIGN AI WORKBENCH
          </span>

        </div>


        <div className="local-status">

          <span className="status-dot"></span>

          LOCAL MODE

        </div>

      </header>


      {/* ================= MAIN LAYOUT ================= */}

      <div className="main-layout">


        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          <div className="navigation">

            {navigationItems.map((item) => {

              const Icon = item.icon

              return (

                <div
                  key={item.name}
                  className={`nav-item ${activeItem === item.name ? "active" : ""
                    }`}
                  onClick={() => setActiveItem(item.name)}
                >

                  <Icon size={20} />

                  <span>
                    {item.name}
                  </span>

                </div>

              )
            })}

          </div>


          {/* Local System */}

          <div className="local-system">

            <div className="local-system-title">

              <span className="status-dot"></span>

              LOCAL SYSTEM

            </div>

            <div className="local-system-text">
              Secure
            </div>

          </div>

        </aside>


        {/* ================= WORKSPACE ================= */}

        <main className="workspace">


          {/* ================= DASHBOARD ================= */}

          {activeItem === "Dashboard" && (

            <>

              <h1>
                Welcome to your workspace
              </h1>

              <p className="workspace-subtitle">
                Your confidential AI operations, running locally.
              </p>


              <div className="dashboard-cards">


                {/* Documents */}

                <div
                  className="dashboard-card"
                  onClick={() => setActiveItem("Documents")}
                >

                  <div className="card-icon">
                    <FileText size={22} />
                  </div>

                  <div className="card-title">
                    DOCUMENTS
                  </div>

                  <div className="card-number">
                    {documents.length}
                  </div>

                  <div className="card-description">
                    Local confidential files
                  </div>

                </div>


                {/* Models */}

                <div
                  className="dashboard-card"
                  onClick={() => setActiveItem("Models")}
                >

                  <div className="card-icon">
                    <Brain size={22} />
                  </div>

                  <div className="card-title">
                    AI MODELS
                  </div>

                  <div className="card-number">
                    2
                  </div>

                  <div className="card-description">
                    Available local models
                  </div>

                </div>


                {/* Security */}

                <div
                  className="dashboard-card"
                  onClick={() => setActiveItem("Security")}
                >

                  <div className="card-icon">
                    <Lock size={22} />
                  </div>

                  <div className="card-title">
                    SECURITY
                  </div>

                  <div className="card-number">
                    100%
                  </div>

                  <div className="card-description">
                    External calls blocked
                  </div>

                </div>

              </div>

            </>

          )}


          {/* ================= DOCUMENTS ================= */}

          {activeItem === "Documents" && (

            <>

              <h1>
                Documents
              </h1>

              <p className="workspace-subtitle">
                Manage confidential documents locally.
              </p>


              <div className="upload-area">

                <FileText size={42} />

                <h2>
                  Upload confidential document
                </h2>

                <p>
                  PDF, DOCX, PNG or JPG files
                </p>


                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                />


                <button
                  className="upload-button"
                  onClick={() =>
                    fileInputRef.current.click()
                  }
                >
                  Choose File
                </button>


                {selectedFile && (

                  <div className="selected-file">

                    <FileText size={18} />

                    <div>

                      <span>
                        Selected file
                      </span>

                      <strong>
                        {selectedFile.name}
                      </strong>

                    </div>

                  </div>

                )}


                {selectedFile && (

                  <button
                    className="process-button"
                    onClick={handleProcessDocument}
                    disabled={isProcessing}
                  >

                    {isProcessing
                      ? "Processing..."
                      : "Process Document"}

                  </button>

                )}


                {isProcessing && (

                  <div className="processing-status">

                    <span className="status-dot"></span>

                    Processing document locally...

                  </div>

                )}


                {documents.length > 0 && (

                  <div className="processed-documents">

                    <h3>
                      Processed Documents
                    </h3>


                    {documents.map((document, index) => (

                      <div
                        className="processed-document"
                        key={`${document.name}-${index}`}
                      >

                        <FileText size={18} />

                        <div>

                          <strong>
                            {document.name}
                          </strong>

                          <span>
                            Processed locally
                          </span>

                        </div>

                      </div>

                    ))}

                  </div>

                )}


                <p className="upload-security">
                  🔒 Files remain inside the local environment
                </p>

              </div>


              {/* ================= INSPECTION ANALYSIS ================= */}

              {selectedFile && (

                <div className="inspection-results">

                  <h2>
                    Inspection Analysis
                  </h2>


                  <div className="inspection-summary">

                    <div className="result-card">

                      <span className="result-label">
                        MODEL USED
                      </span>

                      <strong>
                        qwen2.5:1.5b
                      </strong>

                    </div>


                    <div className="result-card">

                      <span className="result-label">
                        PROCESSING
                      </span>

                      <strong>
                        LOCAL / ON-PREMISE ✓
                      </strong>

                    </div>


                    <div className="result-card">

                      <span className="result-label">
                        STATUS
                      </span>

                      <strong>
                        ANALYSIS COMPLETE
                      </strong>

                    </div>

                  </div>


                  <div className="result-section">

                    <h3>
                      Overall Assessment
                    </h3>

                    <div className="assessment">
                      HIGH RISK
                    </div>

                  </div>


                  <div className="result-section">

                    <h3>
                      Findings
                    </h3>

                    <ul>

                      <li>
                        Visible component wear detected
                      </li>

                      <li>
                        Potential maintenance issue identified
                      </li>

                      <li>
                        Further inspection recommended
                      </li>

                    </ul>

                  </div>


                  <div className="result-section">

                    <h3>
                      Recommended Actions
                    </h3>

                    <ul>

                      <li>
                        Perform detailed component inspection
                      </li>

                      <li>
                        Schedule preventive maintenance
                      </li>

                      <li>
                        Verify equipment safety before operation
                      </li>

                    </ul>

                  </div>


                  <div className="report-section">

                    <h3>
                      Generated Inspection Report
                    </h3>

                    <p>
                      Inspection_Report.docx
                    </p>

                    <button
                      className="process-button"
                      onClick={() => {

                        const report = `SOVEREIGN AI WORKBENCH
Inspection Report

Model: qwen2.5:1.5b
Processing: Local / On-Premise
Status: Analysis Complete
Assessment: HIGH RISK

Findings:
- Visible component wear detected
- Potential maintenance issue identified
- Further inspection recommended

Recommended Actions:
- Perform detailed component inspection
- Schedule preventive maintenance
- Verify equipment safety before operation
`

                        const blob = new Blob(
                          [report],
                          {
                            type: "text/plain"
                          }
                        )

                        const url =
                          URL.createObjectURL(blob)

                        const link =
                          document.createElement("a")

                        link.href = url
                        link.download =
                          "Inspection_Report.txt"

                        link.click()

                        URL.revokeObjectURL(url)

                      }}
                    >
                      Download Report
                    </button>

                  </div>

                </div>

              )}

            </>

          )}


          {/* ================= CODING AGENT ================= */}

          {activeItem === "Coding Agent" && (

            <>

              <h1>
                Coding Agent
              </h1>

              <p className="workspace-subtitle">
                Generate, verify and execute code using local AI.
              </p>


              <div className="coding-panel">

                <h2>
                  Coding Task
                </h2>

                <textarea
                  className="coding-input"
                  placeholder="Describe the coding task you want the local AI agent to solve..."
                  value={codingTask}
                  onChange={(event) =>
                    setCodingTask(event.target.value)
                  }
                />

                <button
                  className="process-button"
                  onClick={handleCodingAgent}
                  disabled={!codingTask.trim()}
                >
                  Run Coding Agent
                </button>


                {codingResult && (

                  <div className="coding-result">

                    <div className="coding-result-header">

                      <h2>
                        Verification Result
                      </h2>

                      <div className="coding-result-meta">

                        <span>
                          MODEL: {codingResult.model}
                        </span>

                        <span className="coding-status">
                          {codingResult.status}
                        </span>

                      </div>

                    </div>


                    <div className="result-section">

                      <h3>
                        Generated Code
                      </h3>

                      <pre className="code-output">
                        {codingResult.code}
                      </pre>

                    </div>


                    <div className="result-section">

                      <h3>
                        Execution Output
                      </h3>

                      <pre className="code-output">
                        {codingResult.output}
                      </pre>

                    </div>

                  </div>

                )}

              </div>

            </>

          )}


          {/* ================= ASSISTANT ================= */}

          {activeItem === "Assistant" && (

            <>

              <h1>
                AI Assistant
              </h1>

              <p className="workspace-subtitle">
                Ask questions and work with your confidential documents.
              </p>


              <div className="chat-panel">


                <div className="chat-header">

                  <div>

                    <h2>
                      Local AI Assistant
                    </h2>

                    <span>
                      ● Running locally
                    </span>

                  </div>

                  <div className="chat-model">
                    qwen2.5:1.5b
                  </div>

                </div>


                <div className="chat-messages">

                  {chatMessages.length === 0 ? (

                    <>

                      <div className="assistant-message">

                        <div className="message-icon">
                          <Brain size={18} />
                        </div>

                        <div>

                          <strong>
                            Local AI Assistant
                          </strong>

                          <p>
                            Hello! I can analyze your confidential
                            documents, search the local knowledge base,
                            and help generate work deliverables.
                          </p>

                        </div>

                      </div>


                      <div className="chat-hint">

                        Try asking:

                        <br />

                        <strong>
                          "Analyze the uploaded inspection report."
                        </strong>

                      </div>

                    </>

                  ) : (

                    chatMessages.map((message, index) => (

                      <div
                        key={index}
                        className={
                          message.role === "user"
                            ? "user-message"
                            : "assistant-message"
                        }
                      >

                        <div className="message-icon">

                          {message.role === "user"
                            ? "U"
                            : <Brain size={18} />}

                        </div>


                        <div>

                          <strong>

                            {message.role === "user"
                              ? "You"
                              : "Local AI Assistant"}

                          </strong>

                          <p>
                            {message.text}
                          </p>

                        </div>

                      </div>

                    ))

                  )}

                </div>


                <div className="chat-input-area">

                  <input
                    type="text"
                    placeholder="Ask your confidential AI assistant..."
                    value={chatInput}
                    onChange={(event) =>
                      setChatInput(event.target.value)
                    }
                    onKeyDown={(event) => {

                      if (event.key === "Enter") {
                        handleSendMessage()
                      }

                    }}
                  />


                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>

                </div>


                <div className="chat-security">

                  🔒 Your conversation stays inside the local environment

                </div>

              </div>

            </>

          )}


          {/* ================= ACTIVITY ================= */}

          {activeItem === "Activity" && (

            <>

              <h1>
                Agent Activity
              </h1>

              <p className="workspace-subtitle">
                Monitor local AI agent operations.
              </p>


              <div className="activity-panel">

                {activitySteps.length === 0 ? (

                  <div className="section-placeholder">

                    <Activity size={40} />

                    <h2>
                      No active workflows
                    </h2>

                    <p>
                      Process a document to see agent activity.
                    </p>

                  </div>

                ) : (

                  <>

                    <h2 className="activity-title">
                      Document Processing Workflow
                    </h2>


                    <div className="activity-list">

                      {activitySteps.map((step, index) => (

                        <div
                          className={`activity-step ${step.status}`}
                          key={index}
                        >

                          <div className="activity-indicator">

                            {step.status === "completed" && "✓"}

                            {step.status === "active" && "●"}

                            {step.status === "pending" && "○"}

                          </div>


                          <div className="activity-step-content">

                            <span>
                              {step.text}
                            </span>

                            <small>
                              {step.time}
                            </small>

                          </div>

                        </div>

                      ))}

                    </div>

                  </>

                )}

              </div>

            </>

          )}


          {/* ================= MODELS ================= */}

          {activeItem === "Models" && (

            <>

              <h1>
                AI Models
              </h1>

              <p className="workspace-subtitle">
                Local open-weight models available to the workbench.
              </p>


              <div className="models-panel">


                <div className="model-header">

                  <div>

                    <h2>
                      Available Local Models
                    </h2>

                    <p>
                      Models are executed inside the local environment.
                    </p>

                  </div>

                  <div className="local-badge">
                    ● LOCAL
                  </div>

                </div>


                <div className="model-list">


                  {/* Qwen 2.5 1.5B */}

                  <div className="model-card">

                    <div className="model-icon">
                      <Brain size={22} />
                    </div>

                    <div className="model-info">

                      <h3>
                        qwen2.5:1.5b
                      </h3>

                      <p>
                        General and industrial inspection analysis
                      </p>

                      <span className="model-type">
                        Multimodal / Analysis
                      </span>

                    </div>

                    <div className="model-status">
                      Available
                    </div>

                  </div>


                  {/* Qwen2.5-Coder 1.5B */}

                  <div className="model-card">

                    <div className="model-icon">
                      <Brain size={22} />
                    </div>

                    <div className="model-info">

                      <h3>
                        qwen2.5-coder:1.5b
                      </h3>

                      <p>
                        Local code generation and verification
                      </p>

                      <span className="model-type">
                        Coding
                      </span>

                    </div>

                    <div className="model-status">
                      Available
                    </div>

                  </div>

                </div>


                {/* Automatic Model Selection */}

                <div className="routing-box">

                  <div className="routing-icon">
                    <Activity size={20} />
                  </div>

                  <div>

                    <h3>
                      Automatic Model Selection
                    </h3>

                    <p>
                      The workbench selects the most suitable
                      local model based on the current task.
                    </p>

                  </div>

                  <span className="routing-status">
                    ENABLED
                  </span>

                </div>

              </div>

            </>

          )}


          {/* ================= SECURITY ================= */}

          {activeItem === "Security" && (

            <>

              <h1>
                Security & Sovereignty
              </h1>

              <p className="workspace-subtitle">
                Monitor the security status of your AI environment.
              </p>


              <div className="security-status">


                {/* Inference */}

                <div className="security-item">

                  <Server size={22} />

                  <div>

                    <strong>
                      Inference
                    </strong>

                    <span>
                      Running locally
                    </span>

                  </div>

                </div>


                {/* External Calls */}

                <div className="security-item">

                  <Lock size={22} />

                  <div>

                    <strong>
                      External Calls
                    </strong>

                    <span>
                      0 detected
                    </span>

                  </div>

                </div>


                {/* Data Storage */}

                <div className="security-item">

                  <Database size={22} />

                  <div>

                    <strong>
                      Data Storage
                    </strong>

                    <span>
                      Local environment
                    </span>

                  </div>

                </div>

              </div>

            </>

          )}

        </main>

      </div>

    </div>
  )
}

export default App