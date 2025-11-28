export interface RequestData {
  id: string
  student: string
  matricule: string
  subject: string
  type: string
  status: string
  date: string
  description: string
  level?: string
  field?: string
}

export function generateRequestPDF(request: RequestData) {
  const content = `
    ╔════════════════════════════════════════════╗
    ║   GRADE CONTESTATION REQUEST FORM         ║
    ╚════════════════════════════════════════════╝

    REQUEST INFORMATION
    ───────────────────────────────────────────
    Request ID: ${request.id}
    Submission Date: ${request.date}
    
    STUDENT INFORMATION
    ───────────────────────────────────────────
    Name: ${request.student}
    Matricule: ${request.matricule}
    Level: ${request.level || "N/A"}
    Field: ${request.field || "N/A"}
    
    REQUEST DETAILS
    ───────────────────────────────────────────
    Subject: ${request.subject}
    Request Type: ${request.type}
    Status: ${request.status.toUpperCase().replace("_", " ")}
    
    DESCRIPTION
    ───────────────────────────────────────────
    ${request.description}
    
    ═════════════════════════════════════════════
    Generated on: ${new Date().toLocaleString()}
    Print Quality: Original
  `

  const element = document.createElement("div")
  element.style.fontFamily = "monospace"
  element.style.whiteSpace = "pre-wrap"
  element.style.padding = "20px"
  element.textContent = content

  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (doc) {
    doc.body.innerHTML = `<pre style="font-family: monospace; padding: 20px;">${content}</pre>`
    setTimeout(() => {
      iframe.contentWindow?.print()
    }, 100)
  }
}
