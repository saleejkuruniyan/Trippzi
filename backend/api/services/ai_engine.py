import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from django.conf import settings
import json

from .search_service import SearchService

class AIEngine:
    def __init__(self):
        # Main model for creative planning
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_API_BASE,
            temperature=0.7,
        )
        # Low-cost model for data enrichment/extraction
        self.low_cost_llm = ChatOpenAI(
            model=settings.OPENAI_MODEL_LOWCOST,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_API_BASE,
            temperature=0.3, # Lower temp for extraction
        )
        self.search_service = SearchService()

    def _extract_json(self, text):
        """
        Helper to extract JSON from a potentially messy AI response.
        """
        try:
            # Try finding the first '{' and last '}'
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                json_str = text[start:end+1]
                return json.loads(json_str)
            return json.loads(text)
        except:
            # Try stripping markdown blocks
            clean_text = text.replace('```json', '').replace('```', '').strip()
            try:
                return json.loads(clean_text)
            except:
                return None

    def generate_itinerary(self, country, selected_destinations, duration, budget, style, interests, source_country="India"):
        """
        Generates a day-wise itinerary structure using AI enhanced with Tavily search.
        Tailors recommendations and VISA requirements for travelers from source_country.
        """
        # 1. Fetch real-time context from Tavily
        search_context = self.search_service.search_travel_info(country, selected_destinations, source_country)
        visa_context = self.search_service.search_visa_info(source_country, country)
        
        from datetime import datetime
        current_date_str = datetime.now().strftime("%B %Y")

        response_schemas = [
            ResponseSchema(name="title", description="A catchy title for the trip"),
            ResponseSchema(name="overview", description="A brief overview of the trip"),
            ResponseSchema(name="visa_requirements", description=f"Detailed end-to-end visa application process for {source_country} citizens visiting {country}. Include documents, fees, and processing times."),
            ResponseSchema(name="days", description="An array of daily plans. Each day should have a 'day_number', 'theme', and 'activities' (array of {time, activity, description, location, cost_estimate, opening_time, closing_time, duration_at_spot, distance_to_next, time_to_next, transport_to_next, unsplash_query})."),
            ResponseSchema(name="budget_breakdown", description="Estimated costs for transport, food, activities, and stay."),
            ResponseSchema(name="packing_list", description="Suggested packing items based on destination and duration."),
            ResponseSchema(name="local_tips", description="Important local customs or hacks.")
        ]
        
        output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = output_parser.get_format_instructions()

        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert travel consultant. Generate a highly detailed {duration}-day travel itinerary for {country} as of {current_date}.
            
            Real-time Travel Context:
            {search_context}
            
            Real-time Visa Context for {source_country} citizens:
            {visa_context}
            
            Strictly use ONLY these destinations within {country}: {selected_destinations}.
            
            User Preferences:
            - Traveler Passport Country: {source_country}
            - Budget: {budget}
            - Travel Style: {style}
            - Interests: {interests}
            
            Special Instructions for {source_country} travelers:
            - Suggest restaurants that are popular or highly rated by travelers from {source_country}.
            - Provide a SPECIFIC and DETAILED end-to-end visa process for {source_country} citizens. 
            - Mention if it's Visa-on-Arrival, E-Visa, or Sticker Visa. 
            - List EXACT documents needed for {source_country} passport holders.
            
            {format_instructions}
            
            Instructions for Activities:
            1. Include opening_time and closing_time (e.g., '09:00 AM', '05:00 PM').
            2. Include duration_at_spot (e.g., '2 hours').
            3. Include distance_to_next, time_to_next, and transport_to_next (e.g., '3km', '15 mins', 'Taxi/Walking').
            4. Provide an 'unsplash_query' which is a specific 3-4 word search term for Unsplash.
            5. IMPORTANT: In the 'description', if an attraction is known to be closed on specific weekdays (e.g. 'Closed on Mondays'), you MUST explicitly mention it.
            
            Ensure the itinerary is realistic, accounts for travel time, and includes specific, currently trending food recommendations.
            """
        )

        messages = prompt.format_messages(
            country=country,
            current_date=current_date_str,
            search_context=search_context,
            visa_context=visa_context,
            source_country=source_country,
            selected_destinations=", ".join(selected_destinations),
            duration=duration,
            budget=budget,
            style=style,
            interests=interests,
            format_instructions=format_instructions
        )

        try:
            response = self.llm.invoke(messages)
            return self._extract_json(response.content)
        except Exception as e:
            return {"error": str(e), "raw": getattr(e, 'content', '')}

    def refresh_country_data(self, country_obj):
        """
        Uses AI to update country-wide metadata like visa info and pro-tips.
        """
        search_context = self.search_service.search_visa_info("India", country_obj.name)
        
        messages = [
            ("system", "You are a data extractor. Convert the search context into a structured JSON format."),
            ("user", f"Context: {search_context}\n\nExtract: 1. visa_process (String, detailed), 2. best_time (String), 3. days_recommendation (Dictionary of dayCount: description). Return ONLY JSON.")
        ]
        
        try:
            data = self._extract_json(self.low_cost_llm.invoke(messages).content)
            if data:
                country_obj.visa_process = data.get('visa_process', country_obj.visa_process)
                country_obj.best_time = data.get('best_time', country_obj.best_time)
                country_obj.days_recommendation = data.get('days_recommendation', country_obj.days_recommendation)
                country_obj.save()
        except:
            pass

    def refresh_destination_data(self, destination_obj):
        """
        Uses AI to update destination-specific context like culture and heritage.
        """
        messages = [
            ("system", "You are a travel expert."),
            ("user", f"Tell me about the culture and heritage of {destination_obj.name}, {destination_obj.country.name}. Return ONLY a 3-sentence summary.")
        ]
        
        try:
            summary = self.low_cost_llm.invoke(messages).content
            destination_obj.culture = summary
            destination_obj.save()
        except:
            pass
