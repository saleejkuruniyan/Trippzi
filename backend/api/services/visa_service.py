from datetime import datetime, timedelta
from django.utils import timezone
from ..models import VisaRequirement, Country
from .search_service import SearchService
import json

class VisaService:
    def __init__(self, ai_engine):
        self.ai_engine = ai_engine
        self.search_service = SearchService()

    def get_visa_info(self, source_country_obj, destination_country_obj):
        """
        Retrieves visa info from DB if fresh (< 2 months), otherwise fetches from AI/Tavily.
        """
        if not source_country_obj or not destination_country_obj:
            return ""

        # 1. Check existing record
        requirement = VisaRequirement.objects.filter(
            source_country=source_country_obj,
            destination_country=destination_country_obj
        ).first()

        two_months_ago = timezone.now() - timedelta(days=60)

        if requirement and requirement.updated_at > two_months_ago:
            return requirement.content

        # 2. If not found or stale, fetch from AI/Tavily
        print(f"[VisaService] Refreshing visa info: {source_country_obj.name} -> {destination_country_obj.name}")
        visa_context = self.search_service.search_visa_info(source_country_obj.name, destination_country_obj.name)
        
        messages = [
            ("system", "You are a visa expert. Provide a detailed, end-to-end visa application process in markdown format."),
            ("user", f"Based on this search context: {visa_context}\n\nProvide the SPECIFIC and DETAILED visa process for {source_country_obj.name} citizens visiting {destination_country_obj.name}. Include documents, fees, and processing times. Return ONLY the markdown content.")
        ]
        
        try:
            raw_content = self.ai_engine.low_cost_llm.invoke(messages).content
            content = self.ai_engine._clean_ai_text(raw_content)
            
            # Save/Update DB
            if not requirement:
                requirement = VisaRequirement(
                    source_country=source_country_obj,
                    destination_country=destination_country_obj
                )
            requirement.content = content
            requirement.save()
            
            return content
        except Exception as e:
            print(f"[VisaService] Error: {str(e)}")
            return requirement.content if requirement else destination_country_obj.visa_process
