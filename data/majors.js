// All Major Requirements can be found at the links below
// https://e-catalogue.jhu.edu/arts-sciences/full-time-residential-programs/degree-programs/
// https://e-catalogue.jhu.edu/engineering/full-time-residential-programs/degree-programs/

// https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/
const bsCS_Old = {
  degree_name: 'B.S. Computer Science (OLD - Pre-2021)',
  abbrev: 'B.S. CS Old',
  department: 'EN Computer Science',
  total_degree_credit: 126,
  wi_credit: 6,
  url: 'https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/',
  distributions: [
    {
      name: 'Computer Science',
      required_credits: 42,
      min_credits_per_course: 1,
      description:
        "For more information please visit the <a href='https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/'>" +
        'major degree requirement</a> section on the department website.',
      criteria:
        'EN Computer Science[D]^OR^EN.500.112[C]^OR^EN.601.104[C]^OR^EN.660.400[C]',
      fine_requirements: [
        {
          description:
            '<b>Computer Ethics</b> <br /> Select one of the following courses: <br /> ' +
            'EN.601.104 Computer Ethics <br /> ' +
            'EN.660.400 Practical Ethics for Future Leaders',
          required_credits: 1,
          criteria: 'EN.601.104[C]^OR^EN.660.400[C]',
        },
        {
          description:
            '<b>Gateway Computing: JAVA</b> <br /> ' +
            'EN.500.112 Gateway Computing: JAVA <br /> ' +
            'For equivalent ways to satisfy this requirement, contact your advisor and create a custom course which satisfies this requirement.',
          required_credits: 3,
          criteria: 'EN.500.112[C]',
        },
        {
          description:
            '<b>Intermediate Programming</b> <br /> ' +
            'EN.601.220 Intermediate Programming',
          required_credits: 4,
          criteria: 'EN.601.220[C]',
        },
        {
          description:
            '<b>Data Structures</b> <br /> EN.601.226 Data Structures',
          required_credits: 4,
          criteria: 'EN.601.226[C]',
        },
        {
          description:
            '<b>Computer System Fundamentals</b> <br /> ' +
            'EN.601.229 Computer System Fundamentals',
          required_credits: 3,
          criteria: 'EN.601.229[C]',
        },
        {
          description:
            '<b>Automata & Computation Theory</b> <br /> ' +
            'EN.601.231 Automata & Computation Theory',
          required_credits: 3,
          criteria: 'EN.601.231[C]',
        },
        {
          description:
            '<b>Intro Algorithms</b> <br /> EN.601.433 Intro Algorithms',
          required_credits: 3,
          criteria: 'EN.601.433[C]',
        },
        {
          description:
            '<b>Upper Level CS Credits</b> <br /> ' +
            'At least 13 more upper level CS credits are required. ',
          required_credits: 13,
          criteria: 'EN Computer Science[D]^AND^Upper Level[L]',
        },
        {
          description:
            '<b>CS Electives</b> <br /> ' +
            'Eight additional credits of Computer Science are required.' +
            'For an approved list of courses from other departments (maximum of 6 credits allowed), (1) visit https://www.cs.jhu.edu/computer-science-other-courses-for-bs-degree/ ' +
            ', (2) create a custom course to satisfy this requirement, and (3) list it under the "EN Computer Science" department during creation.',
          required_credits: 8,
          criteria: 'EN Computer Science[D]',
        },
        {
          description:
            '<b>Team Requirement</b> <br /> ' +
            'Select one course with Program of Study Tag CSCI-TEAM.',
          required_credits: 3,
          criteria: 'CSCI-TEAM[T]',
        },
      ],
    },
    {
      name: 'Computer Science Classifications',
      required_credits: 6,
      min_credits_per_course: 3,
      description:
        'At least one course in two different classification areas (Applications, Reasoning, Software, Systems) must be chosen in addition to Theory (Algorithms).',
      criteria: 'CSCI-APPL[T]^OR^CSCI-SOFT[T]^OR^CSCI-SYST[T]^OR^CSCI-RSNG[T]',
      fine_requirements: [
        {
          description: '<b>Application</b>',
          required_credits: 3,
          criteria: 'CSCI-APPL[T]',
        },
        {
          description: '<b>Software</b>',
          required_credits: 3,
          criteria: 'CSCI-SOFT[T]',
        },
        {
          description: '<b>Systems</b>',
          required_credits: 3,
          criteria: 'CSCI-SYST[T]',
        },
        {
          description: '<b>Reasoning</b>',
          required_credits: 3,
          criteria: 'CSCI-RSNG[T]',
        },
      ],
    },
    {
      name: 'Mathematics',
      required_credits: 12,
      min_credits_per_course: 4,
      description:
        'The core mathematics classes required for the major include Calculus I and II, as well as Discrete Mathematics.',
      criteria: 'AS.110.108[C]^OR^AS.110.109[C]^OR^EN.553.171[C]',
      fine_requirements: [
        {
          description:
            '<b>Calculus I</b> <br /> AS.110.108 Calculus I (Physical Sciences & Engineering)',
          required_credits: 4,
          criteria: 'AS.110.108[C]',
        },
        {
          description:
            '<b>Calculus II</b> <br /> AS.110.109 Calculus II (Physical Sciences & Engineering)',
          required_credits: 4,
          criteria: 'AS.110.109[C]',
        },
        {
          description:
            '<b>Discrete Mathematics</b> <br /> EN.553.171 Discrete Mathematics',
          required_credits: 4,
          criteria: 'EN.553.171[C]',
        },
      ],
    },
    {
      name: 'Mathematics Electives',
      required_credits: 12,
      min_credits_per_course: 3,
      description:
        'All courses in this category must be from one of the two math departments on ' +
        'campus: Mathematics or Applied Math and Statistics. However, 553.171 Discrete Mathematics ' +
        'may not count towards these math requirements. Other than Calculus I and II, all the ' +
        'remaining courses must be 200-level or above ' +
        'and must include coverage of both Probability and Statistics.',
      criteria:
        '(AS Mathematics[D]^OR^EN Applied Mathematics & Statistics[D])^AND^(200[L]^OR^Upper Level[L])',
      fine_requirements: [
        {
          description:
            '<b>Option 1: Probability and Statistics Combined </b> <br />' +
            'Select one of the following: <br />' +
            'EN.553.211 Probability and Statistics for the Life Sciences<br />' +
            'EN.553.310 Probability and Statistics for the Physical Sciences and Engineering<br />' +
            'EN.553.311 Probability and Statistics for the Biological Sciences and Engineering',
          required_credits: 4,
          criteria: 'EN.553.211[C]^OR^EN.553.310[C]^OR^EN.553.311[C]',
        },
        {
          description:
            '<b>Option 2: Probability and Statistics Separate </b> <br />' +
            'EN.553.420 Introduction to Probability<br />' +
            'EN.553.430 Introduction to Statistics<br />',
          required_credits: 8,
          criteria: 'EN.553.420[C]^OR^EN.553.430[C]',
        },
      ],
    },
    {
      name: 'Basic Sciences',
      required_credits: 16,
      min_credits_per_course: 1,
      description:
        'At least two semesters of physics or two semesters of chemistry, with the associated laboratories, must be included.',
      criteria:
        'N[A]^NOT^(EN Computer Science[D]^OR^AS Center for Language Education[D]^OR^EN Applied Mathematics & Statistics[D])',
    },
    {
      name: 'Humanities/Social Sciences',
      required_credits: 18,
      min_credits_per_course: 3,
      description:
        'These courses must have either an ‘H’ or ‘S’ area designator on them, but can be ' +
        'from any department. At most 2 of these courses may be taken S/U (if not counted towards ' +
        'the writing requirement). Foreign language courses can be counted as well, even if ' +
        'they don’t carry an ‘H’ or ‘S’ designator.',
      criteria: 'H[A]^OR^S[A]',
    },
    {
      name: 'Writing Intensive',
      required_credits: 6,
      min_credits_per_course: 3,
      description:
        'Students are required to fulfill the university’s requirement of two writing intensive courses, ' +
        'each at least 3 credits. Students must receive at least a C- grade or better in these writing courses. ',
      criteria: 'Written Intensive[W]',
      fine_requirements: [
        {
          description:
            'At least one course with a primary focus on writing in English must be chosen.',
          required_credits: 3,
          criteria:
            'EN.661.110[C]^OR^EN.661.111[C]^OR^EN.661.250[C]^OR^EN.661.251[C]^OR^EN.661.315[C]^OR^AS.060.100[C]^OR^AS.060.113[C]^OR^AS.220.105[C]^OR^AS.180.248[C]^OR^AS.290.303[C]^OR^AS.360.133[C]',
        },
      ],
    },
  ],
};

