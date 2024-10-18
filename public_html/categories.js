let UNSPECIFIED_DATA_RENAME = "unspecified data";
let UNSPECIFIED_ACTOR_RENAME = "unspecified actor";
const categories = {};

categories.tiktok = {
    // actorCategories: {
    //     "Advertisers": ["advertiser"],
    //     "Analytic Providers": ["analytic provider", "measurement"],
    //     "Corporations": ["entity within corporate group"],
    //     "Geographic Entities": ["country with adequacy decision", "country list", "company in eea"],
    //     "We": ["we", "tiktok"],
    //     "Researchers": ["researcher", "independent researcher"],
    //     "Law Enforcement": ["law enforcement", "law enforcement agency", "public authority"],
    //     "Service Providers": ["service provider", "payment provider", "transaction fulfillment provider"],
    //     "Commercial Entities": ["merchant", "creator"],
    //     "Other": ["UNSPECIFIED_ACTOR", "third-party platform"]
    // },


    actorCategories: {
        "Advertisers": ["Advertisers", "advertiser"],
        "Analytic Providers": ["Third Party Measurement Providers", "Measurement Partner", "Other Partner", "Third Party Providers"],
        "Corporations": [
            "Entities within our corporate group",
            "Corporate Transaction Parties",
            "Copyright Holders"
        ],
        "Geographic Entities": ["Search Engines, Content Aggregators, and News Sites"],
        "We": ["we", "We (TikTok)", "TikTok"],
        "Researchers": ["Researchers"],
        "Law Enforcement": ["Law Enforcement Agencies, or Other Third Parties", "Public Authorities"],
        "Service Providers": [
            "Service Providers",
            "Merchants, Payment and Transaction Fulfillment Providers",
            "Merchants, Payment and Transaction Fulfilment Providers, and Other Service Providers"
        ],
        "Commercial Entities": ["Advertisers", "Merchants", "Third Party Platforms"],
        "Other": [
            "Advertising, Measurement and Other Partners",
            "Organisations, Businesses, People, and Others",
            "Other Users",
            "Other Third Parties",
            "Third Party Platforms and Partners",
            "Third Party Services with TikTok Developer Tools",
            "Users and the Public",
        ]
    },



    // dataCategories: {
    //     "Identifiers": [
    //         "contact name", "user identifier", "advertising identifier", "username", "email address", "phone number", "device identifier", "person name", "sim card", "advertising id", "password"
    //     ],
    //     "Personal Information": [
    //         "profile information", "social network profile", "contact", "credit / debit card number", "information about you", "information you provide", "profile", "profile information", "public profile", "basic account information", "contact information", "identity", "characteristic", "age", "date of birth", "personal identifier"
    //     ],
    //     "Derived & Inferred Data": [
    //         "content metadata", "message metadata", "automatically collected information", "inferred interests", "inferred personal attributes", "age range", "aggregate demographic information about follower", "inference", "infer information", "aggregate / deidentified / pseudonymized information",

    //         "media characteristics", "aggregated statistics", "information from source", "information about number of view of video", "content characteristic", "associate metadata", "metadata", "category of information", "information about processing", "relate information"
    //     ],
    //     "Media Content": [
    //         "cross-platform content", "user content", "video content", "audio recording", "content", "content you create"
    //     ],
    //     "General Data": [
    //         "collect information", "information describe in information we collect section", "information describe in", "information we collect", "information we have", "information about", "information you provide", UNSPECIFIED_DATA_RENAME
    //     ],
    //     "Behavioral Data": [
    //         "external user activity", "information from form you use", "rhythm", "browsing / search history", "usage information", "engagement with user", "information about content you view", "aggregate demographic information about follower", "point of interest", "hashtag"
    //     ],
    //     "Location Data": [
    //         "location information", "geolocation", "coarse geolocation", "system language", "approximate location"
    //     ],
    //     "Tracking": [
    //         "cookie / pixel tag"
    //     ],
    //     "Messages and Assistance": [
    //         "information you provide when contacting us", "message you send", "direct message", "content of message", "message", "information from form you use", "text"
    //     ],
    //     "Technical Data": [
    //         "setting", "technical information", "ip address", "device information", "technical information about device", "performance log", "device model", "operating system", "crash report", "keystroke pattern"
    //     ],
    //     "Financial Data": [
    //         "delivery of products", "payment confirmation detail", "information about purchase transaction", "credit / debit card number", "payment confirmation detail", "purchase information relate to transaction", "order item", "item you purchase", "purchase information", "delivery information"
    //     ],
    //     "Contacts": [
    //         "your phone book contacts", "phone book", "your social network contacts"
    //     ]
    // }


    // dataCategories: {
    //     "Personally Identifiable Information": [
    //         "Date of Birth",
    //         "Email Address",
    //         "Telephone Number",
    //         "Username",
    //         "Password",
    //         "Profile Bio",
    //         "Profile Photo",
    //         "Proof of Identity",
    //         "Proof of Age"
    //     ],
    //     "Contact Information": [
    //         "Names from Phone Book",
    //         "Phone Numbers from Phone Book",
    //         "Email Addresses from Phone Book",
    //         "Your Social Network Public Profile Information",
    //         "Names of Social Network Contacts",
    //         "Profiles of Social Network Contacts",
    //         "Contacts Provided by Others",
    //         "Contact Information Synced by Others"
    //     ],
    //     "User-Generated Content": [
    //         "Photographs",
    //         "Videos",
    //         "Audio Recordings",
    //         "Livestreams",
    //         "Comments",
    //         "Hashtags",
    //         "Feedback",
    //         "Reviews",
    //         "Text from Clipboard",
    //         "Images from Clipboard",
    //         "Videos from Clipboard",
    //         "Survey Responses",
    //         "Research Participation Data",
    //         "Contest Entries",
    //         "Marketing Campaign Participation",
    //         "Event Participation",
    //         "Form Data",
    //         "Creation Time",
    //         "Creation Date",
    //         "Creator Identity"
    //     ],
    //     "Communication Data": [
    //         "Message Content",
    //         "Timestamps",
    //         "Chats with Merchants",
    //         "Virtual Assistant Interactions",
    //         "Policy Violation Reports",
    //     ],
    //     "Transaction and Financial Information": [
    //         "Payment Card Details",
    //         "Billing Information",
    //         "Delivery Information",
    //         "Contact Information (Purchases)",
    //         "Items Purchased",
    //         "Payment Confirmation Details",
    //         "Transaction Amounts",
    //         "Purchase or Payment Dates",
    //         "Shipping Address",
    //         "Delivery Status"
    //     ],
    //     "Device and Technical Information": [
    //         "Device Model",
    //         "Operating System",
    //         "Keystroke Patterns or Rhythms",
    //         "IP Address",
    //         "System Language",
    //         "Crash Reports",
    //         "Performance Logs",
    //         "Device ID",
    //         "User ID",
    //         "Network Type",
    //         "Notification Settings",
    //     ],
    //     "Location Data": [
    //         "Approximate Location (SIM and IP)",
    //         "Approximate Location (Device)",
    //         "Location Information",
    //         "Location of Content Creation"
    //     ],
    //     "Usage and Interaction Data": [
    //         "Content Viewed",
    //         "Duration of Use",
    //         "Frequency of Use",
    //         "Interactions with Other Users",
    //         "Search History",
    //         "Settings"
    //     ],
    //     "Cookies and Tracking Technologies": [
    //         "Cookie Identifiers",
    //         "Session Tokens",
    //         "Web Beacons",
    //         "Pixel Tags"
    //     ],
    //     "Inferred and Analytical Data": [
    //         "Inferred Age-Range",
    //         "Inferred Gender",
    //         "Interests and Preferences",
    //         "Objects and Scenery Recognition",
    //         "Face or Body Part Detection",
    //         "Speech-to-Text Transcriptions",
    //         "Information about ad performance"
    //     ],
    //     "Third-Party and External Data": [
    //         "Activities on Other Websites and Apps",
    //         "Products or Services Purchased Elsewhere",
    //         "Mobile Identifiers for Advertising",
    //         "Hashed Email Addresses",
    //         "Hashed Phone Numbers",
    //         "Email Address from Third Parties",
    //         "User ID from Third Parties",
    //         "Public Profile from Third Parties",
    //         "Data from TikTok Developer Tools Integrations",
    //         "Safety and Content Moderation Data",
    //         "Publicly Available Information",
    //         "Data from Government Authorities",
    //         "Data from Professional Organisations",
    //         "Data from Charity Groups",
    //         "Mentions in Content",
    //         "Cookie Identifiers (Third Parties)",
    //         "Delivery Information (from Merchants)"
    //     ],
    //     "Ambiguous or Non-specified Data": [
    //         "Ambiguous or Non-specified Data"
    //     ]
    // },


    // dataCategories: {
    //     "Personally Identifiable Information": [
    //         "Basic Personal Details",
    //         "Profile Information",
    //         "Identification Documents"
    //     ],
    //     "Contact Information": [
    //         "Device Contacts",
    //         "Social Network Contacts",
    //         "Contacts Provided by Others"
    //     ],
    //     "User-Generated Content": [
    //         "Media Content",
    //         "Textual Content",
    //         "Clipboard Content",
    //         "Content Metadata",
    //         "User Participation Data"
    //     ],
    //     "Communication Data": [
    //         "Direct Messages",
    //         "Merchant Communications",
    //         "Support and Feedback"
    //     ],
    //     "Transaction and Financial Information": [
    //         "Payment Information",
    //         "Purchase Details",
    //         "Delivery Information"
    //     ],
    //     "Device and Technical Information": [
    //         "Device Information",
    //         "Network Information",
    //         "Technical Diagnostics",
    //         "Automatically Assigned Identifiers"
    //     ],
    //     "Location Data": [
    //         "Approximate Location",
    //         "Precise Location (with Permission)",
    //         "Location Tags in Content"
    //     ],
    //     "Usage and Interaction Data": [
    //         "Engagement Metrics",
    //         "Search and Activity History",
    //         "Settings and Preferences"
    //     ],
    //     "Cookies and Tracking Technologies": [
    //         "Cookie Data",
    //         "Tracking Information",
    //         "Usage Purposes"
    //     ],
    //     "Inferred and Analytical Data": [
    //         "Inferred Attributes",
    //         "Content Analysis",
    //         "Behavioral Profiles",
    //         "Aggregated Statistics"
    //     ],
    //     "Third-Party and External Data": [
    //         "Data from Advertising and Analytics Partners",
    //         "Data from Merchants and Service Providers",
    //         "Data from Third-Party Platforms",
    //         "Data from Public and External Sources",
    //         "Mentions in Content"
    //     ],
    //     "Ambiguous or Non-specified Data": [
    //         "All Data"
    //     ]
    // }


    dataCategories: {
        "Personally Identifiable Information": [
            "Basic Personal Details",
            "Date of Birth",
            "Email Address",
            "Identification Documents",
            "Password",
            "Profile Bio",
            "Profile Information",
            "Profile Photo",
            "Proof of Age",
            "Proof of Identity",
            "Telephone Number",
            "Username"
        ],
        "Contact Information": [
            "Contact Information Synced by Others",
            "Contacts Provided by Others",
            "Device Contacts",
            "Email Addresses from Phone Book",
            "Names from Phone Book",
            "Names of Social Network Contacts",
            "Phone Numbers from Phone Book",
            "Profiles of Social Network Contacts",
            "Social Network Contacts",
            "Your Social Network Public Profile Information"
        ],
        "User-Generated Content": [
            "Audio Recordings",
            "Clipboard Content",
            "Comments",
            "Content Metadata",
            "Contest Entries",
            "Creation Date",
            "Creation Time",
            "Creator Identity",
            "Event Participation",
            "Feedback",
            "Form Data",
            "Hashtags",
            "Images from Clipboard",
            "Livestreams",
            "Marketing Campaign Participation",
            "Media Content",
            "Photographs",
            "Research Participation Data",
            "Reviews",
            "Survey Responses",
            "Text from Clipboard",
            "Textual Content",
            "User Participation Data",
            "Videos",
            "Videos from Clipboard"
        ],
        "Communication Data": [
            "Chats with Merchants",
            "Direct Messages",
            "Merchant Communications",
            "Message Content",
            "Policy Violation Reports",
            "Support and Feedback",
            "Timestamps",
            "Virtual Assistant Interactions"
        ],
        "Transaction and Financial Information": [
            "Billing Information",
            "Contact Information (Purchases)",
            "Delivery Information",
            "Delivery Status",
            "Items Purchased",
            "Payment Card Details",
            "Payment Confirmation Details",
            "Payment Information",
            "Purchase Details",
            "Purchase or Payment Dates",
            "Shipping Address",
            "Transaction Amounts"
        ],
        "Device and Technical Information": [
            "Automatically Assigned Identifiers",
            "Crash Reports",
            "Device ID",
            "Device Information",
            "Device Model",
            "IP Address",
            "Keystroke Patterns or Rhythms",
            "Network Information",
            "Network Type",
            "Notification Settings",
            "Operating System",
            "Performance Logs",
            "System Language",
            "Technical Diagnostics",
            "User ID"
        ],
        "Location Data": [
            "Approximate Location",
            "Approximate Location (Device)",
            "Approximate Location (SIM and IP)",
            "Location Information",
            "Location Tags in Content",
            "Location of Content Creation",
            "Precise Location (with Permission)"
        ],
        "Usage and Interaction Data": [
            "Content Viewed",
            "Duration of Use",
            "Engagement Metrics",
            "Frequency of Use",
            "Interactions with Other Users",
            "Search History",
            "Search and Activity History",
            "Settings",
            "Settings and Preferences"
        ],
        "Cookies and Tracking Technologies": [
            "Cookie Data",
            "Cookie Identifiers",
            "Pixel Tags",
            "Session Tokens",
            "Tracking Information",
            "Usage Purposes",
            "Web Beacons"
        ],
        "Inferred and Analytical Data": [
            "Aggregated Statistics",
            "Behavioral Profiles",
            "Content Analysis",
            "Face or Body Part Detection",
            "Inferred Age-Range",
            "Inferred Attributes",
            "Inferred Gender",
            "Information about ad performance",
            "Interests and Preferences",
            "Objects and Scenery Recognition",
            "Speech-to-Text Transcriptions"
        ],
        "Third-Party and External Data": [
            "Activities on Other Websites and Apps",
            "Cookie Identifiers (Third Parties)",
            "Data from Advertising and Analytics Partners",
            "Data from Charity Groups",
            "Data from Government Authorities",
            "Data from Merchants and Service Providers",
            "Data from Professional Organisations",
            "Data from Public and External Sources",
            "Data from Third-Party Platforms",
            "Data from TikTok Developer Tools Integrations",
            "Delivery Information (from Merchants)",
            "Email Address from Third Parties",
            "Hashed Email Addresses",
            "Hashed Phone Numbers",
            "Mentions in Content",
            "Mobile Identifiers for Advertising",
            "Products or Services Purchased Elsewhere",
            "Public Profile from Third Parties",
            "Publicly Available Information",
            "Safety and Content Moderation Data",
            "User ID from Third Parties"
        ],
        "Ambiguous or Non-specified Data": [
            "All Data",
            "Ambiguous or Non-specified Data"
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