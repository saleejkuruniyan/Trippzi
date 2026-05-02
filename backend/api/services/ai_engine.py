import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from django.conf import settings

class AIEngine:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_API_BASE,
            temperature=0.7,
        )

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
        try:
            return output_parser.parse(response.content)
        except Exception as e:
            # Fallback or error handling
            return {"error": str(e), "raw": response.content}

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
