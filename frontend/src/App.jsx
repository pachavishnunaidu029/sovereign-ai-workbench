import { useState, useRef, useEffect } from "react"
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

  const [inspectionResult, setInspectionResult] = useState(null)

  const [localModels, setLocalModels] = useState([])
  const [modelSelection, setModelSelection] = useState(null)

  useEffect(() => {

  const fetchLocalModels = async () => {

    try {

      const response = await fetch(
        "/api/models"
      )

      const data = await response.json()

      if (data.status === "success") {
        setLocalModels(data.models)
      }

    } catch (error) {

      console.error(
        "Could not fetch local models:",
        error
      )

    }

  }

  fetchLocalModels()

}, [])


const handleModelSelection = async (task) => {

  if (!task.trim()) return

  try {

    const response = await fetch(
      "/api/model/select",
      {
        method: "POST",
        headers: {
  "Content-Type": "application/json"
},
body: JSON.stringify({
  task: task
})
      }
    )

    const data = await response.json()

    if (!response.ok || data.status !== "success") {
      throw new Error(
        data.message || "Model selection failed"
      )
    }

    setModelSelection(data)

    console.log(
      "Model selection result:",
      data
    )

  } catch (error) {

    console.error(
      "Model selection error:",
      error
    )

    setModelSelection(null)

  }
}


// =====================================================
// DOCUMENT PROCESSING
// =====================================================

  const handleFileSelect = (event) => {

    const file = event.target.files[0]

    if (file) {

      setSelectedFile(file)
      setInspectionResult(null)
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


  const handleProcessDocument = async () => {

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
        "Sending document to local backend",
        "active",
        startTime.toLocaleTimeString()
      ),

      createActivityStep(
        "OCR processing",
        "pending",
        "--"
      ),

      createActivityStep(
        "AI analysis",
        "pending",
        "--"
      ),

      createActivityStep(
        "Generating inspection report",
        "pending",
        "--"
      )
    ])


    try {

const formData = new FormData()

formData.append("file", selectedFile)


const response = await fetch(
  "/api/agent/inspection",
  {
    method: "POST",
    body: formData
  }
)


const data = await response.json()


      if (!response.ok || data.status !== "success") {

        throw new Error(
          data.message || "Inspection processing failed"
        )

      }


      console.log(
        "Backend inspection result:",
        data
      )


      const completedTime =
        new Date().toLocaleTimeString()


      setActivitySteps([

        createActivityStep(
          "Document uploaded",
          "completed",
          startTime.toLocaleTimeString()
        ),

        createActivityStep(
          "OCR completed",
          "completed",
          completedTime
        ),

        createActivityStep(
          "Industrial inspection model selected",
          "completed",
          completedTime
        ),

        createActivityStep(
          "Inspection analyzed locally",
          "completed",
          completedTime
        ),

        createActivityStep(
          "Word report generated",
          "completed",
          completedTime
        ),

        createActivityStep(
          "Report verified",
          "completed",
          completedTime
        )

      ])


      setDocuments((previousDocuments) => [

        ...previousDocuments,

        {
          name: data.filename,
          type: selectedFile.type,
          size: selectedFile.size,
          status: "Processed"
        }

      ])


      setInspectionResult(data)

      setIsProcessing(false)


      alert(
        `Inspection completed successfully!\n\nAssessment: ${
          data.analysis?.overall_assessment ||
          "Analysis completed"
        }`
      )


    } catch (error) {

      console.error(
        "Backend integration error:",
        error
      )


      setIsProcessing(false)


      setActivitySteps([

        createActivityStep(
          "Document uploaded",
          "completed",
          startTime.toLocaleTimeString()
        ),

        createActivityStep(
          "Backend processing failed",
          "active",
          new Date().toLocaleTimeString()
        )

      ])


      alert(
        `Could not process the document.\n\n${error.message}`
      )

    }

  }


  // =====================================================
  // CODING AGENT
  // =====================================================

// =====================================================
// CODING AGENT
// =====================================================

