from enum import Enum


class RetrievalStatus(str,Enum):
    SUCCESS="success"
    FAIL="fail"
    ERROR="error"