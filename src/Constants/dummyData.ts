export const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Prepare for Every Nursing Exam',
    description: 'Comprehensive study material for NORCET, GNM, B.Sc Nursing, CHO, ESIC, RRB and more.',
    exams: ['NORCET', 'GNM', 'B.Sc Nursing', 'CHO', 'ESIC', 'RRB'],
    badge: 'Trusted by 1,00,000+ Nursing Aspirants',
  },
  {
    id: '2',
    title: "Learn From India's Best Nursing Educators",
    description: 'Live classes, doubt support and rapid revision sessions from proven educators.',
    educators: [
      { name: 'Bijoylaxmi Behera', title: 'Nursing Officer, AIIMS Guwahati' },
      { name: 'Dr. Sneha Nair', title: 'NORCET Specialist' },
      { name: 'Priti Mishra', title: 'GNM Expert' },
      { name: 'Dr. Arun Kumar', title: 'ESIC Mentor' },
    ],
    badge: '10,000+ Students Joined This Month',
  },
  {
    id: '3',
    title: 'Your Complete Nursing Exam Preparation Platform',
    description: 'Practice smarter, track progress, and achieve your dream Nursing Officer job.',
    features: [
      'Video Lectures',
      'Question Bank',
      'Mock Tests',
      'Subject Tests',
      'PYQ Papers',
      'Performance Analytics',
      'Rapid Revision',
    ],
    badge: 'Built for Nursing Aspirants Across India',
  },
];

export const EXAM_CATEGORIES = ['NORCET', 'GNM', 'B.Sc Nursing', 'CHO', 'ESIC', 'RRB', 'DSSSB', 'PGIMER'];

export const DASHBOARD_STATS = {
  accuracy: '78%',
  rank: '#342',
  testsDone: '47',
  streak: '12d',
};

export const MOCK_CHALLENGES = [
  { id: '1', type: 'NORCET Full Mock', result: '111/150', accuracy: '88.4%', exams: ['NORCET'] },
  { id: '2', type: 'GNM Daily Mock', result: '74/100', accuracy: '74.0%', exams: ['GNM'] },
  { id: '3', type: 'CHO Practice Mock', result: '62/80', accuracy: '77.5%', exams: ['CHO'] },
  { id: '4', type: 'B.Sc Nursing Grand Mock', result: '89/120', accuracy: '81.2%', exams: ['B.Sc Nursing'] },
  { id: '5', type: 'ESIC Rapid Mock', result: '68/90', accuracy: '75.6%', exams: ['ESIC'] },
  { id: '6', type: 'RRB Practice Mock', result: '93/130', accuracy: '71.5%', exams: ['RRB'] },
];

export const QUICK_ACTIONS = [
  { id: '1', title: 'Rapid Revision', icon: 'flash', route: 'RapidRevisionScreen' },
  { id: '2', title: 'Question Bank', icon: 'book', route: 'QuestionBankScreen' },
  { id: '3', title: 'Subject Tests', icon: 'flask', route: 'SubjectTestsScreen' },
  { id: '4', title: 'Daily Test', icon: 'calendar', route: 'MockTestsScreen' },
  { id: '5', title: 'Mock Test', icon: 'ribbon', route: 'MockTestsScreen' },
  { id: '6', title: 'PYQ Papers', icon: 'document-text', route: 'PYQScreen' },
];

export const QUESTION_BANK_CATEGORIES = [
  { id: '1', title: 'Topic Wise', count: '2.4K Questions', icon: 'pricetag', accent: '#2FB0FF', exams: ['NORCET', 'GNM', 'B.Sc Nursing'] },
  { id: '2', title: 'Course Wise', count: '1.8K Questions', icon: 'book', accent: '#63D1D2', exams: ['All', 'NORCET', 'CHO', 'ESIC'] },
  { id: '3', title: 'Important Qs', count: '850 Questions', icon: 'star', accent: '#FFB648', exams: ['NORCET', 'RRB', 'DSSSB'] },
  { id: '4', title: 'Frequently Asked', count: '640 Questions', icon: 'time', accent: '#B27EFF', exams: ['GNM', 'B.Sc Nursing', 'PGIMER'] },
  { id: '5', title: 'Previous Year', count: '3.2K Questions', icon: 'document-text', accent: '#FF7A7A', exams: ['All', ...EXAM_CATEGORIES] },
  { id: '6', title: 'NORCET Dhamaka', count: '1.2K Questions', icon: 'ribbon', accent: '#F97316', exams: ['NORCET'] },
];

export const PREVIOUS_YEAR_YEARS = ['2024', '2023', '2022', '2021', '2020'];