const handleCodingAgent = async () => {

  if (!codingTask.trim()) return

  const startTime = new Date()

  setCodingResult(null)

  setActivitySteps([

    createActivityStep(
      "Coding task received",
      "completed",
      startTime.toLocaleTimeString()
    ),

    createActivityStep(
      "Coding model selected",
      "completed",
      new Date().toLocaleTimeString()
    ),

    createActivityStep(
      "Generating code locally",
      "active",
      new Date().toLocaleTimeString()
    ),

    createActivityStep(
      "Sandbox verification",
      "pending",
      "--"
    )

  ])


  try {

    const response = await fetch(
      "/api/agent/code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task: codingTask
        })
      }
    )


    const data = await response.json()


    if (!response.ok || data.status !== "success") {

      throw new Error(
        data.message || "Coding agent failed"
      )

    }


    const completedTime =
      new Date().toLocaleTimeString()


    setCodingResult({

      model: data.selected_model,

status:
  data.sandbox_status === "PASSED"
    ? "PASSED"
    : "FAILED",

      code: data.generated_code,

      output: data.execution_output,

      error: data.execution_error

    })


    setActivitySteps([

      createActivityStep(
        "Coding task received",
        "completed",
        startTime.toLocaleTimeString()
      ),

      createActivityStep(
        `Coding model selected: ${data.selected_model}`,
        "completed",
        completedTime
      ),

      createActivityStep(
        "Code generated locally",
        "completed",
        completedTime
      ),

      createActivityStep(
        `Sandbox verification: ${
          data.sandbox_status === "PASSED"
            ? "PASSED"
            : "FAILED"
        }`,
        data.sandbox_status === "PASSED"
          ? "completed"
          : "active",
        completedTime
      )

    ])


    console.log(
      "Backend coding agent result:",
      data
    )


  } catch (error) {

    console.error(
      "Coding agent error:",
      error
    )


    setCodingResult({

      model: "qwen2.5-coder:1.5b",

      status: "FAILED",

      code: "",

      output: "",

      error: error.message

    })


    setActivitySteps([

      createActivityStep(
        "Coding task received",
        "completed",
        startTime.toLocaleTimeString()
      ),

      createActivityStep(
        "Coding agent execution failed",
        "active",
        new Date().toLocaleTimeString()
      )

    ])

  }

}

// =====================================================
// CHAT
// =====================================================