const no_degree = {
  degree_name: "Undecided Degree/My degree isn't supported yet",
  distributions: [],
  abbrev: 'N/A',
  department: 'n/a',
  total_degree_credit: 0,
  url: '',
  wi_credit: 0,
};

function getMajorFromCommonName(name) {
  let out = null;
  allMajors.forEach((major) => {
    if (major.degree_name === name) {
      out = major;
    }
  });
  if (out === null) {
    throw Error('Major not found');
  }
  return out;
}

const allMajors = [
  no_degree,
  bsCS_Old,
  // bsCS_New,
  // baCS_New,
  // CS_Minor_New,
  // CS_Minor_Old,
  // bsMolCell,
  // bsAMS,
  // minorAMS_Old,
  // minorAMS_New,
  // baIS,
  // bsMechE,
  // bsBME,
  // bsCBE,
  // baEcon,
  // minorEcon,
  // minorPhysics,
  // minorMath,
  // baCogSci,
  // bsNeuro,
  // bsECE,
  // baMath,
  // baPhysics,
  // bsPhysics,
  // bsEnvEng,
  // baSoc,
  // baWritingSems,
  // baPsych,
  // baMolCell,
  // baMSH,
  // baPH,
  // bsBioPhysics,
  // bsChem,
  // bsME,
  // baHistory,
  // baBiology,
  // bsMatSci,
  // bsBBio,
  // baHistArt,
  // bsCompEng,
  // bsEPS,
  // bsEnvSci,
  // baEnglish,
  // bsCivEng,
];

export { getMajorFromCommonName, allMajors };
