"""
Curated reference queries for Tier 2 embedding similarity filtering.
IN_DOMAIN spans all 5 supported legal domains.
OUT_OF_DOMAIN covers common non-legal query types.

NOTE: This is a starting seed set. Expand it using real user queries
once the 9.1 testing/eval harness is in place — thresholds tuned
against ~30-50 examples per side are fragile at scale.
"""

IN_DOMAIN_QUERIES = [
    # ---------------------------------------------------------
    # 1. LABOUR & EMPLOYMENT
    # ---------------------------------------------------------
    "My employer hasn't paid my salary for two months, what can I do?",
    "Can my company terminate me without notice?",
    "What is the notice period required before layoff in India?",
    "My employer is not paying overtime, is that legal?",
    "How do I file a complaint against my employer for unpaid wages?",
    "My company is forcing me to resign to avoid paying severance, what are my rights?",
    "How do I withdraw my PF if my previous employer refuses to approve the transfer?",
    "Is a 2-year non-compete agreement legally enforceable if I join a competitor?",
    "My manager is making inappropriate comments, how do I file a POSH complaint?",
    "Can my employer terminate me while I am on maternity leave?",
    "They are withholding my full and final settlement, where can I complain?",
    "I was fired for poor performance without any prior warning or PIP, is this legal?",
    "My employer is refusing to give me an experience letter after I served my notice.",
    "Are contract workers entitled to gratuity after 5 years of continuous service?",
    "Can a company legally deduct money from my salary for breaking a laptop?",
    "What is the legal process if a company goes bankrupt and owes me back pay?",
    "My boss demoted me after I reported a safety violation, what can I do?",
    "Can an employer force me to work on public holidays without compensatory off?",
    "I haven't received my appointment letter but I've been working here for a month.",
    "Is it legal for my employer to track my location through a company phone 24/7?",

    # ---------------------------------------------------------
    # 2. CONSUMER PROTECTION
    # ---------------------------------------------------------
    "I bought a defective product online and the seller refuses a refund.",
    "How do I file a consumer complaint against a company?",
    "What are my rights if a service provider doesn't deliver as promised?",
    "The airline lost my luggage and is only offering ₹3,000 as compensation.",
    "How do I sue a private hospital for medical negligence and wrong diagnosis?",
    "A builder has delayed possession of my apartment by 4 years, can RERA help?",
    "Can a restaurant legally force me to pay a 10% service charge on the bill?",
    "I was scammed by a fake travel agency, which court do I approach?",
    "The laptop I bought is under warranty but the service center refuses to fix it.",
    "An e-commerce site cancelled my order during a sale and won't honor the price.",
    "How do I claim compensation for food poisoning from a food delivery app?",
    "The gym closed down permanently and took my yearly subscription money.",
    "My insurance claim was unfairly rejected citing pre-existing conditions.",
    "I bought a second-hand car from a dealer and the engine failed the next day.",
    "Can a coaching institute refuse to refund my fees if I drop out after a week?",
    "My broadband provider has been down for a week, am I entitled to a refund?",
    "A beauty salon completely ruined my hair, can I sue them for mental agony?",
    "I found a dead insect in a packaged food item, where do I report this?",
    "Can a movie theater stop me from carrying my own water bottle inside?",
    "The courier company lost a high-value package, how do I get my money back?",

    # ---------------------------------------------------------
    # 3. TENANT & PROPERTY
    # ---------------------------------------------------------
    "My landlord is refusing to return my security deposit.",
    "Can my landlord evict me without notice?",
    "What are my rights as a tenant if the landlord enters without permission?",
    "My rent agreement is only for 11 months and unregistered, is it valid in court?",
    "The landlord cut off my electricity and water supply to force me to vacate.",
    "Can my landlord increase the rent by 20% in the middle of my lease?",
    "I am a bachelor and the housing society is forcing my landlord to evict me.",
    "Who is responsible for major plumbing repairs, the tenant or the landlord?",
    "My landlord is locking the main gate at 10 PM and restricting my entry.",
    "Can a landlord legally deduct painting charges from my deposit if not in the agreement?",
    "The tenant hasn't paid rent for 4 months and refuses to leave, how do I evict them?",
    "My landlord is asking for 10 months of rent as a security deposit, is there a legal cap?",
    "Can I break my lease early due to a severe pest infestation the landlord won't fix?",
    "The RWA is not allowing my delivery executives inside the building.",
    "My tenant is using my residential property for commercial business illegally.",
    "Is a lock-in period of 3 years legally binding if I lose my job and need to move?",
    "My landlord is threatening to throw my belongings on the street tomorrow.",
    "Can I sublet a portion of my rented house if the agreement is silent on it?",
    "The roof is leaking and damaging my furniture, can I deduct repair costs from rent?",
    "What is the procedure to send a legal eviction notice to a defaulting tenant?",

    # ---------------------------------------------------------
    # 4. CYBER CRIME
    # ---------------------------------------------------------
    "Someone is blackmailing me with my photos online.",
    "My bank account was hacked and money was withdrawn, what should I do?",
    "How do I report online fraud in India?",
    "I lost money to a Telegram cryptocurrency investment scam, can I recover it?",
    "Someone created a fake Instagram profile using my pictures and is messaging my friends.",
    "How do I file a cybercrime FIR for a UPI QR code payment scam?",
    "My ex-partner is threatening to leak private WhatsApp chats, what can I do?",
    "I clicked a phishing link and they stole my credit card details.",
    "Someone is harassing and abusing me in the comments of my YouTube videos.",
    "My business website was hit by ransomware and they are demanding Bitcoin.",
    "How do I take down a defamatory YouTube video made about me?",
    "I received a fake job offer via email and paid a 'registration fee'.",
    "Someone is using a deepfake video of my face to extort money from me.",
    "What is the punishment for hacking someone's email account under the IT Act?",
    "I am receiving daily threatening calls from illegal loan app recovery agents.",
    "My WhatsApp account was hijacked, how do I report it to the authorities?",
    "A matrimonial site profile turned out to be a scammer who took my money.",
    "How do I report a fake customer care number listed on Google Maps?",
    "Someone doxxed me and posted my home address and phone number on Twitter.",
    "Is it a cybercrime to secretly record a Zoom call and share it online?",

    # ---------------------------------------------------------
    # 5. FAMILY & WOMEN'S RIGHTS
    # ---------------------------------------------------------
    "How do I file for divorce in India?",
    "What are my rights regarding maintenance after separation?",
    "How do I file a domestic violence complaint?",
    "What is the step-by-step process for a mutual consent divorce?",
    "How is child custody usually decided in Indian courts after a divorce?",
    "My husband's family is constantly harassing me for dowry, where do I report this?",
    "Can a working wife still claim alimony or maintenance under Hindu Law?",
    "How do we register an inter-faith marriage under the Special Marriage Act?",
    "My husband threw me out of the house, how do I claim my right to reside in the matrimonial home?",
    "What legal action can I take if my husband has a second wife without divorcing me?",
    "How do I claim my equal share in ancestral property as a daughter?",
    "My wife filed a false 498A dowry case against me and my parents, what are my remedies?",
    "Can a single woman legally adopt a child in India?",
    "What is restitution of conjugal rights and can I be forced to live with my spouse?",
    "How long does a contested divorce typically take in family court?",
    "My husband is refusing to pay child support, how do I enforce the court order?",
    "Can I get a marriage annulled if my spouse hid a severe mental illness before the wedding?",
    "What are the legal rights of a woman in a live-in relationship?",
    "How do I file for a restraining order against an abusive partner?",
    "Is a prenuptial agreement valid and legally enforceable in Indian courts?"
]

