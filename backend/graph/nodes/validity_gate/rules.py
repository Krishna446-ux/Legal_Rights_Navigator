import re
from enum import Enum
from loguru import logger
from enums.GateResult import GateResult


_GREETINGS = {
    # Greetings
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
    logger.debug(f"Tier 1: evaluating query (length={len(normalized)}): '{normalized[:80]}'")

    try:
        if len(normalized) < _MIN_LENGTH:
            logger.info(f"Tier 1 REJECT: query too short (length={len(normalized)})")
            return GateResult.REJECT

        if normalized in _GREETINGS:
            logger.info(f"Tier 1 REJECT: query matched greeting set: '{normalized}'")
            return GateResult.REJECT

        if _SPAM_PATTERN.search(normalized):
            logger.info(f"Tier 1 REJECT: query matched spam pattern: '{normalized[:40]}'")
            return GateResult.REJECT

        for pattern in _OFFTOPIC_PATTERNS:
            if re.search(pattern, normalized):
                logger.info(f"Tier 1 REJECT: query matched off-topic pattern '{pattern}': '{normalized[:80]}'")
                return GateResult.REJECT

        # Tier 1 never confidently PASSes a query as legal —
        # that judgment needs semantic understanding (Tier 2/3).
        logger.debug("Tier 1 UNCERTAIN: no reject rule matched, escalating to Tier 2")
        return GateResult.UNCERTAIN

    except Exception as e:
        logger.exception(f"Tier 1 rules evaluation crashed unexpectedly: {e}")
        return GateResult.UNCERTAIN