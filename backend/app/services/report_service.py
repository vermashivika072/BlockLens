import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch

def generate_pdf_report(certificate_data: dict, analysis_data: dict, blockchain_data: dict) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = styles['Title']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Custom styles
    custom_normal = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        leading=14
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("CertiChain Aura", title_style))
    elements.append(Paragraph("Official Forensic Audit Report", heading_style))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Verification Status
    is_real = certificate_data.get("verification_status", "").lower() == "real"
    status_text = "GENUINE" if is_real else "TAMPERED / FAKE"
    status_color = colors.green if is_real else colors.red
    
    status_style = ParagraphStyle(
        'StatusStyle',
        parent=styles['Heading3'],
        textColor=status_color,
        fontSize=14,
        spaceAfter=14
    )
    elements.append(Paragraph(f"Verdict: {status_text}", status_style))
    
    # Certificate Info Table
    data = [
        ['Certificate ID', certificate_data.get('certificate_id', 'N/A')],
        ['Name', certificate_data.get('name', 'N/A')],
        ['Issuer', certificate_data.get('issuer', 'N/A')],
        ['Issue Date', certificate_data.get('issue_date', 'N/A')],
        ['Score', f"{int((certificate_data.get('authenticity_score') or 0) * 100)}%"]
    ]
    
    t = Table(data, colWidths=[1.5*inch, 4*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (1, 0), (1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.25 * inch))
    
    # Blockchain Ledger Record
    elements.append(Paragraph("Blockchain Ledger Record", heading_style))
    tx_hash = blockchain_data.get('hash') if blockchain_data else certificate_data.get('blockchain_hash', 'Not Recorded')
    elements.append(Paragraph(f"Transaction Hash: {tx_hash}", custom_normal))
    elements.append(Spacer(1, 0.25 * inch))
    
    # AI Analysis Summary
    elements.append(Paragraph("AI Deep Learning Audit", heading_style))
    auditor_data = analysis_data.get('auditor') or {}
    explanation = auditor_data.get('explanation', 'No explanation provided.') if isinstance(auditor_data, dict) else str(auditor_data)
    
    # If explanation is a list, join it into a single string
    if isinstance(explanation, list):
        explanation = " ".join(str(item) for item in explanation)
    elif not isinstance(explanation, str):
        explanation = str(explanation)
        
    # Clean up explanation text (remove Markdown if any, and escape XML characters)
    explanation = explanation.replace("**", "").replace("*", "")
    explanation = explanation.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    
    elements.append(Paragraph(explanation, custom_normal))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
