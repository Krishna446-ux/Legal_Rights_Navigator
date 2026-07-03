import re
from enum import Enum


class GateResult(str, Enum):
    PASS = "pass"
    REJECT = "reject"
    UNCERTAIN = "uncertain"


_GREETINGS = {
    # Greetings
    "hi", "hii", "hiii", "hiiii",
    "hello", "helloo", "hey", "heyy", "heyyy",
    "hiya", "yo", "sup", "wassup", "whats up", "what's up",
    "good morning", "good afternoon", "good evening", "good night",
    "morning", "afternoon", "evening",

    # Introductions
    "greetings",
    "nice to meet you",
    "pleased to meet you",
    "howdy",

    # Asking how someone is
    "how are you",
    "how are you doing",
    "how's it going",
    "hows it going",
    "how is it going",
    "how have you been",
    "how are things",
    "how are you today",
    "what's going on",
    "whats going on",
    "how do you do",

    # Acknowledgements
    "ok",
    "okay",
    "kk",
    "k",
    "alright",
    "all right",
    "cool",
    "great",
    "awesome",
    "nice",
    "perfect",
    "fine",
    "sure",
    "sounds good",
    "got it",
    "understood",
    "roger",
    "roger that",
    "makes sense",

    # Thanks
    "thanks",
    "thank you",
    "thankyou",
    "thanks a lot",
    "thanks alot",
    "thank you so much",
    "many thanks",
    "appreciate it",
    "much appreciated",
    "ty",
    "thx",
    "tysm",
    "tnx",

    # Farewells
    "bye",
    "goodbye",
    "bye bye",
    "see ya",
    "see you",
    "see you later",
    "see you soon",
    "later",
    "catch you later",
    "take care",
    "have a nice day",
    "have a good day",
    "have a good one",
    "good night",
    "farewell",

    # Positive reactions
    "yep",
    "yeah",
    "yup",
    "yes",
    "absolutely",
    "definitely",
    "certainly",
    "indeed",
    "of course",

    # Short conversational fillers
    "hmm",
    "hmmm",
    "hmmmm",
    "huh",
    "ah",
    "aha",
    "oh",
    "ooh",
    "huh okay",
    "hmm okay",

    # Casual internet slang
    "gm",
    "gn",
    "gl",
    "hf",
    "lol",
    "lmao",
    "rofl",
    "xd",
    ":)",
    ":-)",
    "👋",
    "🙏",
    "😊",
}

_OFFTOPIC_PATTERNS = [

    # Identity

    r"\bwho are you\b",

    r"\bwhat('?s| is) your name\b",

    r"\bwho made you\b",

    r"\bwho created you\b",

    r"\bwho built you\b",

    r"\bwhat are you\b",

    r"\bare you (human|real|alive|a robot|an ai)\b",

    # Personal questions

    r"\bhow are you\b",

    r"\bhow('?s| is) it going\b",

    r"\bhow have you been\b",

    r"\bhow do you feel\b",

    r"\bwhere do you live\b",

    r"\bhow old are you\b",

    r"\bdo you have (friends|family|parents)\b",

    # Entertainment

    r"\btell me a joke\b",

    r"\bmake me laugh\b",

    r"\bsay something funny\b",

    r"\briddle\b",

    r"\bfun fact\b",

    r"\btrivia\b",

    # Creative writing

    r"\bwrite (a )?poem\b",

    r"\bwrite (a )?story\b",

    r"\bwrite (a )?song\b",

    r"\bwrite lyrics\b",

    r"\bcontinue this story\b",

    # Programming

    r"\bwrite (some )?code\b",

    r"\bdebug this code\b",

    r"\bsolve this coding problem\b",

    r"\bleetcode\b",

    # General knowledge

    r"\bweather\b",

    r"\btemperature\b",

    r"\bforecast\b",

    r"\bnews\b",

    r"\bstock market\b",

    r"\bcricket\b",

    r"\bfootball\b",

    r"\bfifa\b",

    r"\bipl\b",

    r"\bmovie\b",

    r"\bmovies\b",

    r"\banime\b",

    r"\bmanga\b",

    r"\bnetflix\b",

    r"\bmusic\b",

    r"\bsong\b",

    # Math

    r"\bsolve\b.*\b(equation|math|algebra|calculus)\b",

    r"\bintegrate\b",

    r"\bdifferentiate\b",

    # Translation

    r"\btranslate\b",

    r"\bmeaning of\b",

    r"\bdefine\b",

    # Shopping

    r"\bbuy\b",

    r"\brecommend\b.*\b(phone|laptop|headphones|camera|car)\b",

    r"\bbest (phone|laptop|tablet|monitor)\b",

    # Food

    r"\brecipe\b",

    r"\bhow to cook\b",

    r"\brestaurant\b",

    r"\bfood\b",

    # Travel

    r"\btravel\b",

    r"\bvacation\b",

    r"\bflight\b",

    r"\bhotel\b",

    # Miscellaneous

    r"\bflip a coin\b",

    r"\broll a dice\b",

    r"\bguess a number\b",

    r"\bplay a game\b",

    r"\bchess\b",

    r"\bsudoku\b",

]

_SPAM_PATTERN = re.compile(r"(.)\1{6,}")  # same char repeated 7+ times
_MIN_LENGTH = 3


def apply_tier1_rules(query: str) -> GateResult:
    """
    Fast, deterministic filtering before any model call.
    Returns PASS only for rule-based confidence; most legitimate
    legal queries should fall through as UNCERTAIN to Tier 2.
    """
    normalized = query.strip().lower()

    if len(normalized) < _MIN_LENGTH:
        return GateResult.REJECT

    if normalized in _GREETINGS:
        return GateResult.REJECT

    if _SPAM_PATTERN.search(normalized):
        return GateResult.REJECT

    for pattern in _OFFTOPIC_PATTERNS:
        if re.search(pattern, normalized):
            return GateResult.REJECT

    # Tier 1 never confidently PASSes a query as legal —
    # that judgment needs semantic understanding (Tier 2/3).
    return GateResult.UNCERTAIN