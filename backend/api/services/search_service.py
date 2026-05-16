import os
from tavily import TavilyClient
from django.conf import settings
from datetime import datetime
import logging
import json

search_logger = logging.getLogger('search_logger')

class SearchService:
    def __init__(self):
        self.client = TavilyClient(api_key=settings.TAVILY_API_KEY)

    def _execute_search(self, query, depth="basic", max_results=3):
        """
        Helper to execute search with logging.
        """
        if not getattr(settings, 'SEARCH_LOGGING', False):
            return self.client.search(query=query, search_depth=depth, max_results=max_results)

        search_logger.info(f"--- TAVILY REQUEST ---")
        search_logger.info(f"Query: {query} | Depth: {depth} | Max Results: {max_results}")

        result = self.client.search(query=query, search_depth=depth, max_results=max_results)

        search_logger.info(f"--- TAVILY RESPONSE ---")
        search_logger.info(json.dumps(result, indent=2))
        search_logger.info(f"--- END TAVILY ---")

        return result

    def search_travel_info(self, country, destinations, source_country="India"):
        """
        Searches for real-time travel information including prices, events, and restaurant trends.
        Tailors search for specific passport holders (source_country).
        """
        now = datetime.now()
        current_date_str = now.strftime("%B %Y")
        
        query = f"top travel attractions, entry ticket prices, events, and best restaurants in {', '.join(destinations)}, {country} for travelers from {source_country} as of {current_date_str}"
        
        try:
            # Perform search with high depth for better context
            search_result = self._execute_search(query, "advanced", 5)
            
            context = ""
            for result in search_result.get('results', []):
                context += f"Source: {result.get('url')}\nContent: {result.get('content')}\n\n"
            
            return context
        except Exception as e:
            print(f"Tavily search failed: {str(e)}")
            return "No real-time search context available."

    def search_visa_info(self, source, destination):
        """
        Searches for the latest visa requirements, including special cases for passport holders.
        """
        now = datetime.now()
        current_date_str = now.strftime("%B %Y")
        
        queries = [
            f"official visa requirements for {source} citizens visiting {destination} as of {current_date_str}",
            f"visa relaxation for {source} citizens with valid US UK or Schengen visa visiting {destination} {current_date_str}"
        ]
        
        context = ""
        for query in queries:
            try:
                search_result = self._execute_search(query, "advanced", 3)
                for result in search_result.get('results', []):
                    context += f"Source: {result.get('url')}\nContent: {result.get('content')}\n\n"
            except Exception as e:
                print(f"Tavily visa search failed for query '{query}': {str(e)}")
        
        return context

    def search_attraction_info(self, attraction_name, city):
        """
        Searches for specific attraction details: opening times, ticket prices, and current status.
        """
        query = f"opening hours, ticket prices, best time to visit, and closing days for {attraction_name} in {city} 2024 2025"
        try:
            search_result = self._execute_search(query, "basic", 3)
            context = ""
            for result in search_result.get('results', []):
                context += f"Info: {result.get('content')}\n"
            return context
        except:
            return ""

    def search_transfer_info(self, from_point, to_point, city):
        """
        Searches for realistic travel distance, time, and modes between two points.
        """
        query = f"best way to travel from {from_point} to {to_point} in {city}: distance, time by car, public transport, and cost"
        try:
            search_result = self._execute_search(query, "basic", 2)
            context = ""
            for result in search_result.get('results', []):
                context += f"Transit Info: {result.get('content')}\n"
            return context
        except:
            return ""
