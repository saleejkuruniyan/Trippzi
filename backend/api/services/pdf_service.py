import os
import uuid
from io import BytesIO
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from ..storage import R2Storage
from ..models import ItineraryDay, VisaRequirement

class PDFService:
    def __init__(self):
        self.storage = R2Storage()

    def get_itinerary_pdf_url(self, itinerary, user, base_url):
        """
        Main entry point to retrieve a PDF URL.
        Checks storage first, generates if missing.
        """
        country_slug = itinerary.country.slug if itinerary.country else "global"
        prefix = f"itinerary/{country_slug}/{itinerary.id}/"
        
        # 1. Check if PDF already exists in storage
        try:
            dirs, files = self.storage.listdir(prefix)
            pdf_files = [f for f in files if f.endswith('.pdf')]
            if pdf_files:
                return self.storage.url(f"{prefix}{pdf_files[0]}")
        except:
            pass

        # 2. Generate PDF fresh
        pdf_bytes = self.generate_pdf_bytes(itinerary, user, base_url)
        
        # 3. Upload to R2
        new_uuid = uuid.uuid4()
        r2_key = f"{prefix}{new_uuid}.pdf"
        self.storage.save(r2_key, ContentFile(pdf_bytes))
        
        return self.storage.url(r2_key)

    def generate_pdf_bytes(self, itinerary, user, base_url):
        """
        Generates PDF bytes using a triple-fallback rendering chain.
        """
        day_images = ItineraryDay.objects.filter(itinerary=itinerary)
        
        # Normalize days
        normalized_days = []
        for d in (itinerary.content or []):
            if isinstance(d, dict):
                if 'day_number' not in d and 'day' in d:
                    d['day_number'] = d['day']
            normalized_days.append(d)

        # Get Visa Requirements from Matrix
        visa_content = ""
        if itinerary.nationality and itinerary.country:
            rule = VisaRequirement.objects.filter(
                source_country=itinerary.nationality,
                destination_country=itinerary.country
            ).first()
            if rule:
                visa_content = rule.content
        
        if not visa_content and itinerary.country:
            visa_content = itinerary.country.visa_process

        context = {
            'itinerary': itinerary,
            'days': normalized_days,
            'day_images': day_images,
            'user': user,
            'visa_requirements': visa_content,
        }

        # --- ENGINE 1: WeasyPrint (Premium HTML/CSS) ---
        try:
            from weasyprint import HTML
            html_string = render_to_string('itinerary_pdf.html', context)
            return HTML(string=html_string, base_url=base_url).write_pdf()
        except (ImportError, OSError, Exception) as e:
            print(f"[PDFService] WeasyPrint failed: {str(e)}")

        # --- ENGINE 2: xhtml2pdf (Standard HTML/CSS) ---
        try:
            from xhtml2pdf import pisa
            html_string = render_to_string('itinerary_pdf.html', context)
            result = BytesIO()
            pisa_status = pisa.CreatePDF(html_string, dest=result)
            if pisa_status.err:
                raise Exception(f"xhtml2pdf rendering error: {pisa_status.err}")
            return result.getvalue()
        except Exception as ex:
            print(f"[PDFService] xhtml2pdf failed: {str(ex)}")

        # --- ENGINE 3: fpdf2 (Robust Fallback) ---
        try:
            from fpdf import FPDF
            
            class SafePDF(FPDF):
                def safe_text(self, text):
                    if not text: return ""
                    return str(text).encode('latin-1', 'replace').decode('latin-1')

            pdf = SafePDF()
            pdf.add_page()
            pdf.set_font("Helvetica", 'B', 16)
            pdf.cell(0, 10, pdf.safe_text(f"Itinerary: {itinerary.title}"), ln=True)
            pdf.ln(5)
            
            pdf.set_font("Helvetica", '', 12)
            pdf.cell(0, 10, pdf.safe_text(f"Destination: {itinerary.destination}"), ln=True)
            pdf.cell(0, 10, pdf.safe_text(f"Duration: {itinerary.duration_days} Days"), ln=True)
            pdf.ln(5)
            
            pdf.set_font("Helvetica", 'I', 10)
            pdf.multi_cell(0, 10, pdf.safe_text(itinerary.description))
            pdf.ln(10)
            
            for day in (normalized_days or []):
                pdf.set_font("Helvetica", 'B', 14)
                day_num = day.get('day_number', day.get('day', ''))
                theme = day.get('theme', '')
                pdf.cell(0, 10, pdf.safe_text(f"Day {day_num}: {theme}"), ln=True)
                pdf.ln(2)
                
                pdf.set_font("Helvetica", '', 10)
                for act in day.get('activities', []):
                    time = act.get('time', '')
                    activity = act.get('activity', '')
                    desc = act.get('description', '')
                    
                    pdf.set_font("Helvetica", 'B', 10)
                    pdf.cell(0, 8, pdf.safe_text(f"- {time}: {activity}"), ln=True)
                    pdf.set_font("Helvetica", '', 10)
                    pdf.multi_cell(0, 6, pdf.safe_text(desc))
                    pdf.ln(2)
                pdf.ln(5)
            
            return pdf.output()
        except Exception as final_ex:
            raise Exception(f"All PDF Engines failed. Last error: {str(final_ex)}")
