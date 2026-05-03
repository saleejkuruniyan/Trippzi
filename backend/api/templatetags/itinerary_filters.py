from django import template

register = template.Library()

@register.filter
def get_day(images, day_number):
    """
    Filters a list of ItineraryDay objects by day_number.
    """
    if not images:
        return []
    return [img for img in images if img.day_number == day_number]
