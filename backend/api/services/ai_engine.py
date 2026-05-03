import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from django.conf import settings
import json

class AIEngine:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_API_BASE,
            temperature=0.7,
        )

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

    def generate_itinerary(self, destination, duration, budget, style, interests):
        """
        Generates a day-wise itinerary structure using AI.
        """
        response_schemas = [
            ResponseSchema(name="title", description="A catchy title for the trip"),
            ResponseSchema(name="overview", description="A brief overview of the trip"),
            ResponseSchema(name="days", description="An array of daily plans. Each day should have a 'day_number', 'theme', and 'activities' (array of {time, activity, description, location, cost_estimate})."),
            ResponseSchema(name="budget_breakdown", description="Estimated costs for transport, food, activities, and stay."),
            ResponseSchema(name="packing_list", description="Suggested packing items based on destination and duration."),
            ResponseSchema(name="local_tips", description="Important local customs or hacks.")
        ]
        
        output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = output_parser.get_format_instructions()

        prompt = ChatPromptTemplate.from_template(
            """
            You are an expert travel consultant. Generate a highly detailed {duration}-day travel itinerary for {destination}.
            
            User Preferences:
            - Budget: {budget}
            - Travel Style: {style}
            - Interests: {interests}
            
            {format_instructions}
            
            Ensure the itinerary is realistic, accounts for travel time between attractions, and includes specific food recommendations for each day.
            """
        )

        messages = prompt.format_messages(
            destination=destination,
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
        Fetches visa requirements and documentation.
        Note: In production, this should cross-reference a verified database.
        """
        prompt = ChatPromptTemplate.from_template(
            """
            Act as a global visa consultant. Provide the visa requirements and necessary documentation for a {source} citizen traveling to {destination}.
            
            Return the response in the following JSON format:
            {{
                "visa_required": boolean,
                "visa_type": string,
                "requirements": string (brief summary),
                "documentation": [list of strings]
            }}
            """
        )
        
        messages = prompt.format_messages(source=source_country, destination=destination_country)
        response = self.llm.invoke(messages)
        
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
        """
        Generates comprehensive guide content for a new destination.
        """
        prompt = ChatPromptTemplate.from_template(
            """
            You are a professional travel writer. Generate a comprehensive destination guide for {destination}.
            
            Return the response in the following JSON format:
            {{
                "description": "A captivating 3-4 sentence introduction to the destination.",
                "best_time": "Description of the best time to visit and why.",
                "visa_process": "General overview of the visa process for international travelers.",
                "airports": ["List of 2-3 major international airports"],
                "tips": ["List of 3-5 essential travel tips"],
                "days_recommendation": {{
                    "3": "Summary of what to see in 3 days",
                    "5": "Summary of what to see in 5 days",
                    "7": "Summary of what to see in 7 days"
                }}
            }}
            """
        )
        
        messages = prompt.format_messages(destination=destination)
        response = self.llm.invoke(messages)
        
        import json
        try:
            # Handle potential markdown formatting in response
            content = response.content.replace('```json', '').replace('```', '').strip()
            return json.loads(content)
        except:
            return {
                "description": f"Explore the wonders of {destination}, a land of culture and adventure.",
                "best_time": "All year round.",
                "visa_process": "Check with your local embassy.",
                "airports": ["International Airport"],
                "tips": ["Respect local customs", "Carry a map"],
                "days_recommendation": {"3": "Quick highlights", "5": "Full experience", "7": "Deep exploration"}
            }
