let UNSPECIFIED_DATA_RENAME = "unspecified data";
let UNSPECIFIED_ACTOR_RENAME = "unspecified actor";
const categories = {};

categories.tiktok = {
    actorCategories: {
        "Advertisers": ["advertiser"],
        "Analytic Providers": ["analytic provider", "measurement"],
        "Corporations": ["entity within corporate group"],
        "Geographic Entities": ["country with adequacy decision", "country list", "company in eea"],
        "We": ["we", "tiktok"],
        "Researchers": ["researcher", "independent researcher"],
        "Law Enforcement": ["law enforcement", "law enforcement agency", "public authority"],
        "Service Providers": ["service provider", "payment provider", "transaction fulfillment provider"],
        "Commercial Entities": ["merchant", "creator"],
        "Other": ["UNSPECIFIED_ACTOR"]
    },
    dataCategories: {
        "Identifiers": [
            "username", "email address", "phone number", "device identifier", "person name", "sim card", "advertising id", "password"
        ],
        "Personal Information": [
            "public profile information", "contact", "credit / debit card number", "information about you", "information you provide", "profile", "profile information", "public profile", "basic account information", "contact information", "identity", "characteristic", "age", "date of birth", "personal identifier"
        ],
        "Aggregated & Inferred Data": [
            "aggregate demographic information about follower", "inference", "infer information", "aggregate / deidentified / pseudonymized information", "aggregate statistic"
        ],
        "Metadata": [
            "information from source", "information about number of view of video", "content characteristic", "associate metadata", "metadata", "category of information", "information about processing", "relate information"
        ],
        "Media Content": [
            "user content", "video content", "audio recording", "content", "content you create"
        ],
        "General Data": [
            "collect information", "information describe in information we collect section", "information describe in", "information we collect", "information we have", "information about", "information you provide", UNSPECIFIED_DATA_RENAME
        ],
        "Behavioral Data": [
            "external activity tracking", "information from form you use", "rhythm", "browsing / search history", "usage information", "engagement with user", "information about content you view", "aggregate demographic information about follower", "point of interest", "hashtag"
        ],
        "Location Data": [
            "geolocation", "coarse geolocation", "system language"
        ],
        "Tracking": [
            "cookie / pixel tag"
        ],
        "Message Data": [
            "message you send", "direct message", "content of message", "message", "information from form you use", "text"
        ],
        "Technical Data": [
            "setting", "technical information", "ip address", "device information", "technical information about device", "performance log", "device model", "operating system", "crash report", "keystroke pattern"
        ],
        "Financial Data": [
            "information about purchase transaction", "credit / debit card number", "payment confirmation detail", "purchase information relate to transaction", "order item", "item you purchase", "purchase information", "delivery information"
        ]
    }
};

categories.openai = {
    actorCategories: {
        "Advertisers": [],
        "Analytic Providers": ["analytic provider"],
        "Corporations": ["Microsoft", "Facebook", "Medium", "YouTube", "x"],
        "Geographic Entities": [],
        "We": ["we", "chatgpt"],
        "Researchers": [],
        "Law Enforcement": ["government authority"],
        "Service Providers": [
            "cloud service", "social media", "payment provider", "service provider", "support monitoring service",
            "datum warehouse service", "email communication software", "content delivery service",
            "customer service vendor", "provider of hosting service", "information technology service provider"
        ],
        "Commercial Entities": ["business account administrator", "administrator of account", "business transfer", "counterpartie"],
        "Other": ["successor", "UNSPECIFIED_ACTOR", "other"]
    },
    dataCategories: {
        "Identifiers": [
            "device identifier", "person name", "account", "email address", "account credential", "openai account"
        ],
        "Personal Information": [
            "credit / debit card number", "information associate with account", "account information", "contact information", "personal data you choose", "personal data relate to you", "personal datum relate to you", "person name", "personal information"
        ],
        "Aggregated & Inferred Data": [
            "aggregate / deidentified / pseudonymized information"
        ],
        "Metadata": [
            "setting", "time", "date", "type of content"
        ],
        "Media Content": [
            "content of message you send", "personal data include in input you provide to service"
        ],
        "General Data": [
            "information you provide", "information you provide to we", UNSPECIFIED_DATA_RENAME, "personal data we share", "communication information", "information about use of services", "social media information"
        ],
        "Behavioral Data": [
            "internet activity", "transaction history"
        ],
        "Location Data": [
            "time zone", "country"
        ],
        "Tracking": [
            "cookie / pixel tag"
        ],
        "Message Data": [
            "content of message you send", "communication information"
        ],
        "Technical Data": [
            "computer connection", "log datum", "name of device", "technical information", "ip address", "device information", "user agent", "browser type", "operating system"
        ],
        "Financial Data": [
            "credit / debit card number", "transaction history"
        ]
    }
};

