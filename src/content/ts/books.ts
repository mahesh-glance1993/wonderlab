// Telangana SCERT textbooks (book, edition, official PDF and chapter titles) per class and subject.
// Generated from src/content/ts/syllabus.json (see docs/TS_SYLLABUS.md) — do not edit by hand.
import type { SourceRef } from '../../shared/content';

type Book = { book: string; edition: string; status: string; url: string | null; chapters: Record<string, string> };
export const TS_BOOKS: Record<string, Record<string, Book>> = {
"10": {
"telugu": {
"book": "Singidi - 2 (సింగిడి - 2), Telugu Reader, First Language, Class 10",
"edition": "2026-27 (imprint: First Published 2015, Republished 2025, 2026)",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/10th%20telugu%20fl%20inner%202026-27.pdf",
"chapters": {
"1": "Danasheelamu (gloss: The virtue of giving)",
"2": "Evari bhasha vallaku vinasompu (gloss: To each their own language is sweet)",
"3": "Veera Telangana (gloss: Heroic Telangana)",
"4": "Kotta Bata (gloss: The new path)",
"5": "Nagara Geetam (gloss: Song of the city)",
"6": "Bhagyodayam (gloss: Dawn of fortune)",
"7": "Sataka Madhurima (gloss: Sweetness of the satakas)",
"8": "Jeevana Bhashyam (gloss: Commentary on life)",
"9": "Golconda Pattanamu (gloss: The city of Golconda)",
"10": "Bhiksha (gloss: Alms)",
"11": "Bhumika (gloss: Preface)",
"12": "Upavachakam: Ramayanam (supplementary reader)"
}
},
"hindi": {
"book": "Hindi (Second Language), Class 10",
"edition": "2026-27 (imprint: First Published 2014, Republished 2025, 2026)",
"status": "official",
"url": "https://drive.google.com/file/d/1nxNnglSi-W1RhvzSXjynelNPpW5Ad1VV/view",
"chapters": {
"1": "Baraste Badal (gloss: Raining clouds)",
"2": "Idgah; also 'Yah rasta kahan jata hai?' (reading-only play)",
"3": "Maa mujhe aane de! ; Shanti ki raah mein (upavachak essay)",
"4": "Kan-kan ka adhikari (gloss: Master of every particle)",
"5": "Lokgeet; Uljhan (reading-only poem)",
"6": "Antarrashtriya star par Hindi (letter); Hum sab ek hain (upavachak essay)",
"7": "Bhakti pad",
"8": "Swarajya ki neenv; Hum Bharatvasi (reading-only poem)",
"9": "Dakshini Ganga Godavari; Apne school ko ek uphaar (upavachak story)",
"10": "Neeti Dohe",
"11": "Jal hi jeevan hai; Kya aapko pata hai? (reading-only PPT)",
"12": "Dharti ke sawal antariksh ke jawab; Anokha upay (upavachak translated story)"
}
},
"english": {
"book": "English, Class X (Third Language / English Reader)",
"edition": "2026-27 (imprint: First Published 2014, Republished 2025, 2026)",
"status": "official",
"url": "https://drive.google.com/file/d/1Nenwz1PBK9b4oCIAkKN1cvpYdFsG4LYS/view",
"chapters": {
"1": "Unit 1 - Personality Development",
"2": "Unit 2 - Wit and Humour",
"3": "Unit 3 - Human Relations",
"4": "Unit 4 - Films and Theatre",
"5": "Unit 5 - Social Issues",
"6": "Unit 6 - Bio-Diversity",
"7": "Unit 7 - Nation and Diversity",
"8": "Unit 8 - Human Rights"
}
},
"maths": {
"book": "Mathematics, Class X",
"edition": "2026-27 (imprint: First Published 2014, Republished 2025, 2026)",
"status": "official",
"url": "https://drive.google.com/file/d/126WOtLyUuhrUgAAjhuoE65-YdUzdwhaZ/view",
"chapters": {
"1": "Real Numbers",
"2": "Sets",
"3": "Polynomials",
"4": "Pair of Linear Equations in Two Variables",
"5": "Quadratic Equations",
"6": "Progressions",
"7": "Coordinate Geometry",
"8": "Similar Triangles",
"9": "Tangents and Secants to a Circle",
"10": "Mensuration",
"11": "Trigonometry",
"12": "Applications of Trigonometry",
"13": "Probability",
"14": "Statistics"
}
},
"physical-science": {
"book": "Physical Science, Class X",
"edition": "2026-27 (imprint: First Published 2013, Republished 2025, 2026)",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/x%20physics%20em%202026-27.pdf",
"chapters": {
"1": "Reflection of Light at Curved Surfaces",
"2": "Chemical Equations",
"3": "Acids, Bases and Salts",
"4": "Refraction of Light at Curved Surfaces",
"5": "Human Eye and Colourful World",
"6": "Structure of Atom",
"7": "Classification of Elements - The Periodic Table",
"8": "Chemical Bonding",
"9": "Electric Current",
"10": "Electromagnetism",
"11": "Principles of Metallurgy",
"12": "Carbon and its Compounds"
}
},
"biological-science": {
"book": "Biological Science, Class X",
"edition": "2026-27 (imprint: First Published 2013, Republished 2025, 2026)",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/x%20biology%20em%20inner%202026-27.pdf",
"chapters": {
"1": "Nutrition",
"2": "Respiration",
"3": "Circulation",
"4": "Excretion",
"5": "Coordination",
"6": "Reproduction",
"7": "Coordination in Life Processes",
"8": "Heredity - Evolution",
"9": "Our Environment",
"10": "Natural Resources"
}
},
"social": {
"book": "Social Studies, Class X",
"edition": "2026-27 (imprint: First Published 2014, Republished 2025, 2026)",
"status": "official",
"url": "https://drive.google.com/file/d/1VEb5YS5E5493ESRMmuOrgYjmEdMfrrHV/view",
"chapters": {
"1": "India: Relief Features",
"2": "Ideas of Development",
"3": "Production and Employment",
"4": "Climate of India",
"5": "Indian Rivers and Water Resources",
"6": "The Population",
"7": "Settlements - Migrations",
"8": "Rampur: A Village Economy",
"9": "Globalisation",
"10": "Food Security",
"11": "Sustainable Development with Equity",
"12": "World Between the World Wars (1914-1945)",
"13": "National Liberation Movements in the Colonies",
"14": "National Movement in India - Partition & Independence: 1939-1947",
"15": "The Making of Independent India's Constitution",
"16": "Election Process in India",
"17": "Independent India (The First 30 years - 1947-77)",
"18": "Emerging Political Trends 1977 to 2000",
"19": "Post-War World and India",
"20": "Social Movements in Our Times",
"21": "The Movement for the Formation of Telangana State"
}
}
},
"9": {
"telugu": {
"book": "Telugu (First Language), Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/9th%20telugu%20fl%20inner%202026-27.pdf",
"chapters": {
"1": "Dharmarjunulu (Dharmaraja and Arjuna) [gloss]",
"2": "Burgula As I Knew Him [gloss]",
"3": "The Migrant Labourer [gloss]",
"4": "Face to Face with Rangacharya [gloss]",
"5": "The Sweetness of Shatakas [gloss]",
"6": "Be Ready to Take the Pledge [gloss]",
"7": "Friendship [gloss]",
"8": "Spirit of the Movement [gloss]",
"9": "Chorus [gloss]",
"10": "Speech, the True Ornament [gloss]",
"11": "The Crow [gloss]",
"12": "A Sweet Greeting [gloss]",
"U1": "Kumram Bheem (upavachakam)",
"U2": "Suravaram Pratapa Reddy (upavachakam)",
"U3": "Kaloji (upavachakam)",
"U4": "Acharya Kothapalli Jayashankar (upavachakam)",
"U5": "Swami Vivekananda (upavachakam)",
"U6": "I am... Savitribai [gloss] (upavachakam)"
}
},
"hindi": {
"book": "Hindi (Second Language), Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/13Kz1KMwApdZ3l0_75hyJPyGua9vP9aC0/view?usp=sharing",
"chapters": {
"1": "In the Land Where the Ganga Flows [gloss]",
"2": "The Singing Bird [gloss]",
"3": "Change Your Thinking [gloss]",
"U1": "Taare Zameen Par",
"4": "Lessons from Nature [gloss]",
"5": "Football",
"6": "Letter to a Daughter [gloss]",
"U2": "Sammakka-Sarakka Jatara",
"7": "My Life [gloss]",
"8": "The Yaksha's Questions [gloss]",
"9": "Ramzan",
"U3": "The Clever Boy [gloss]",
"10": "Immortal Words (dohas of Kabir and Rahim) [gloss]",
"11": "Sunita Williams",
"12": "Wake Up, Consumer! [gloss]",
"U4": "Make Your Own Place [gloss]"
}
},
"english": {
"book": "Our World Through English, Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/16dzJOmSx6YXVg6op5rQTW-32BnSAdow5/view?usp=sharing",
"chapters": {
"1": "Humour",
"2": "Games and Sports",
"3": "School Life",
"4": "Environment",
"5": "Disasters",
"6": "Freedom",
"7": "Theatre",
"8": "Travel and Tourism"
}
},
"maths": {
"book": "Mathematics, Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1SmmEqWMUieFqGpHoTAQO3-ERhqj4iLMF/view?usp=sharing",
"chapters": {
"1": "Real Numbers",
"2": "Polynomials and Factorisation",
"3": "The Elements of Geometry",
"4": "Lines and Angles",
"5": "Co-Ordinate Geometry",
"6": "Linear Equations in Two Variables",
"7": "Triangles",
"8": "Quadrilaterals",
"9": "Statistics",
"10": "Surface areas and Volumes",
"11": "Areas",
"12": "Circles",
"13": "Geometrical Constructions",
"14": "Probability",
"15": "Proofs in Mathematics"
}
},
"physical-science": {
"book": "Physical Science, Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/ix%20physics%20em%202026-27.pdf",
"chapters": {
"1": "Matter around us",
"2": "Motion",
"3": "Laws of motion",
"4": "Refraction of light at plane surfaces",
"5": "Gravitation",
"6": "Is matter pure?",
"7": "Atoms and molecules and chemical reactions",
"8": "Floating bodies",
"9": "What is inside the atom",
"10": "Work and energy",
"11": "Heat",
"12": "Sound"
}
},
"biological-science": {
"book": "Biological Science, Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/ix%20biology%20em%20inner%202026-27.pdf",
"chapters": {
"1": "Cell - Structure and Functions",
"2": "Plant Tissues",
"3": "Animal Tissues",
"4": "Transportation of materials through Plasma Membrane",
"5": "Diversity in Living Organisms - Classification",
"6": "Sense Organs",
"7": "Animal Behaviour",
"8": "Challenges in Improving Agricultural Production",
"9": "Adaptations in Different Ecosystems",
"10": "Soil Pollution",
"11": "Biogeochemical cycles"
}
},
"social": {
"book": "Social Studies, Class IX",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1YzvVbYqQz3495Zpt9aJ9YKRQrTVG6Huy/view?usp=sharing",
"chapters": {
"1": "Our Earth",
"2": "The Natural Realms of the Earth - Lithosphere",
"3": "Hydrosphere",
"4": "Atmosphere",
"5": "Biosphere",
"6": "Agriculture in India",
"7": "Industries in India",
"8": "Service Activities in India",
"9": "Credit in the Financial System",
"10": "Prices and Cost of Living",
"11": "The Government Budget and Taxation",
"12": "Democratic and Nationalist Revolutions: 17th, 18th & 19th Centuries",
"13": "Industrialisation and Social Change",
"14": "Social Protest Movements",
"15": "Colonialism in Latin America, Asia and Africa",
"16": "Impact of Colonialism in India",
"17": "Expansion of Democracy",
"18": "Democracy: An Evolving Idea",
"19": "Human Rights and Fundamental Rights",
"20": "Women Protection Acts",
"21": "Disaster Management",
"22": "Traffic Education"
}
}
},
"8": {
"telugu": {
"book": "Telugu (First Language) Class 8 - 8va Taragathi",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/8th%20telugu%20fl%20inner%202026-27.pdf",
"chapters": {
"1": "Tyaganirathi (gloss: devotion to sacrifice)",
"2": "Samudra Prayanam (gloss: sea voyage)",
"3": "Bandari Basavanna",
"4": "Asamanyulu (gloss: extraordinary people)",
"5": "Sataka Sudha (gloss: nectar of satakas)",
"6": "Telugu Janapada Geyalu (gloss: Telugu folk songs)",
"7": "Manjeera",
"8": "Chinnappude (gloss: even when young)",
"9": "Amarulu (gloss: the immortals)",
"10": "Singareni",
"11": "Kapubidda (gloss: farmer's child)",
"12": "Matlade Nagali (gloss: the talking plough)",
"U": "Upavachakam (supplementary reader)",
"G": "Padavignanam (glossary / word knowledge)"
}
},
"hindi": {
"book": "Hindi (Second Language) Class 8",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1Gl9EXdG7-x1ZEwNSM7dTzPKQG1GCLpmx/view?usp=sharing",
"chapters": {
"1": "Hum Honge Kamyab (gloss: We shall overcome)",
"*": "Aao Patrika Nikalein (gloss: let's bring out a magazine)",
"2": "Raja Badal Gaya (gloss: the king changed)",
"3": "Pyara Gaon (gloss: lovely village)",
"4": "Kaun? (gloss: Who?)",
"5": "Dharti ki Aankhen (gloss: eyes of the earth)",
"6": "Dilli se Patra (gloss: letter from Delhi)",
"7": "Tyoharon ka Desh (gloss: land of festivals)",
"8": "Chawal ke Dane (gloss: grains of rice)",
"9": "Main Cinema Hoon... (gloss: I am cinema)",
"10": "Anmol Ratna (gloss: priceless gems)",
"11": "Haar ke Aage Jeet Hai (gloss: victory lies beyond defeat)",
"12": "Badhte Kadam (gloss: steps forward)"
}
},
"english": {
"book": "English Class VIII (Reader)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1bp9v7qetgkuykOHXZOFfbI7h09s5amlB/view?usp=sharing",
"chapters": {
"1": "Unit 1: Family",
"2": "Unit 2: Social Issues",
"3": "Unit 3: Humanity",
"4": "Unit 4: Science and Technology",
"5": "Unit 5: Education and Career",
"6": "Unit 6: Art and Culture",
"7": "Unit 7: Women Empowerment",
"8": "Unit 8: Gratitude"
}
},
"maths": {
"book": "Mathematics Class VIII",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1YesoTj5iiKRiuW4IksbMpRzAPc-kn4aH/view?usp=sharing",
"chapters": {
"1": "Rational Numbers",
"2": "Linear Equations in One Variable",
"3": "Construction of Quadrilaterals",
"4": "Exponents and Powers",
"5": "Comparing Quantities using Proportion",
"6": "Square Roots and Cube Roots",
"7": "Frequency Distribution Tables and Graphs",
"8": "Exploring Geometrical Figures",
"9": "Area of Plane Figures",
"10": "Direct and Inverse Proportions",
"11": "Algebraic Expressions",
"12": "Factorisation",
"13": "Visualising 3-D in 2-D",
"14": "Surface Areas and Volume (Cube and Cuboid)",
"15": "Playing with Numbers"
}
},
"physical-science": {
"book": "Physical Science Class VIII",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/viii%20class%20physical%20science_em_2026-27.pdf",
"chapters": {
"1": "Force",
"2": "Friction",
"3": "Synthetic Fibres and Plastics",
"4": "Metals and Non-metals",
"5": "Sound",
"6": "Reflection of Light by Plane Surfaces",
"7": "Coal and Petroleum",
"8": "Combustion, Fuels and Flame",
"9": "Electrical Conductivity of Liquids",
"10": "Some Natural Phenomena",
"11": "Stars and Solar System",
"12": "Graphs of Motion"
}
},
"biological-science": {
"book": "Biological Science Class VIII",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/viii%20biology%20em%20inner%202026-27.pdf",
"chapters": {
"1": "What is Science?",
"2": "Cell - The Basic Unit of Life",
"3": "The World of Microorganisms (Parts 1 & 2)",
"4": "Reproduction in Animals",
"5": "The Age of Adolescence",
"6": "Biodiversity - Conservation",
"7": "Different Ecosystems",
"8": "Production of Food from Plants",
"9": "Production of Food from Animals",
"10": "Not for Breathing - Not for Drinking",
"11": "Why do we fall ill?"
}
},
"social": {
"book": "Social Studies Class VIII",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1IoJtHrchl6lZ7Bz6ayEN3k2ZZEktiwaS/view?usp=sharing",
"chapters": {
"1": "Reading and Analysis of Maps",
"2": "Energy from the Sun",
"3": "Earth Movements and Seasons",
"4": "The Polar Regions",
"5": "Forests: Uses and Protection",
"6": "Minerals and Mining",
"7": "Money and Banking",
"8": "Impact of Technology on Livelihoods",
"9": "Public Health and the Government",
"10": "Landlords and Tenants under the British and the Nizam",
"11A": "National Movement - The Early Phase 1885-1919",
"11B": "National Movement - The Last Phase 1919-1947",
"12": "Freedom Movement in Hyderabad State",
"13": "The Indian Constitution",
"14": "Parliament and Central Government",
"15": "Law and Justice - A Case Study",
"16": "Abolition of Zamindari System",
"17": "Understanding Poverty",
"18": "Rights Approach to Development",
"19": "Social and Religious Reform Movements",
"20": "Understanding Secularism",
"21": "Performing Arts and Artistes in Modern Times",
"22": "Film and Print Media",
"23": "Sports: Nationalism and Commerce",
"24": "Disaster Management"
}
}
},
"7": {
"telugu": {
"book": "Nava Vasantham - 2, Telugu Vachakam, Class 7 (for Telugu and English media)",
"edition": "2025-26 (imprint 'Republished - 2025'; listed on the SCERT 2026-27 e-textbook page)",
"status": "official",
"url": "https://drive.google.com/file/d/13IAMLK4FBImR6h0I2TXGv0xWd59o44aN/view?usp=sharing",
"chapters": {
"1": "Chaduvu (gloss: education)",
"2": "Nayanamma (gloss: grandmother)",
"3": "Sataka Sudha",
"4": "Amma Gnapakalu (gloss: memories of mother)",
"5": "Palle Andalu (gloss: beauty of the village)",
"6": "Prerana (gloss: inspiration)",
"7": "Shilpi (gloss: the sculptor)",
"8": "Gramalaloni Vedukalu Kreedavinodalu (gloss: village festivals and games)",
"9": "Ekulam? (gloss: which caste?)",
"10": "Seetha Ishtalu (gloss: Seetha's wishes)",
"11": "Srilu Pongina Jeevagadda (gloss: the land overflowing with prosperity)",
"12": "Rani Shankaramma",
"U": "Upavachakam (supplementary reader)",
"G": "Padalu-Arthalu & Visheshamshalu (glossary)"
}
},
"hindi": {
"book": "Hindi (Second Language) Class 7",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/7th%20hindi%20sl-2026-27.pdf",
"chapters": {
"1": "Man Karta Hai (gloss: the heart wishes)",
"2": "Saccha Dost (gloss: true friend)",
"R": "Ghante ki Aawaz (gloss: sound of the bell)",
"3": "Hindi Diwas (gloss: Hindi Day)",
"4": "Apna Pyara Bharat Desh (gloss: our beloved India)",
"5": "Aasman Gira (gloss: the sky fell)",
"6": "Chhutti Patra (gloss: leave letter)",
"7": "Charminar",
"8": "Hamare Tyohar (gloss: our festivals)",
"9": "Gusadi",
"10": "Kabir ke Dohe (gloss: couplets of Kabir)",
"11": "Sahasi Sunita (gloss: brave Sunita)",
"12": "Atmavishwas (gloss: self-confidence)"
}
},
"english": {
"book": "English Class VII (Reader)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1d-d4lfVBxr_GoatbrmZ4ylL4sV2baZlm/view?usp=sharing",
"chapters": {
"1": "Unit 1",
"2": "Unit 2",
"3": "Unit 3",
"4": "Unit 4",
"5": "Unit 5",
"6": "Unit 6",
"7": "Unit 7",
"8": "Unit 8"
}
},
"maths": {
"book": "Mathematics Class VII",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1pQIYcsQwTC5BWfKBOxSCh7mrZpxFY9L8/view?usp=sharing",
"chapters": {
"1": "Integers",
"2": "Fractions, Decimals and Rational Numbers",
"3": "Simple Equations",
"4": "Lines and Angles",
"5": "Triangle and Its Properties",
"6": "Ratio - Applications",
"7": "Data Handling",
"8": "Congruency of Triangles",
"9": "Construction of Triangles",
"10": "Algebraic Expressions",
"11": "Powers and Exponents",
"12": "Quadrilaterals",
"13": "Area and Perimeter",
"14": "Understanding 3D and 2D Shapes",
"15": "Symmetry"
}
},
"science": {
"book": "General Science Class VII",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/7th%20science%20em%20pdf%202026-27.pdf",
"chapters": {
"1": "Food Components",
"2": "Acids and Bases",
"3": "Silk - Wool",
"4": "Motion - Time",
"5": "Heat - Measurement",
"6": "Weather - Climate",
"7": "Electric Current - Its Effect",
"8": "Air, Winds and Cyclones",
"9": "Reflection of Light",
"10": "Nutrition in Plants",
"11": "Respiration in Organisms",
"12": "Reproduction in Plants",
"13": "Seed Dispersal",
"14": "Water - Too Little to Waste",
"15": "Soil - Our Life",
"16": "Forest - Our Life",
"17": "Changes Around Us"
}
},
"social": {
"book": "Social Studies Class VII",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1VUj8GjP5TD6HxlppAqFdhNASQQIi2nAp/view?usp=sharing",
"chapters": {
"1": "Reading Maps of Different Kinds",
"2": "Rain and Rivers",
"3": "Tanks and Ground Water",
"4": "Oceans and Fishing",
"5": "Europe",
"6": "Africa",
"7": "Handicrafts and Handlooms",
"8": "Industrial Revolution",
"9": "Production in a Factory - A Paper Mill",
"10": "Importance of Transport System",
"11": "New Kings and Kingdoms",
"12": "The Kakatiyas - Emergence of a Regional Kingdom",
"13": "The Kings of Vijayanagara",
"14": "Mughal Empire",
"15": "Establishment of the British Empire in India",
"16": "Making of Laws in the State Assembly",
"17": "Implementation of Laws in the District",
"18": "Caste Discrimination and the Struggle for Equalities",
"19": "Livelihood and Struggles of Urban Workers",
"20": "Folk - Religion",
"21": "Devotional Paths to the Divine",
"22": "Rulers and Buildings"
}
}
},
"6": {
"telugu": {
"book": "Telugu (First Language) - Class 6",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1ib0L5l-LoVZXoKkMrbcqfDIn241IN1nU/view?usp=sharing",
"chapters": {
"1": "Abhinandana (Felicitation) [gloss]",
"2": "Snehabandham (Bond of friendship) [gloss]",
"3": "Varsham (Rain) [gloss]",
"4": "Lekha (Letter) [gloss]",
"5": "Shatakasudha (Nectar of shatakas) [gloss]",
"6": "Potana Balyam (Potana's childhood) [gloss]",
"7": "Uduta Sayam (The squirrel's help) [gloss]",
"8": "Cheruvu (The village tank) [gloss]",
"9": "Cheemalabaru (Line of ants) [gloss]",
"10": "Balanagamma [gloss]",
"11": "Palleturi Pillagada! (Village lad!) [gloss]",
"12": "Kapadukundam (Let us protect) [gloss]",
"U1": "Somanadri [gloss]",
"U2": "Mana Jathara - Jana Jathara (Our fair, people's fair) [gloss]",
"U3": "Elukamma Pelli (The mouse's wedding) [gloss]",
"U4": "Telangana Pallelu - Samskruthi (Telangana villages and culture) [gloss]",
"U5": "Vaggeyakarudu Ramadasu (Composer Ramadasu) [gloss]"
}
},
"hindi": {
"book": "Hindi (Second Language) - Class 6",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/6th%20hindi%20sl-2026-27.pdf",
"chapters": {
"I-0": "Pathshala (School)",
"1": "Aam Le Lo Aam! (Buy mangoes!)",
"2": "Hamara Gaon (Our village)",
"3": "Railway Station",
"II-0": "Teen Mitra (Three friends)",
"4": "Bazaar (Market)",
"5": "Mera Parivar (My family)",
"6": "Chidiyaghar (Zoo)",
"III-0": "(untitled picture story)",
"7": "Maidan (Playground)",
"8": "Bal Divas (Children's Day)",
"9": "Khushiyon ki Duniya (World of happiness)",
"IV-0": "Hind Desh ke Nivasi",
"10": "Chukki aur Jabbar",
"11": "Udyan (Garden)",
"12": "Bachche Chale Cricket Khelne (Children go to play cricket)"
}
},
"english": {
"book": "English Reader - Class 6",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/6%20english%20reader-2026-27.pdf",
"chapters": {
"1": "Unit 1 - A. Peace and Harmony; B. I Want Peace (poem); C. Grand Contest in the Forest",
"2": "Unit 2 - A. Telangana, The Pride of the People; B. In the Bazaars of Hyderabad (poem); C. Bammera Pothana, the jewel of Telugu literature",
"3": "Unit 3 - A. What Can a Dollar and Eleven Cents Do?; B. A Nation's Strength (poem); C. Wilma Rudolph",
"4": "Unit 4 - A. An Adventure; B. The Naughty Boy (poem); C. Tanaji Malusare",
"5": "Unit 5 - A. Plant a Tree; B. If a Tree Could Talk (poem); C. Children, Speak Up!",
"6": "Unit 6 - A. Rip Van Winkle; B. My Shadow (poem); C. Gulliver's Travels",
"7": "Unit 7 - A. P.T. Usha, the Golden Girl; B. Indian Cricket Team (poem); C. Ranji's Wonderful Bat",
"8": "Unit 8 - A. Half the Price; B. The Sheik's White Donkey"
}
},
"maths": {
"book": "Mathematics - Class 6 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/19WTnui5fH68_M5iEBHBXV8e9VjT_cl8N/view?usp=sharing",
"chapters": {
"1": "Knowing Our Numbers",
"2": "Whole Numbers",
"3": "Playing with Numbers",
"4": "Basic Geometrical Ideas",
"5": "Measures of Lines and Angles",
"6": "Integers",
"7": "Fractions and Decimals",
"8": "Data Handling",
"9": "Introduction to Algebra",
"10": "Perimeter and Area",
"11": "Ratio and Proportion",
"12": "Symmetry",
"13": "Practical Geometry",
"14": "Understanding 3D and 2D Shapes"
}
},
"science": {
"book": "General Science - Class 6 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/16yUnXMgLAJVtFeW-54b2DIOIB6d0Tbcs/view?usp=sharing",
"chapters": {
"1": "Our Food",
"2": "Playing with Magnets",
"3": "Rain: Where Does It Come From?",
"4": "What Do Animals Eat?",
"5": "Materials - Objects",
"6": "Habitat",
"7": "Separation of Substances",
"8": "Fibre to Fabric",
"9": "Plants: Parts and Functions",
"10": "Changes Around Us",
"11": "Water in Our Life",
"12": "Simple Electric Circuits",
"13": "Learning How to Measure",
"14": "Movements in Animals",
"15": "Light, Shadows and Images",
"16": "Living and Non-living"
}
},
"social": {
"book": "Social Studies - Class 6 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1QCcRQb1PT48L1roSO0K1cMWhyeIiq-wi/view?usp=sharing",
"chapters": {
"1": "Reading and Making Maps",
"2": "Globe - A Model of the Earth",
"3": "Land Forms (Part A); Penamakuru - A Village in the Krishna Delta (Part B)",
"4": "Dokur - A Village on the Plateau",
"5": "Penugolu - A Village on the Hills",
"6": "From Gathering Food to Growing Food - The Earliest People",
"7": "Agriculture in Our Times",
"8": "Trade in Agricultural Produce (Parts A and B)",
"9": "Community Decision Making in a Tribe",
"10": "Emergence of Kingdoms and Republics",
"11": "First Empires",
"12": "Democratic Government",
"13": "Village Panchayats",
"14": "Local Self-Government in Urban Areas",
"15": "Diversity in Our Society",
"16": "Towards Gender Equality",
"17": "Religion and Society in Early Times",
"18": "Devotion and Love towards God",
"19": "Language, Script and Scriptures",
"20": "Sculptures and Buildings",
"21": "Greenery in Telangana"
}
}
},
"5": {
"telugu": {
"book": "Telugu (First Language) - Class 5",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/5th%20tel%20fl%202026-27%20inner%20pages.pdf",
"chapters": {
"0": "Samsiddhata Patalu (Readiness lessons) [gloss]",
"1": "Mana Jenda (Our flag) [gloss]",
"2": "Yadagirigutta [gloss]",
"3": "Salar Jung Museum [gloss]",
"3*": "Pyara Hyderabad (Beloved Hyderabad) [gloss]",
"4": "Needa Khareedu (Price of a shadow) [gloss]",
"5": "Neethi Padyalu (Moral verses) [gloss]",
"5*": "Telugu Samvatsaralu (Telugu years) [gloss]",
"6": "Manasunte Margamuntadi (Where there's a will there's a way) [gloss]",
"6*": "Bonalu [gloss]",
"7": "Chityala Ailamma [gloss]",
"8": "Vruthacheyam (We won't waste) [gloss]",
"8*": "Christmas [gloss]",
"9": "Gopi Dappu (Gopi's drum) [gloss]",
"10": "Chinthachettu (The tamarind tree) [gloss]"
}
},
"english": {
"book": "My English World - Class V",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/5%20english%20reader-2026-27.pdf",
"chapters": {
"0": "Bridging Gap Activity Pictures",
"1": "Unit 1 - Let's be Friends; The Best of Friends",
"2": "Unit 2 - Karate Kitten; Our Kittens",
"3": "Unit 3 - Together We Live; The Three Little Rabbits",
"4": "Unit 4 - A Big Surprise; Five Friendly Farmers",
"5": "Unit 5 - The Food We Eat; Junk Food, Junk Food - Go Away...",
"6": "Unit 6 - The Witty Nasruddin; The Clever Jackal",
"7": "Unit 7 - I Was Bad at Cricket; Our Legacy",
"8": "Unit 8 - Will Power; We Shall Overcome"
}
},
"maths": {
"book": "Mathematics - Class 5 (Bilingual Telugu-English, Parts 1 and 2)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1xAZgNJSiLKcOjCH7ujOm_sp1mBzgqth6/view?usp=sharing",
"chapters": {
"1": "Bigger Numbers",
"2": "Multiply and Divide",
"3": "Smart Tables",
"4": "Smaller Lengths - Bigger Lengths",
"5": "Spaces and Boundaries - 1",
"6": "Angles in Our Surroundings",
"7": "Playing with Shapes",
"8": "Spaces and Boundaries - 2",
"9": "Maps and Routes",
"10": "How Much Does It Weigh?",
"11": "Many More Litres",
"12": "Time",
"13": "Fractions",
"14": "Factors and Multiples",
"15": "Symmetry",
"16": "Patterns",
"17": "Artificial Intelligence (AI) and Digital Literacy",
"18": "Trip to the Golkonda Fort"
}
},
"evs": {
"book": "Environmental Studies - Class 5 (Bilingual, Parts 1 and 2)",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/5th%20evs%20bilingual%20part-1%20inner%202026-27.pdf",
"chapters": {
"1": "Animals - The Base of Our Life",
"2": "Agriculture - Crops",
"3": "Let's Grow Trees",
"4": "Nutritious Food",
"5": "Our Body Parts - Sense Organs",
"6": "Our Body - Its Internal Organ System",
"7": "Forests - Tribals",
"8": "Rivers - Means of Livelihood",
"9": "Atmosphere - Wind",
"10": "The Sun and the Planets",
"11": "Safety and First Aid",
"12": "Historical Sites - Wanaparthy Fort",
"13": "Energy",
"14": "Our Country - World",
"15": "Our Constitution",
"16": "Child Rights"
}
}
},
"4": {
"telugu": {
"book": "Telugu (First Language) - Class 4",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1mtAE1zYwIeOFf0vz4fBSCaBFiAkAPsJr/view?usp=sharing",
"chapters": {
"0": "Samsiddhata Patalu (Readiness lessons) [gloss]",
"1": "Telangana Vaibhavam (Glory of Telangana) [gloss]",
"1*": "Pillallara Rarandi... (Come, children...) [gloss]",
"2": "Paramanandayya Shishyulu (Paramanandayya's disciples) [gloss]",
"2*": "Chinni Krishnudu (Little Krishna) [gloss]",
"3": "Vinayaka Chavithi [gloss]",
"3*": "Ramzan [gloss]",
"4": "Deshamunu Preminchumanna (Love your country) [gloss]",
"4*": "Kalaratnalu (Jewels of art) [gloss]",
"5": "Chinnari Kala (A little one's dream) [gloss]",
"6": "Sumathi Shatakam [gloss]",
"7": "Nenu... Godavarini (I am... the Godavari) [gloss]",
"8": "Eluka Vindu (The mouse's feast) [gloss]",
"8*": "Pantasiri (Wealth of the harvest) [gloss]",
"9": "Bomma Gurram (Toy horse) [gloss]",
"9*": "Evaru Nenu? (Who am I?) [gloss]",
"10": "Matala Prayanam (Journey of words) [gloss]"
}
},
"english": {
"book": "English Reader - Class 4",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/4%20english%20reader-2026-27.pdf",
"chapters": {
"0": "Bridging Gap Activity Pictures",
"1": "Unit 1 - Ekalavya; School is Fun",
"2": "Unit 2 - The Pancake; The Monkeys Go Fasting",
"3": "Unit 3 - What is a Tree?; The Lion King",
"4": "Unit 4 - The Miller, His Son and His Donkey; Be Happy",
"5": "Unit 5 - Fudi's Desert Journey; Travelling, Travelling",
"6": "Unit 6 - Honesty; The Blind Boy",
"7": "Unit 7 - The Boy and the Catapult; Bird Talk",
"8": "Unit 8 - The Unlucky Face; Superstitions Around the World"
}
},
"maths": {
"book": "Mathematics - Class 4 (Bilingual Telugu-English, Parts 1 and 2)",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/12ULqAo3FJFo2zJtyYYgYNDl2-UVg35n5/view?usp=sharing",
"chapters": {
"1": "Many Objects - Different Shapes",
"2": "Different Views - Different Sides",
"3": "Some More Shapes",
"4": "Knowing Numbers",
"5": "How Much More - How Much Less?",
"6": "How Many Times?",
"7": "Equal Shares and Equal Groups",
"8": "How Long Is This?",
"9": "How Much Does It Weigh?",
"10": "How Much Do These Bottles Hold?",
"11": "Tick-Tock Goes the Clock",
"12": "Dividing into Equal Parts",
"13": "Smart Tables",
"14": "Borders and Boundaries",
"15": "Halves That Look Alike",
"16": "Patterns",
"17": "Artificial Intelligence and Digital Literacy",
"18": "Maths Around Us"
}
},
"evs": {
"book": "Environmental Studies - Class 4 (Parts 1 and 2, EM/TM)",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/4th%20evs%20part-1%202026-27.pdf",
"chapters": {
"1": "Changing Family Structure",
"2": "Different Games and Rules",
"3": "Various Types of Animals",
"4": "The Life Styles of Animals - Bio Diversity",
"5": "Plants Around Us",
"6": "Find the Way / Directions",
"7": "Public Institutions",
"8": "Houses - Construction - Sanitation",
"9": "Our Village - Our Tanks",
"10": "Our Food - Our Health",
"11": "From Village to Delhi",
"12": "Indian History and Culture"
}
}
},
"3": {
"telugu": {
"book": "Telugu (First Language) - Class 3",
"edition": "2026-27 (as listed; year not printed in extracted front pages)",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/class-3%20telugu%20fl%20inner%202026-27.pdf",
"chapters": {
"0": "Samsiddhata Patalu 1-10 (Readiness lessons) [gloss]",
"1": "Vanadevuda! (O Rain God!) [gloss]",
"2": "Bala Bheemudu (Young Bhima) [gloss]",
"3": "Amma (Mother) [gloss]",
"3*": "Daya (Kindness) [gloss]",
"4": "Mana Pandugalu (Our festivals) [gloss]",
"5": "Kakula Lekka (The crows' count) [gloss]",
"6": "Legaduda (The calf) [gloss]",
"7": "Neeti Andalu (Beauty of waters) [gloss]",
"8": "Mathimarupu Eega (The forgetful fly) [gloss]",
"9": "Ememi Choodali? (What all to see?) [gloss]",
"10": "Vemana Shatakam [gloss]",
"11": "Telangana Rashtra Chihnalu (Telangana state symbols) [gloss]",
"12": "Thotathalli (Mother garden) [gloss]",
"12*": "Pakshulu (Birds) [gloss]",
"13": "Mahatmudu (The Mahatma) [gloss]",
"13*": "Aata Bathuku (A life of play) [gloss]",
"14": "Chettu Korika (The tree's wish) - imaginative [gloss]",
"14*": "Kobbari Bondam (Tender coconut) [gloss]"
}
},
"english": {
"book": "English Reader - Class 3",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1m9ZIXipbYuv1gftJpy35toprmxjIH1VU/view?usp=sharing",
"chapters": {
"0": "Bridging Gap Activity",
"1": "Unit 1 - Talking Train",
"2": "Unit 2 - Swamy and the Magic Beans",
"3": "Unit 3 - I Like It This Way",
"4": "Unit 4 - The Mouse and the Pencil",
"5": "Unit 5 - The Little Red Hen",
"6": "Unit 6 - Mary and the Three Bears",
"7": "Unit 7 - The Animal School",
"8": "Unit 8 - Birbal Outwits the Cheat"
}
},
"maths": {
"book": "Mathematics - Class 3 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/class%203_maths%20em%20inner%202026-27.pdf",
"chapters": {
"1": "Shapes and Spatial Understanding",
"2": "Numbers",
"3": "Addition",
"4": "Subtraction",
"5": "Using Addition and Subtraction",
"6": "Multiplication",
"7": "Division",
"8": "Measurement",
"9": "Time",
"10": "Maths in Day-to-Day Life",
"11": "Data Handling",
"12": "Patterns",
"13": "Introduction of Artificial Intelligence and Digital Literacy"
}
},
"evs": {
"book": "Environmental Studies - Class 3 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks/class-3%20evs%20em%20inner%202026-7%20%281%29.pdf",
"chapters": {
"1": "Family",
"2": "Division of Work",
"3": "Let Us Play",
"4": "Shelters of Animals",
"5": "The Plants Around Us",
"6": "Bonding with Leaves",
"7": "The Food We Eat",
"8": "Food Habits",
"9": "Our Village",
"10": "Different Types of Houses",
"11": "Clean House is the Beautiful House",
"12": "Gems of Clay",
"13": "Colourful Dresses",
"14": "Where are These Placed?",
"15": "Water - Our Needs",
"16": "Let's Go to Countryside"
}
}
},
"2": {
"telugu": {
"book": "Telugu (First Language) - Class 2",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/class-2%20telugu%20fl%20inner%202026-27.pdf",
"chapters": {
"0": "Chitrakathalu, Varnamala (Picture stories, alphabet) [gloss]",
"1": "Rangu Rangula Poolu (Colourful flowers) [gloss]",
"2": "Bathukamma Peruddam! [gloss]",
"3": "Bathukamma Aadudam! [gloss]",
"4": "Bathukammalettudam! [gloss]",
"5": "Poyira Gowramma! [gloss]",
"6": "Allo Neredallo [gloss]",
"7": "Pottelu Kannathalli [gloss]",
"7*": "Pitta - Pathangi (Bird and kite) [gloss]",
"8": "Thane Thandana [gloss]",
"8*": "Sopathi [gloss]",
"9": "Maa Bujji (Our little one) [gloss]",
"10": "Bukkedantha Buvva (A mouthful of food) [gloss]",
"11": "Muthyala Chemmachekka [gloss]",
"11*": "Alochana (Thought / idea) [gloss]",
"12": "Erra Dabbala Bandi (Red-box cart) [gloss]",
"13": "O Lachha Gummadi [gloss]",
"14": "Kallalla Gajja [gloss]",
"15": "Telangana Rashtram (Telangana state) [gloss]",
"16": "Thelivaina Rani (Clever Rani) [gloss]",
"17": "Kodipilla (Chick) [gloss]",
"17*": "Upayam (A clever plan) [gloss]",
"18": "Nayana... Puli (Father... a tiger!) [gloss]",
"19": "Telugu Nelalu (Telugu months) [gloss]",
"19*": "Paramanandayya Shishyulu [gloss]",
"20": "Sri Krishna Shatakam [gloss]"
}
},
"english": {
"book": "English Reader - Class 2",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1QokLIFk2gEWjfxrt_HRx6D6NrKqgBfch/view?usp=sharing",
"chapters": {
"1": "Unit 1 - At the Zoo",
"2": "Unit 2 - Where Are You, Sweety?",
"3": "Unit 3 - A Visit to Uncle's House",
"4": "Unit 4 - Snoopy Goes to School (title partly read: '... TO SCHOOL')",
"5": "Unit 5 - Rain... Rain...",
"6": "Unit 6 - Here Is Your Coin!",
"7": "Unit 7 - What's My Name?",
"8": "Unit 8 - Together We Pull"
}
},
"maths": {
"book": "Mathematics - Class 2 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/class%202_math%20em%20inner%202026-27.pdf",
"chapters": {
"1": "Numbers from 1 to 20",
"2": "Numbers from 10 to 99",
"3": "Numbers with Three Digits",
"4": "Comparing Three-Digit Numbers",
"5": "Addition of Numbers",
"6": "Addition of Numbers (Carry Over)",
"7": "Subtraction",
"8": "Subtraction of Numbers",
"9": "Digital Literacy",
"10": "Multiplication of Numbers (I)",
"11": "Multiplication Tables (1 to 10)",
"12": "Multiplication of Numbers (II)",
"13": "Division of One Number by Another Number",
"14": "Length of Things",
"15": "Weight of Things",
"16": "Measure of Liquids",
"17": "Time",
"18": "Money",
"19": "Shapes",
"20": "Let Us Record"
}
}
},
"1": {
"telugu": {
"book": "Telugu (First Language) - Class 1",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/class-1%20telugu%20fl%20inner%202026-27.pdf",
"chapters": {
"0": "Samsiddhata Patalu (Readiness) [gloss]",
"1": "Tabala [gloss]",
"2": "Kanjara [gloss]",
"3": "Aata (Play) [gloss]",
"4": "Ungaram (Ring) [gloss]",
"5": "Shanaga (Chickpea) [gloss]",
"6": "Anapa (Field bean) [gloss]",
"7": "Savaram [gloss]",
"8": "Ooda [gloss]",
"9": "Danda (Garland) [gloss]",
"10": "Eetha (Swimming) [gloss]",
"11": "Mancham (Cot) [gloss]",
"12": "Oda (Ship) [gloss]",
"13": "Kakarakaya (Bitter gourd) [gloss]",
"14": "Geethala Angi (Striped shirt) [gloss]",
"15": "Mookudu (Lid) [gloss]",
"16": "Ituka (Brick) [gloss]",
"17": "Eluka - Enugu (Mouse - Elephant) [gloss]",
"18": "Thenetiga (Honey bee) [gloss]",
"19": "Konga Sopathi (The crane's friend) [gloss]",
"20": "Maidaku [gloss]",
"21": "Simham - Jinka (Lion - Deer) [gloss]",
"21*": "Kavali - Kavali [gloss]",
"22": "Pathashala (School) [gloss]",
"23": "Rusham? (title glyphs unclear in scan) [gloss]",
"24": "Ratham (Chariot) [gloss]",
"24*": "Cheema - Padava (Ant - Boat) [gloss]",
"25": "Podupu Kathalu (Riddles) [gloss]"
}
},
"english": {
"book": "My English World - Class I",
"edition": "2026-27",
"status": "official",
"url": "https://drive.google.com/file/d/1SKuCBoKe_SxMls4kaWOYuQabhK6X0M_h/view?usp=sharing",
"chapters": {
"1": "Unit 1 - Ammu and Her Family",
"2": "Unit 2 - Going to School",
"3": "Unit 3 - Ammu's School",
"4": "Unit 4 - Ammu and Her Friends at Her School",
"5": "Unit 5 - Things I Do",
"6": "Unit 6 - At the Zoo",
"7": "Unit 7 - Fruits and Vegetables"
}
},
"maths": {
"book": "Mathematics - Class 1 (English Medium)",
"edition": "2026-27",
"status": "official",
"url": "https://scert.telangana.gov.in/pdf/publication/ebooks2019/class_1_maths_em%20inner%202026_27.pdf",
"chapters": {
"1": "Pre-Mathematical Concepts",
"2": "Shapes",
"3": "Numbers from 1 to 5",
"4": "Numbers from 6 to 9",
"5": "Before - After - Between - More - Less",
"6": "Zero (0)",
"7": "Addition of Numbers, Total Not Exceeding 9",
"8": "Subtraction of Numbers up to 9",
"9": "Numbers from 10 to 20",
"10": "Addition of Numbers, the Total Not Exceeding 20",
"11": "Digital Literacy",
"12": "Subtraction of Numbers Not Exceeding 20",
"13": "Introduction of Tens from 10 to 100",
"14": "Numbers from 20 to 100",
"15": "Numbers Before, Between, After",
"16": "Money",
"17": "Time",
"18": "Length - Weight - Size"
}
}
}
};

/** Source reference for a Telangana chapter, e.g. tsSrc(10, 'physical-science', 9). Throws if the chapter is unknown. */
export function tsSrc(classNo: number, subject: string, chapterNo: number | string): SourceRef & { verify: 'official' | 'secondary' | 'unverified' } {
  const b = TS_BOOKS[String(classNo)]?.[subject];
  if (!b) throw new Error(`No Telangana book for Class ${classNo} ${subject}`);
  const title = b.chapters[String(chapterNo)];
  if (!title) throw new Error(`No chapter ${chapterNo} in Telangana Class ${classNo} ${subject}`);
  const s: SourceRef & { verify: 'official' | 'secondary' | 'unverified' } = {
    book: `SCERT Telangana — ${b.book}`, edition: b.edition, chapterNo, chapterTitle: title,
    verify: b.status === 'official' ? 'official' : b.status === 'secondary' ? 'secondary' : 'unverified',
  };
  if (b.url) s.url = b.url;
  return s;
}
