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

    def generate_itinerary(self, country, selected_destinations, duration, budget, style, interests):
        """
        Generates a day-wise itinerary structure using AI enhanced with Tavily search.
        """
        # 1. Fetch real-time context from Tavily
        search_context = self.search_service.search_travel_info(country, selected_destinations)
        
        from datetime import datetime
        current_date_str = datetime.now().strftime("%B %Y")

        response_schemas = [
            ResponseSchema(name="title", description="A catchy title for the trip"),
            ResponseSchema(name="overview", description="A brief overview of the trip"),
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
            
            Real-time Travel Context (Use this for latest prices, events, and trending spots):
            {search_context}
            
            Strictly use ONLY these destinations within {country}: {selected_destinations}.
            
            User Preferences:
            - Budget: {budget}
            - Travel Style: {style}
            - Interests: {interests}
            
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
            selected_destinations=", ".join(selected_destinations),
            duration=duration,
            budget=budget,
            style=style,
            interests=interests,
            format_instructions=format_instructions
        )
        
        response = self.llm.invoke(messages)
        parsed = self._extract_json(response.content)
        if parsed:
            return parsed
        return {"error": "Failed to parse AI response", "raw": response.content}

    def get_visa_info(self, source_country, destination_country):
        """
        Fetches visa requirements using real-time Tavily search, including special relaxation cases.
        """
        search_context = self.search_service.search_visa_info(source_country, destination_country)
        from datetime import datetime
        current_date_str = datetime.now().strftime("%B %Y")

        prompt = ChatPromptTemplate.from_template(
            """
            Act as a global visa consultant. Provide the visa requirements for a {source} citizen traveling to {destination} as of {current_date}.
            
            Search Context (Check this carefully for latest rules and special relaxations):
            {search_context}
            
            Return the response in the following JSON format:
            {{
                "visa_required": boolean,
                "visa_type": string (e.g. 'E-Visa', 'Visa on Arrival', 'Visa Free'),
                "requirements": string (brief summary),
                "documentation": [list of strings],
                "special_cases": "Mention any relaxations if the traveler holds a valid US, UK, or Schengen visa. If no special rules exist, state 'None'."
            }}
            """
        )
        
        messages = prompt.format_messages(
            source=source_country, 
            destination=destination_country,
            current_date=current_date_str,
            search_context=search_context
        )
        response = self.low_cost_llm.invoke(messages)
        
        # Simple parsing logic for this demonstration
        import json
        try:
            return json.loads(response.content)
        except:
            return {
                "visa_required": True,
                "visa_type": "Check Official Embassy",
                "requirements": "Information could not be retrieved automatically.",
                "documentation": ["Passport", "Proof of funds"]
            }

    def generate_destination_guide(self, destination):
        # ... (existing code)
        pass

    def refresh_country_data(self, country_obj):
        """
        Refreshes country guide data (visa, best time, etc.) using Tavily 
        if data is missing or older than 60 days.
        """
        from datetime import datetime, timedelta
        from django.utils import timezone

        sixty_days_ago = timezone.now() - timedelta(days=60)
        is_stale = country_obj.updated_at < sixty_days_ago
        is_empty = not country_obj.best_time or not country_obj.visa_process

        if is_stale or is_empty:
            search_context = self.search_service.search_travel_info(country_obj.name, [country_obj.name])
            current_date = datetime.now().strftime("%B %Y")
            prompt = ChatPromptTemplate.from_template("""
                You are a travel researcher. Update the guide for {country} as of {current_date}.
                {search_context}
                Return JSON with: description, best_time, visa_process, airports, tips, days_recommendation.
            """)
            messages = prompt.format_messages(country=country_obj.name, current_date=current_date, search_context=search_context)
            data = self._extract_json(self.low_cost_llm.invoke(messages).content)
            if data:
                country_obj.description = data.get('description', country_obj.description)
                country_obj.best_time = data.get('best_time', country_obj.best_time)
                country_obj.visa_process = data.get('visa_process', country_obj.visa_process)
                country_obj.airports = data.get('airports', country_obj.airports)
                country_obj.tips = data.get('tips', country_obj.tips)
                country_obj.days_recommendation = data.get('days_recommendation', country_obj.days_recommendation)
                country_obj.save()

    def refresh_destination_data(self, destination_obj):
        """
        Populates culture and description for a destination if empty.
        """
        if not destination_obj.culture or not destination_obj.description:
            prompt = ChatPromptTemplate.from_template("""
                Cultural guide for {destination}, {country}.
                Return JSON: {{ "description": "...", "culture": "..." }}
            """)
            messages = prompt.format_messages(destination=destination_obj.name, country=destination_obj.country.name if destination_obj.country else "")
            data = self._extract_json(self.low_cost_llm.invoke(messages).content)
            if data:
                destination_obj.description = data.get('description', destination_obj.description)
                destination_obj.culture = data.get('culture', destination_obj.culture)
                destination_obj.save()

    def refresh_attraction_data(self, attraction_obj):
        """
        Refreshes attraction logistics (pricing, closing days) using Tavily 
        if older than 60 days.
        """
        from datetime import datetime, timedelta
        from django.utils import timezone
        sixty_days_ago = timezone.now() - timedelta(days=60)
        if attraction_obj.updated_at < sixty_days_ago or not attraction_obj.ticket_price:
            query = f"current ticket prices, opening hours, and closing days for {attraction_obj.name} in {attraction_obj.destination.name}"
            try:
                search_result = self.search_service.client.search(query=query, search_depth="advanced", max_results=3)
                context = "\n".join([r.get('content') for r in search_result.get('results', [])])
                prompt = ChatPromptTemplate.from_template("Extract JSON (opening_time, closing_time, suggested_duration, ticket_price, closing_days) for {attraction} from: {context}")
                messages = prompt.format_messages(attraction=attraction_obj.name, context=context)
                data = self._extract_json(self.low_cost_llm.invoke(messages).content)
                if data:
                    for key in data: setattr(attraction_obj, key, data[key])
                    attraction_obj.save()
            except: pass
