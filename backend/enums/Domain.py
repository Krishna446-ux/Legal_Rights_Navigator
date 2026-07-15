from enum import Enum

    # Literal["", "", "tenant_property", "cyber_crime", "family_womens_rights"]
class Domain(str,Enum):
    LABOUR="labour_employment"
    CONSUMER="consumer_protection"
    TENANT="tenant_property"
    CYBER="cyber_crime"
    FAMILY="family_womens_rights"
    OTHER_LEGAL="other_legal"