from enum import Enum


class GateResult(str, Enum):
    PASS = "pass"
    REJECT = "reject"
    UNCERTAIN = "uncertain"