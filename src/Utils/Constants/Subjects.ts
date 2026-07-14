export const FREE_MOCK_BUNDLE_NAME = 'Free Mock Bundle';

export const NURSING_SUBJECTS = [
    {
        name: FREE_MOCK_BUNDLE_NAME,
        topics: [
            "Mock 1",
            "Mock 2",
            "Mock 3",
            "Mock 4",
            "Mock 5",
            "Mock 6",
            "Mock 7",
            "Mock 8",
            "Mock 9",
            "Mock 10",
        ]
    },
    {
        name: "Anatomy & Physiology",
        topics: [
            "Cell and Tissues",
            "Skeletal System",
            "Muscular System",
            "Blood and Lymphatic System",
            "Cardiovascular System",
            "Respiratory System",
            "Digestive System",
            "Urinary System",
            "Endocrine System",
            "Nervous System",
            "Sense Organs",
            "Male Reproductive System",
            "Female Reproductive System",
            "Integumentary System (Skin)"
        ]
    },
    {
        name: "Biochemistry",
        topics: [
            "Carbohydrates",
            "Proteins",
            "Lipids",
            "Enzymes",
            "Vitamins",
            "Minerals",
            "Acid–Base Balance",
            "Water & Electrolytes",
            "Metabolism"
        ]
    },
    {
        name: "Nutrition",
        topics: [
            "Basic Nutrition",
            "Nutrients",
            "Balanced Diet",
            "Therapeutic Diet",
            "Infant Nutrition",
            "Child Nutrition",
            "Adolescent Nutrition",
            "Adult Nutrition",
            "Geriatric Nutrition",
            "Nutrition Assessment",
            "Food Preservation",
            "Community Nutrition"
        ]
    },
    {
        name: "Microbiology",
        topics: [
            "General Microbiology",
            "Bacteriology",
            "Virology",
            "Mycology",
            "Parasitology",
            "Immunology",
            "Sterilization",
            "Disinfection",
            "Hospital Infection Control",
            "Biomedical Waste Management"
        ]
    },
    {
        name: "Pathology & Genetics",
        topics: [
            "Cell Injury",
            "Inflammation",
            "Tissue Repair",
            "Hematology",
            "Neoplasia",
            "Genetic Disorders",
            "Chromosomal Disorders",
            "Congenital Disorders",
            "Laboratory Diagnosis"
        ]
    },
    {
        name: "Pharmacology",
        topics: [
            "General Pharmacology",
            "Drug Administration",
            "Antibiotics",
            "Cardiovascular Drugs",
            "CNS Drugs",
            "Endocrine Drugs",
            "Respiratory Drugs",
            "Gastrointestinal Drugs",
            "Chemotherapy",
            "Emergency Drugs",
            "Adverse Drug Reactions"
        ]
    },
    {
        name: "Fundamentals of Nursing",
        topics: [
            "Nursing Process",
            "Admission & Discharge",
            "Vital Signs",
            "Bed Making",
            "Infection Control",
            "Personal Hygiene",
            "Medication Administration",
            "Oxygen Therapy",
            "IV Therapy",
            "Wound Care",
            "First Aid",
            "CPR & BLS",
            "Patient Safety",
            "Nursing Documentation"
        ]
    },
    {
        name: "Medical-Surgical Nursing",
        topics: [
            "Cardiology",
            "Respiratory Disorders",
            "Gastrointestinal Disorders",
            "Neurology",
            "Nephrology",
            "Urology",
            "Endocrine Disorders",
            "Hematology",
            "Oncology",
            "Orthopedics",
            "Burns",
            "Trauma",
            "ICU Nursing",
            "Emergency Nursing",
            "Perioperative Nursing"
        ]
    },
    {
        name: "Child Health Nursing",
        topics: [
            "Growth & Development",
            "Neonatology",
            "Pediatric Nutrition",
            "Immunization",
            "Common Childhood Diseases",
            "Pediatric Emergencies",
            "Congenital Disorders",
            "Pediatric Pharmacology",
            "Pediatric Nursing Care"
        ]
    },
    {
        name: "Mental Health Nursing",
        topics: [
            "Mental Health Concepts",
            "Schizophrenia",
            "Depression",
            "Bipolar Disorder",
            "Anxiety Disorders",
            "Personality Disorders",
            "Substance Abuse",
            "Psychiatric Emergencies",
            "Psychiatric Nursing"
        ]
    },
    {
        name: "Obstetrics & Gynecological Nursing",
        topics: [
            "Female Reproductive System",
            "Pregnancy",
            "Antenatal Care",
            "Normal Labour",
            "High-Risk Pregnancy",
            "Postnatal Care",
            "Newborn Care",
            "Family Planning",
            "Gynecological Disorders",
            "Obstetric Emergencies"
        ]
    },
    {
        name: "Community Health Nursing",
        topics: [
            "Epidemiology",
            "Demography",
            "Environmental Health",
            "Occupational Health",
            "School Health",
            "National Health Programmes",
            "Immunization",
            "Family Health",
            "Community Assessment",
            "Health Education"
        ]
    },
    {
        name: "Nursing Research & Statistics",
        topics: [
            "Research Process",
            "Research Design",
            "Sampling",
            "Data Collection",
            "Data Analysis",
            "Biostatistics",
            "Evidence-Based Nursing",
            "Research Ethics"
        ]
    },
    {
        name: "Nursing Management",
        topics: [
            "Leadership",
            "Management Principles",
            "Staffing",
            "Supervision",
            "Budgeting",
            "Material Management",
            "Quality Assurance",
            "Legal Aspects",
            "Ethical Issues",
            "Nursing Audit"
        ]
    },
    {
        name: "Computer in Nursing",
        topics: [
            "Computer Fundamentals",
            "MS Office",
            "Internet",
            "Hospital Information System",
            "Electronic Health Records",
            "Telemedicine",
            "Nursing Informatics"
        ]
    },
    {
        name: "Professional Trends & Ethics",
        topics: [
            "Nursing Profession",
            "Nursing Ethics",
            "Nursing Laws",
            "INC/NMC",
            "Professional Organizations",
            "Nurse Registration",
            "Code of Ethics",
            "Professional Development"
        ]
    },
    {
        name: "Oncology",
        topics: [
            "Introduction to Cancer",
            "Benign Tumors",
            "Malignant Tumors",
            "Carcinogenesis",
            "Risk Factors",
            "Cancer Diagnosis",
            "Tumor Staging",
            "Chemotherapy",
            "Radiotherapy",
            "Immunotherapy",
            "Surgical Oncology",
            "Targeted Therapy",
            "Palliative Care",
            "Oncology Nursing"
        ]
    }
];

