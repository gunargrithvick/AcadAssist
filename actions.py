from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from typing import Dict, Any, List
import mongo_setup

# ----------------- Refined Language Detector (No External Libraries) ----------------- #

def detect_language_by_character_count(text: str) -> str:
    """
    Detects language by counting characters from different Unicode ranges.
    This method does not require any external libraries.
    """
    if not text:
        return "en"

    # Define Unicode ranges for each supported language
    lang_ranges = {
        "hi": (0x0900, 0x097F),  # Hindi (Devanagari)
        "ml": (0x0D00, 0x0D7F),  # Malayalam
        "te": (0x0C00, 0x0C7F),  # Telugu
        "kn": (0x0C80, 0x0CFF),  # Kannada
        "ta": (0x0B80, 0x0BFF),  # Tamil
    }

    # Initialize a counter for each language
    counts = {lang: 0 for lang in lang_ranges}

    # Iterate through the entire text and count characters for each language
    for char in text:
        code = ord(char)
        for lang, (start, end) in lang_ranges.items():
            if start <= code <= end:
                counts[lang] += 1
                break  # Move to the next character once a language is found

    # Determine the language with the highest character count
    if any(count > 0 for count in counts.values()):
        # Find the language with the maximum score
        detected_lang = max(counts, key=counts.get)
        return detected_lang
    else:
        # If no characters from the specified ranges are found, default to English
        return "en"

# ---------------------------------------------------------------------------------- #


class ActionSetLanguage(Action):
    """
    Detects the language from the user's message and sets the 'language' slot.
    This action is triggered at the beginning of each conversation.
    """
    def name(self) -> str:
        return "action_set_language"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        last_message = tracker.latest_message.get("text") or ""
        
        # Use the refined, counting-based language detection function
        lang_code = detect_language_by_character_count(last_message)
        
        # Log the user message to MongoDB
        mongo_setup.log_message("user", last_message)
        
        return [SlotSet("language", lang_code)]