from typing import Literal, TypedDict

from enums.Domain import Domain


class MetadataFilter(TypedDict,total=False):
    jurisdiction:list[str]|None
    document_type: Literal[
        "act",
        "rule",
        "notification",
        "scheme",
        "guidance",
    ]|None
    domain:Domain|None