const PREVIOUS_YEAR_TEMPLATES = [
  {
    question: 'Which vitamin is essential for blood clotting?',
    options: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Vitamin D'],
    answer: 'Vitamin K',
    explanation: 'Vitamin K supports synthesis of clotting factors and is essential for normal blood coagulation.',
  },
  {
    question: 'What is the normal adult respiratory rate per minute?',
    options: ['8 to 10', '12 to 20', '22 to 30', '30 to 36'],
    answer: '12 to 20',
    explanation: 'The usual resting respiratory rate for a healthy adult is 12 to 20 breaths per minute.',
  },
  {
    question: 'Which chamber of the heart pumps oxygenated blood to the body?',
    options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'],
    answer: 'Left ventricle',
    explanation: 'The left ventricle pumps oxygenated blood into the aorta for systemic circulation.',
  },
  {
    question: 'Which electrolyte imbalance is commonly seen with severe vomiting?',
    options: ['Hyperkalemia', 'Hypokalemia', 'Hypercalcemia', 'Hyponatremia'],
    answer: 'Hypokalemia',
    explanation: 'Severe vomiting can lead to potassium loss, resulting in hypokalemia.',
  },
  {
    question: 'Which position is commonly used for administering an enema?',
    options: ['Supine', 'Prone', 'Left lateral', 'Trendelenburg'],
    answer: 'Left lateral',
    explanation: 'The left lateral position helps solution flow naturally into the sigmoid and descending colon.',
  },
  {
    question: 'What is the first step in the nursing process?',
    options: ['Planning', 'Assessment', 'Implementation', 'Evaluation'],
    answer: 'Assessment',
    explanation: 'Assessment is the starting point for collecting patient data and identifying care needs.',
  },
  {
    question: 'Which vaccine is given at birth under the national immunization schedule?',
    options: ['MMR', 'BCG', 'Typhoid', 'Varicella'],
    answer: 'BCG',
    explanation: 'BCG is routinely administered at birth to help protect against severe forms of tuberculosis.',
  },
  {
    question: 'What is the antidote commonly used for opioid overdose?',
    options: ['Atropine', 'Naloxone', 'Diazepam', 'Protamine'],
    answer: 'Naloxone',
    explanation: 'Naloxone rapidly reverses respiratory depression caused by opioid overdose.',
  },
  {
    question: 'Which lobe of the brain is primarily responsible for vision?',
    options: ['Frontal lobe', 'Temporal lobe', 'Occipital lobe', 'Parietal lobe'],
    answer: 'Occipital lobe',
    explanation: 'The occipital lobe processes visual information received from the eyes.',
  },
  {
    question: 'Which instrument is used to measure blood pressure manually?',
    options: ['Stethoscope only', 'Thermometer', 'Sphygmomanometer', 'Pulse oximeter'],
    answer: 'Sphygmomanometer',
    explanation: 'A sphygmomanometer is the standard instrument for manual blood pressure measurement.',
  },
];

export const PREVIOUS_YEAR_QUESTIONS = Array.from({ length: 50 }, (_, index) => {
  const template = PREVIOUS_YEAR_TEMPLATES[index % PREVIOUS_YEAR_TEMPLATES.length];
  const year = PREVIOUS_YEAR_YEARS[Math.floor(index / PREVIOUS_YEAR_TEMPLATES.length)];
  const course = EXAM_CATEGORIES[index % EXAM_CATEGORIES.length];

  return {
    id: `pyq-${index + 1}`,
    year,
    course,
    questionNumber: index + 1,
    question: template.question,
    options: template.options,
    answer: template.answer,
    explanation: template.explanation,
  };
});

export const SUBJECT_TESTS = [
  { id: '1', subject: 'Anatomy', duration: '60 Minutes', questions: '60 Questions', difficulty: 'Medium', exams: ['NORCET', 'GNM'] },
  { id: '2', subject: 'Physiology', duration: '50 Minutes', questions: '50 Questions', difficulty: 'Easy', exams: ['NORCET', 'B.Sc Nursing'] },
  { id: '3', subject: 'Med-Surg Nursing', duration: '80 Minutes', questions: '80 Questions', difficulty: 'Hard', exams: ['GNM', 'CHO'] },
  { id: '4', subject: 'Community Health', duration: '60 Minutes', questions: '60 Questions', difficulty: 'Easy', exams: ['CHO', 'ESIC'] },
  { id: '5', subject: 'Psychiatric Nursing', duration: '45 Minutes', questions: '50 Questions', difficulty: 'Medium', exams: ['NORCET', 'RRB'] },
  { id: '6', subject: 'Pediatric Nursing', duration: '55 Minutes', questions: '55 Questions', difficulty: 'Easy', exams: ['GNM', 'B.Sc Nursing'] },
  { id: '7', subject: 'Obstetric Nursing', duration: '65 Minutes', questions: '65 Questions', difficulty: 'Medium', exams: ['NORCET', 'ESIC'] },
  { id: '8', subject: 'Microbiology', duration: '40 Minutes', questions: '45 Questions', difficulty: 'Easy', exams: ['RRB', 'DSSSB'] },
];