const normalizeSubjectKey = (value: string = '') =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const NURSING_SUBJECT_ORDER = new Map(
    NURSING_SUBJECTS.map((subject, index) => [normalizeSubjectKey(subject.name), index] as const),
);

const NURSING_SUBJECT_ALIASES = new Map<string, string>([
    ['anatomy physiology', 'Anatomy & Physiology'],
    ['anatomy and physiology', 'Anatomy & Physiology'],
    ['antamoty physiology', 'Anatomy & Physiology'],
    ['antamoty and physiology', 'Anatomy & Physiology'],
    ['antamoty physiology nursing', 'Anatomy & Physiology'],
]);

export const getNursingSubjectName = (value: string = '') => {
    const normalizedValue = normalizeSubjectKey(value);

    const alias = NURSING_SUBJECT_ALIASES.get(normalizedValue);
    if (alias) {
        return alias;
    }

    for (const subject of NURSING_SUBJECTS) {
        if (normalizeSubjectKey(subject.name) === normalizedValue) {
            return subject.name;
        }
    }

    return String(value || '').trim();
};

export const getNursingSubjectOrder = (value: string = '') => {
    const normalizedValue = normalizeSubjectKey(value);
    return NURSING_SUBJECT_ORDER.get(normalizedValue) ?? Number.MAX_SAFE_INTEGER;
};

export const sortNursingSubjects = <T extends Record<string, any>>(items: T[], getLabel: (item: T) => string) => {
    return [...items]
        .map((item, index) => ({
            item,
            index,
            label: getNursingSubjectName(getLabel(item)),
        }))
        .sort((left, right) => {
            const leftOrder = getNursingSubjectOrder(left.label);
            const rightOrder = getNursingSubjectOrder(right.label);

            if (leftOrder !== rightOrder) {
                return leftOrder - rightOrder;
            }

            return left.index - right.index;
        })
        .map(({ item, label }) => ({
            ...item,
            label,
        })) as T[];
};

export const NURSING_ACCESS_DURATION_LABEL = 'No Expiry';
export const NURSING_ACCESS_EXPIRY_LABEL = 'No Expiry';