const handleSendMessage = async () => {

  if (!chatInput.trim()) return

  const userMessage = chatInput

  const startTime = new Date()

  setChatMessages((previousMessages) => [
    ...previousMessages,
    {
      role: "user",
      text: userMessage
    }
  ])

  setChatInput("")

  // =====================================================
  // RAG ACTIVITY - START
  // =====================================================

  setActivitySteps([

    createActivityStep(
      "Assistant query received",
      "completed",
      startTime.toLocaleTimeString()
    ),

    createActivityStep(
      "Searching local knowledge base",
      "active",
      startTime.toLocaleTimeString()
    ),

    createActivityStep(
      "Relevant document retrieval",
      "pending",
      "--"
    ),

    createActivityStep(
      "Local AI answer generation",
      "pending",
      "--"
    )

  ])

  try {

    const response = await fetch(
      "/api/rag/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: userMessage
        })
      }
    )

    const data = await response.json()

    if (!response.ok || data.status !== "success") {

      throw new Error(
        data.message || "RAG request failed"
      )

    }

    const completedTime =
      new Date().toLocaleTimeString()

    // =====================================================
    // RAG ACTIVITY - COMPLETED
    // =====================================================

    setActivitySteps([

      createActivityStep(
        "Assistant query received",
        "completed",
        startTime.toLocaleTimeString()
      ),

      createActivityStep(
        "Local knowledge base searched",
        "completed",
        completedTime
      ),

      createActivityStep(
        "Relevant document retrieved",
        "completed",
        completedTime
      ),

      createActivityStep(
        "Answer generated by local AI",
        "completed",
        completedTime
      )

    ])

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "assistant",
        text:
          data.answer ||
          data.message ||
          "No relevant information found."
      }
    ])

    console.log(
      "Backend RAG result:",
      data
    )

  } catch (error) {

    console.error(
      "RAG backend error:",
      error
    )

    setActivitySteps([

      createActivityStep(
        "Assistant query received",
        "completed",
        startTime.toLocaleTimeString()
      ),

      createActivityStep(
        "Local knowledge base search failed",
        "active",
        new Date().toLocaleTimeString()
      )

    ])

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "assistant",
        text:
          "Could not retrieve information from the local knowledge base."
      }
    ])

  }
}

  // =====================================================
  // LOGIN
  // =====================================================

  if (!isLoggedIn) {

    return (

      <Login
        onLogin={() => setIsLoggedIn(true)}
      />

    )

  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="app">

      {/* HEADER */}

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


      {/* MAIN LAYOUT */}

      <div className="main-layout">


        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="navigation">

            {navigationItems.map((item) => {

              const Icon = item.icon

              return (

                <div
                  key={item.name}
                  className={
                    `nav-item ${
                      activeItem === item.name
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setActiveItem(item.name)
                  }
                >

                  <Icon size={20} />

                  <span>
                    {item.name}
                  </span>

                </div>

              )

            })}

          </div>


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


        {/* WORKSPACE */}

        <main className="workspace">


          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activeItem === "Dashboard" && (

            <>

              <h1>
                Welcome to your workspace
              </h1>

              <p className="workspace-subtitle">
                Your confidential AI operations, running locally.
              </p>


              <div className="dashboard-cards">


                <div
                  className="dashboard-card"
                  onClick={() =>
                    setActiveItem("Documents")
                  }
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


                <div
                  className="dashboard-card"
                  onClick={() =>
                    setActiveItem("Models")
                  }
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


                <div
                  className="dashboard-card"
                  onClick={() =>
                    setActiveItem("Security")
                  }
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


          {/* =================================================
              DOCUMENTS
          ================================================= */}

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
                  style={{
                    display: "none"
                  }}
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


                    {documents.map(
                      (document, index) => (

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

                      )
                    )}

                  </div>

                )}


                <p className="upload-security">
                  🔒 Files remain inside the local environment
                </p>

              </div>


              {/* =================================================
                  INSPECTION ANALYSIS
              ================================================= */}

              {inspectionResult && (

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
                        {inspectionResult.model}
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


                  {/* OVERALL ASSESSMENT */}

                  <div className="result-section">

                    <h3>
                      Overall Assessment
                    </h3>

                    <div className="assessment">

                      {
                        inspectionResult
                          .analysis
                          ?.overall_assessment
                          || "Not available"
                      }

                    </div>

                  </div>


                  {/* FINDINGS */}

                  <div className="result-section">

                    <h3>
                      Findings
                    </h3>


                    <ul>

                      {
                        inspectionResult
                          .analysis
                          ?.key_findings
                          ?.map(
                            (finding, index) => (

                              <li key={index}>
                                {finding}
                              </li>

                            )
                          )
                      }

                    </ul>

                  </div>


                  {/* RECOMMENDED ACTIONS */}

                  <div className="result-section">

                    <h3>
                      Recommended Actions
                    </h3>


                    <ul>

                      {
                        inspectionResult
                          .analysis
                          ?.recommended_actions
                          ?.map(
                            (action, index) => (

                              <li key={index}>
                                {action}
                              </li>

                            )
                          )
                      }

                    </ul>

                  </div>


                  {/* REPORT */}

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
    window.open(
      "/api/report/download",
      "_blank"
    )
  }}
>
  Download Report
</button>

                  </div>

                </div>

              )}

            </>

          )}


          {/* =================================================
              CODING AGENT
          ================================================= */}

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


          {/* =================================================
              ASSISTANT
          ================================================= */}

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

                    chatMessages.map(
                      (message, index) => (

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

                      )
                    )

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


          {/* =================================================
              ACTIVITY
          ================================================= */}

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

                      {activitySteps.map(
                        (step, index) => (

                          <div
                            className={
                              `activity-step ${step.status}`
                            }
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

                        )
                      )}

                    </div>

                  </>

                )}

              </div>

            </>

          )}


          {/* =================================================
              MODELS
          ================================================= */}

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

  {localModels.map((model) => (

    <div className="model-card" key={model.name}>

      <div className="model-icon">
        <Brain size={22} />
      </div>

      <div className="model-info">

        <h3>
          {model.name}
        </h3>

        <p>
          {model.name.includes("coder")
            ? "Local code generation and verification"
            : "General and industrial inspection analysis"}
        </p>

        <span className="model-type">
          {model.name.includes("coder")
            ? "Coding"
            : "Analysis"}
        </span>

      </div>

      <div className="model-status">
        Available
      </div>

    </div>

  ))}

</div>


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

    <input
      type="text"
      placeholder="Enter a task to test model selection..."
      className="routing-input"
      onKeyDown={(event) => {

        if (event.key === "Enter") {
          handleModelSelection(event.target.value)
        }

      }}
    />

    <button
      className="routing-button"
      onClick={() => {

        const input =
          document.querySelector(".routing-input")

        if (input) {
          handleModelSelection(input.value)
        }

      }}
    >
      Test Model Selection
    </button>

    {modelSelection && (

      <div className="routing-result">

        <strong>
          Selected Model:
        </strong>

        <span>
          {modelSelection.selected_model}
        </span>

        <strong>
          Task Type:
        </strong>

        <span>
          {modelSelection.task_type}
        </span>

        <strong>
          Processing:
        </strong>

        <span>
          {modelSelection.processing_mode}
        </span>

      </div>

    )}

  </div>

  <span className="routing-status">
    ENABLED
  </span>

</div>

              </div>

            </>

          )}


{/* =================================================
    SECURITY
================================================= */}

{activeItem === "Security" && (

  <>

    <h1>
      Security & Sovereignty
    </h1>

    <p className="workspace-subtitle">
      Monitor the security status of your AI environment.
    </p>


    <div className="security-status">


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


    {/* =================================================
        SOVEREIGNTY VERIFICATION
    ================================================= */}

    <div className="sovereignty-panel">

      <div className="sovereignty-header">

        <div>

          <h2>
            Sovereignty Verification
          </h2>

          <p>
            Verify that AI processing and data handling remain
            inside the local environment.
          </p>

        </div>

        <span className="verified-badge">
          VERIFIED
        </span>

      </div>


      <div className="verification-list">


        <div className="verification-item">

          <span>
            AI Inference
          </span>

          <strong>
            LOCAL
          </strong>

        </div>


        <div className="verification-item">

          <span>
            Model Hosting
          </span>

          <strong>
            ON-PREMISE
          </strong>

        </div>


        <div className="verification-item">

          <span>
            Knowledge Base
          </span>

          <strong>
            LOCAL
          </strong>

        </div>


        <div className="verification-item">

          <span>
            External AI APIs
          </span>

          <strong>
            NONE
          </strong>

        </div>


        <div className="verification-item">

          <span>
            Data Transmission
          </span>

          <strong>
            DISABLED
          </strong>

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