OUT_OF_DOMAIN_QUERIES = [
    # General / Miscellaneous
    "What's the best recipe for butter chicken?",
    "Can you help me debug this Python code?",
    "What's the weather like today?",
    "Recommend me a good movie to watch",
    "How do I lose weight fast?",
    "What's the capital of France?",
    "Write a poem about the ocean",
    "What's the latest cricket score?",
    "How do I learn guitar?",
    "Suggest some travel destinations in India",
    "How do I fix a leaking faucet in my bathroom?",
    "What are the best smartphones available under 20,000 INR?",
    "Can you summarize the plot of Christopher Nolan's Inception?",
    "How do I prepare for a data science job interview?",
    "What is the distance between Delhi and Mumbai by train?",
    "Give me a 5-day workout routine for muscle gain.",
    "What are the main causes of global warming?",
    "Explain quantum computing in simple terms.",
    "How do I start a podcast on Spotify?",
    "What is the historical significance of the Taj Mahal?",

    # Other Legal/Regulatory Domains (CRITICAL for training boundary lines)
    # -- Traffic & Motor Vehicles --
    "I received a fake traffic challan online, how do I contest it?",
    "What is the fine for driving without a valid pollution certificate (PUC)?",
    "Can the traffic police seize my vehicle if I'm not wearing a helmet?",
    "What is the procedure to claim insurance after a car accident?",
    
    # -- General Criminal Law (Non-Cyber, Non-Domestic) --
    "The police station is refusing to register my FIR for a physical fight, what can I do?",
    "What is the difference between a bailable and non-bailable offence?",
    "How do I apply for anticipatory bail if I suspect an arrest?",
    "What legal action can I take against a neighbor for public defamation?",
    "What is the punishment for cheating or breach of trust under Indian law?",
    
    # -- Taxation & Finance --
    "How do I file my Income Tax Returns (ITR) as a freelancer?",
    "What are the latest GST slabs for restaurant services?",
    "Can the Income Tax department freeze my bank account without notice?",
    "How can I save tax legally under Section 80C?",

    # -- Business, Intellectual Property & Contracts --
    "How do I trademark my brand name and logo in India?",
    "What are the legal steps to register a Private Limited Company?",
    "How do I draft a legally binding freelance service agreement?",
    "Someone copied my website content, how do I send a copyright infringement notice?",
    "What is the process to legally dissolve a partnership firm?",

    # -- Government Schemes & Identity Documents --
    "How do I apply for a duplicate Aadhaar card if I lost the original?",
    "What is the eligibility criteria for the PM Kisan Samman Nidhi scheme?",
    "How do I change the spelling of my name on my passport?",
    "What is the procedure to get an EWS certificate for college admission?"
]