categories.amazon = {
    actorCategories: {
        "Advertisers": ["advertiser"],
        "Analytic Providers": [],
        "Corporations": ["prime video", "imdbpro"],
        "Geographic Entities": [],
        "We": ["Amazon.com", "we", "amazon"],
        "Researchers": [],
        "Law Enforcement": [],
        "Service Providers": [],
        "Commercial Entities": ["physical store"],
        "Other": ["UNSPECIFIED_ACTOR"]
    },
    dataCategories: {
        "Identifiers": [
            "identify information", "ssn", "device identifier", "person name", "driver's license number", "phone number", "ip address", "identifier", "advertising id", "email address"
        ],
        "Personal Information": [
            "age", "information you provide in relation to amazon services", "information regard place of establishment bank account information for identity verification", "person name", "document regard identity", "profile", "credit history information", "personal description", "information about you", "payment information", "personal information need", "account", "personal profile", "personal information relate to transaction", "voiceprint", "personal information", "information regard place of establishment bank account information", "postal address"
        ],
        "Aggregated & Inferred Data": [
            "recommendation", "estimate", "scoring method"
        ],
        "Metadata": [
            "code", "configuration"
        ],
        "Media Content": [
            "voice input", "photograph", "product review", "image"
        ],
        "General Data": [
            UNSPECIFIED_DATA_RENAME, "information you give we", "email to we", "info entertainment professional need", "corporate information", "amazon business card", "movie box office datum", "information you access", "datum about event", "order", "zappos shoe", "amazon subscription box", "return exchange item", "reminder", "feedback", "people"
        ],
        "Behavioral Data": [
            "top subscription box", "browsing", "specific shopping action", "product view", "information about interaction with product available"
        ],
        "Location Data": [
            "geolocation"
        ],
        "Tracking": [
            "cookie / pixel tag"
        ],
        "Message Data": [
            "communication with amazon employee", "email to we"
        ],
        "Technical Data": [
            "automatic information", "wifi credential", "sensor", "technical information", "device log file"
        ],
        "Financial Data": [
            "payment information", "shipping rate", "carrier info", "shipping carrier information", "balance"
        ]
    }    
};

categories.bixby = {
    actorCategories: {
        "Advertisers": ["advertiser", "ad"],
        "Analytic Providers": ["action take on website"],
        "Corporations": [],
        "Geographic Entities": ["republic of korea"],
        "We": ["we", "Samsung"],
        "Researchers": [],
        "Law Enforcement": [],
        "Service Providers": ["service provider", "wireless carrier", "financing partner"],
        "Commercial Entities": ["network", "page"],
        "Other": ["UNSPECIFIED_ACTOR"]
    },
    dataCategories: {
        "Identifiers": [
            "serial number", "imei", "phone number", "email address"
        ],
        "Personal Information": [
            "personal information about united states resident", "information about you", "information about you you choose", "contact information", "personal information", "postal code", "zip code", "biometric information"
        ],
        "Aggregated & Inferred Data": [],
        "Metadata": [
            "sign information"
        ],
        "Media Content": [
            "voice command", "recording of voice"
        ],
        "General Data": [
            "information we collect", "information we collect about you from service", UNSPECIFIED_DATA_RENAME, "information we obtain", "information you provide through source", "information about", "information about use of services", "information about use of service", "publicly available information"
        ],
        "Behavioral Data": [
            "browsing / search history", "internet activity", "information from social network you use"
        ],
        "Location Data": [
            "geolocation", "precise geolocation"
        ],
        "Tracking": [
            "tracking pixel", "beacon", "cookie / pixel tag"
        ],
        "Message Data": [],
        "Technical Data": [
            "router ssid"
        ],
        "Financial Data": []
    }
};

categories.gemini = {
    actorCategories: {
        "Advertisers": [],
        "Analytic Providers": [],
        "Corporations": ["Google"],
        "Geographic Entities": [],
        "We": ["gemini", "gemini apps"],
        "Researchers": [],
        "Law Enforcement": [],
        "Service Providers": [],
        "Commercial Entities": [],
        "Other": []
    },
    dataCategories: {
        "Identifiers": ["ip address"],
        "Personal Information": ["postal address", "contact"],
        "Aggregated & Inferred Data": ["inaccurate information not represent view"],
        "Metadata": ["system permission"],
        "Media Content": ["voice datum", "screen content"],
        "General Data": ["info", "info from device understand you", UNSPECIFIED_DATA_RENAME, "feedback", "related product usage information"],
        "Behavioral Data": ["preferred language", "gemini apps activity", "gemini apps conversation"],
        "Location Data": ["geolocation"],
        "Tracking": [],
        "Message Data": [],
        "Technical Data": ["call log", "dialer"],
        "Financial Data": []
    }
};

categories.siri = {
    actorCategories: {},
    dataCategories: {},
};