//https://krieger.jhu.edu/internationalstudies/undergraduate/requirements/
const baIS = {
  degree_name: "B.A. International Studies",
  department: "AS International Studies",
  total_degree_credit: 120,
  wi_credit: 12,
  distributions: [
    {
      name: "Political Science",
      required_credits: 18,
      min_cedits_per_course: 3,
      description:
        "International studies students must complete 18 credits in political science, including:\n\tOne course in international relations (IR)\n\tTwo courses in comparative politics (CP)\n\tOne course in American politics (AP)\n\tOne course in political theory (PT)\n\tOne gateway course",
      criteria: "AS Political Science[D]",
      fine_requirements: [
        {
          required_credits: 3,
          description: "One course in international relations (IR)",
          criteria: "INST-IR[T]",
        },
        {
          required_credits: 6,
          description: "Two courses in comparative politics (CP)",
          criteria: "INST-CP[T]",
        },
        {
          required_credits: 3,
          description: "One course in American politics (AP)",
          criteria: "INST-AP[T]",
        },
        {
          required_credits: 3,
          description: "One course in political theory (PT)",
          criteria: "INST-PT[T]",
        },
        {
          required_credits: 3,
          description:
            "One of the following gateway courses: \n\tConflict and Security in a Global World (070.295)\n\tContemporary International Politics (190.108)\n\tIntroduction to Global Studies (190.111)\n\tIssues in International Development (230.150)*\n\t*Applies to students who entered fall 2019 and earlier only.",
          criteria:
            "AS.070.295[C]^OR^AS.190.108[C]^OR^AS.190.111[C]^OR^(AS.230.150[C]^AND^Fall 2019[Y])",
        },
      ],
    },
    {
      name: "Economics",
      required_credits: 12,
      min_cedits_per_course: 3,
      description:
        "Note: both Elements of Macroeconomics and Elements of Microeconomics must be completed by the end of the sophomore year.",
      criteria: "AS Economics[D]",
      fine_requirements: [
        {
          required_credits: 3,
          description: "Elements of Macroeconomics (180.101)",
          criteria: "AS.180.101[C]",
        },
        {
          required_credits: 3,
          description: "Elements of Microeconomics (180.102)",
          criteria: "AS.180.102[C]",
        },
        {
          required_credits: 3,
          description:
            "One approved international economics course designated INST-ECON in the course description; this course may sometimes be fulfilled via study abroad, with permission",
          criteria: "INST-ECON[T]",
        },
        {
          required_credits: 3,
          description:
            "One course (student’s choice) taken in the JHU Department of Economics (e.g., AS.180.xxx).",
          criteria: "AS Economics[D]",
        },
      ],
    },
    {
      name: "Foreign Language",
      required_credits: 6,
      min_cedits_per_course: 3,
      description:
        "International studies majors must demonstrate proficiency in at least one foreign language. Proficiency through the second semester of the advanced/third-year level is required. If students have proficiency above the advanced/third-year level, they must take either: Option (A), two semesters of an upper level literature or culture course offered by the language departments and taught in the language of proficiency, or Option (B), take two semesters of another language.\n\nWaivers indicating advanced level/third-year language proficiency must be documented in the student’s official academic record in order for a student to be eligible to complete Option A or B. To receive these waivers, students must contact the Center for Language Education or the Department of Modern Languages & Literatures to complete a proficiency exam on campus.\n\nNote: Students cannot count their foreign language courses toward the 5 course advanced coursework requirement.",
      criteria:
        "AS Center for Language Education[D]^OR^AS Modern Languages and Literatures[D]",
    },
    {
      name: "Focus Area",
      required_credits: 12,
      min_cedits_per_course: 3,
      description:
        "Four courses within a coherent field of interest. For more detail please visit https://krieger.jhu.edu/internationalstudies/undergraduate/requirements/",
      criteria: "",
      user_select: true,
    },
    {
      name: "History",
      required_credits: 15,
      min_cedits_per_course: 3,
      description:
        "International Studies students must complete 15 credits in history, including:\n\tOne introductory course at the 100-level in the JHU History Department (e.g., AS.100.1xx).\n\tFour courses designated INST-GLOBAL in the course description.",
      criteria:
        "(AS History[D]^AND^Lower Level Undergraduate)^OR^INST-GLOBAL[T]",
      fine_requirements: [
        {
          required_credits: 3,
          description:
            "One introductory course at the 100-level in the JHU History Department (e.g., AS.100.1xx)",
          criteria: "AS History[D]^AND^Lower Level Undergraduate",
        },
        {
          required_credits: 12,
          description:
            "Four courses designated INST-GLOBAL in the course description",
          criteria: "INST-GLOBAL[T]",
        },
      ],
    },
  ],
};

// https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/
const bsCS_Old = {
  degree_name: "B.S. Computer Science (OLD - Pre-2021)",
  department: "EN Computer Science",
  total_degree_credit: 126,
  wi_credit: 6,
  url: "https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/",
  distributions: [
    {
      name: "Computer Science",
      required_credits: 42,
      min_credits_per_course: 1,
      description:
        "For more information please visit the <a href='https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/'>" +
        "major degree requirement</a> section on the department website.",
      criteria: "EN Computer Science[D]^OR^CSCI-OTHER[T]",
      fine_requirements: [
        {
          description:
            "<b>Computer Ethics(601.104).</b><p>Practical Ethics for Future Leaders (660.400/406) may be used as a substitute for the computer ethics requirement for the BS program, but does not count towards the CS total credits at all.</p>",
          required_credits: 1,
          criteria: "EN.600.104[C]^OR^EN.601.104[C]^OR^EN.660.400[C]",
        },
        {
          description:
            "<b>Lower Level Undergraduate:</b><p>500.112/113/114 Gateway Computing or AP Comp Sci A or " +
            "equivalent<p>601.220 Intermediate Programming</p><p>601.226 Data Structures</p><p>601.229 " +
            "Computer System Fundamentals</p><p>601.231/271 Automata and Computation Theory</p><p>601.433 Algorithms</p>",
          required_credits: 20,
          criteria:
            "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]^OR^EN.601.220[C]^OR^EN.601.226[C]" +
            "^OR^EN.601.229[C]^OR^EN.601.231[C]^OR^EN.601.271[C]^OR^EN.601.443[C]",
        },
        {
          description:
            "<b>Upper Level Undergraduate: </b><p>12 upper level CS credits in addition to the required Algorithms course</p>",
          required_credits: 13,
          criteria: "EN Computer Science[D]^AND^Upper Level Undergraduate[L]",
        },
        {
          description:
            "<b>2 Upper Level Classifications:</b><p>At least one upper level course in two of these four different classification</p> " +
            "areas: Applications(CSCI-APPL), Systems(CSCI-SYST), Software(CSCI-SOFT) and Reasoning(CSCI-RSNG)",
          required_credits: 6,
          exclusive: true,
          criteria:
            "CSCI-APPL[T]^OR^CSCI-SYST[T]^OR^CSCI-SOFT[T]^OR^CSCI-RSNG[T]",
        },
        {
          description:
            "<b>One Team(CSCI-TEAM) designated course.</b><p> This Team course may overlap other course " +
            "requirements, for example to count as both Team and Software.</p>",
          required_credits: 3,
          criteria: "CSCI-TEAM[T]",
        },
      ],
    },
    {
      name: "Math",
      required_credits: 24,
      min_credits_per_course: 3,
      description:
        "All courses in this category must be from one of the two math departments on " +
        "campus: Mathematics or Applied Math and Statistics. However, 553.171 Discrete Mathematics " +
        "may not count towards these math requirements. Other than Calculus I and II, all the " +
        "remaining courses must be 200-level or above. The BS math courses must include coverage " +
        "of both probability and statistics, which can be satisfied in many ways, including " +
        "taking any of the 553.3xx combined Probability & Statistics courses.",
      criteria: "AS Mathematics[D]^OR^EN Applied Math and Statistics[D]",
      exception: "EN.553.171[C]",
      fine_requirements: [
        {
          description:
            "<b>Required Courses:</b><p>110.108 Calculus I or AP equivalent</p>110.109 Calculus II or AP equivalent</p>" +
            "<p>550.171/553.171 Discrete Mathematics</p>",
          required_credits: 12,
          criteria:
            "AS.110.108[C]^OR^AS.110.109[C]^OR^EN.550.171[C]^OR^EN.553.171[C]",
        },
        {
          description:
            "<b>Probability and Statistics:</b><p>Two paths:</p><p>1. Any of the three courses below:</p><p>EN.553.211</p><p>EN.553.310</p><p>EN.553.311</p><p>2. Both Intro to Probability and Intro to Statistics</p><p>En.553.420</p><p>EN.553.430</p> ",
          required_credits: 4,
          criteria:
            "(EN.553.211[C]^OR^EN.553.310[C]^OR^EN.553.311[C])^OR^(EN.553.420[C]^AND^EN.553.430[C])",
        },
      ],
    },
    {
      name: "Science",
      required_credits: 16,
      min_credits_per_course: 1,
      description:
        "At least two semesters of physics or two semesters of chemistry, with the associated laboratories, must be included.",
      criteria: "N[A]",
      fine_requirements: [
        {
          description:
            "<b>Required Courses:</b><p>Two paths:</p>" +
            "<p>1. Two semesters of chemistry with associated lab:</p><p>030.101 Chemistry I and 030.105 Chemistry Lab I or AP equivalent</p>030.102 Chemistry II and 030.106 Chemistry Lab II or AP equivalent</p>" +
            "<p>2. Two semesters of physics with associated lab:</p><p>171.101/103 Physics I and 173.111 Physics Lab I or AP equivalent</p>171.102/104 Physics II and 173.112 Phyusics Lab II or AP equivalent</p>",
          required_credits: 10,
          criteria:
            "(AS.030.101[C]^AND^AS.030.105[C]^AND^AS.030.102[C]^AND^AS.030.106[C])^OR^((AS.171.101[C]^AND^AS.171.103[C])^AND^AS.173.11[C]^AND^(AS.171.102[C]^AND^AS.171.104[C])^AND^AS.173.112[C])",
        },
      ],
    },
    {
      name: "Liberal Arts",
      required_credits: 18,
      min_credits_per_course: 3,
      description:
        "These courses must have either an ‘H’ or ‘S’ area designator on them, but can be " +
        "from any department. At most 2 of these courses may be taken S/U (if not counted towards " +
        "the writing requirement). Foreign language courses can be counted as well, even if " +
        "they don’t carry an ‘H’ or ‘S’ designator.",
      criteria:
        "AS Center for Language Education[D]^OR^AS Modern Languages and Literatures[D]^OR^H[A]^OR^S[A]",
    },
    {
      name: "Writing Intensive",
      required_credits: 6,
      min_credits_per_course: 3,
      double_count: true,
      description:
        "Students are required to fulfill the university’s requirement of two writing intensive courses, " +
        "each at least 3 credits. Students must receive at least a C- grade or better in these writing courses. ",
      criteria: "Written Intensive[W]",
      fine_requirements: [
        {
          description:
            "<b>Writing-focused WI</b><p>At least one course must be explicitly focused on writing skills in English (eg, courses in professional, " +
            "fiction or expository writing). These courses may overlap with other requirements.</p><p>Any of the courses below would be satisfactory:</p><p>AS.060.100</p><p>AS.060.113</p><p>AS.060.114</p><p>AS.180.248</p><p>AS.220.105</p><p>AS.220.106</p><p>AS.220.108</p><p>AS.290.303</p><p>AS.360.133</p><p>EN.661.110</p><p>EN.661.111</p><p>EN.661.250</p><p>EN.661.251</p><p>EN.661.315</p>",
          required_credits: 3,
          criteria:
            "AS.060.100[C]^OR^AS.060.113[C]^OR^AS.060.114[C]^OR^AS.180.248[C]^OR^AS.220.105[C]^OR^AS.220.106[C]^OR^AS.220.108[C]^OR^AS.290.303[C]^OR^AS.360.133[C]^OR^EN.661.110[C]^OR^EN.661.111[C]^OR^EN.661.250[C]^OR^EN.661.251[C]^OR^EN.661.315[C]",
        },
      ],
    },
  ],
};

// https://www.cs.jhu.edu/2021undergraduate-advising-manual/
const bsCS_New = {
  degree_name: "B.S. Computer Science (NEW - 2021 & after)",
  department: "EN Computer Science",
  total_degree_credit: 120,
  wi_credit: 6,
  url: "https://www.cs.jhu.edu/2021undergraduate-advising-manual/",
  distributions: [
    {
      name: "Computer Science",
      required_credits: 40,
      min_credits_per_course: 1,
      description:
        "For more information please visit the <a href='https://www.cs.jhu.edu/2021undergraduate-advising-manual/'>" +
        "major degree requirement</a> section on the department website.",
      criteria:
        "EN Computer Science[D]^OR^CSCI-OTHER[T]^OR^Gateway Computing[N]",
      fine_requirements: [
        {
          description:
            "<b>Computer Ethics(601.104).</b><p>Practical Ethics for Future Leaders (660.400/406) may be used as a substitute for the computer ethics requirement for the BS program, but does not count towards the CS total credits at all.</p>",
          required_credits: 1,
          criteria: "EN.600.104[C]^OR^EN.601.104[C]^OR^EN.660.400[C]",
        },
        {
          description:
            "<b>Lower Level Undergraduate:</b><p>500.112/113/114 Gateway Computing or AP Comp Sci A or " +
            "equivalent<p>601.220 Intermediate Programming</p><p>601.226 Data Structures</p><p>601.229 " +
            "Computer System Fundamentals</p><p>601.230 Mathematical Foundations for Computer Science, or 601.231 Automata for those grandfathered into the old major</p><p>601.433 Algorithms</p>",
          required_credits: 21,
          criteria:
            "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]^OR^EN.601.220[C]^OR^EN.601.226[C]" +
            "^OR^EN.601.229[C]^OR^EN.601.230[C]^OR^EN.601.433[C]^OR^EN.601.231",
        },
        {
          description:
            "<b>Upper Level Undergraduate: </b><p>12 upper level CS credits in addition to the required Algorithms course</p>",

          required_credits: 12,
          criteria:
            "EN Computer Science[D]^AND^Upper Level Undergraduate[L]^NOT^EN.601.433[C]^NOT^EN.601.633[C]",
        },
        {
          description:
            "<b>2 Upper Level Classifications:</b><p>At least one upper level course in two of these four different classification</p> " +
            "areas: Applications(CSCI-APPL), Systems(CSCI-SYST), Software(CSCI-SOFT) and Reasoning(CSCI-RSNG)",
          required_credits: 6,
          exclusive: true,
          criteria:
            "CSCI-APPL[T]^OR^CSCI-SYST[T]^OR^CSCI-SOFT[T]^OR^CSCI-RSNG[T]",
        },
        {
          description:
            "<b>One Team(CSCI-TEAM) designated course.</b><p> This Team course may overlap other course " +
            "requirements, for example to count as both Team and Software.</p>",
          required_credits: 3,
          criteria: "CSCI-TEAM[T]",
        },
      ],
    },
    {
      name: "Math",
      required_credits: 16,
      min_credits_per_course: 3,
      description:
        "All courses in this category must be from one of the two math departments on " +
        "campus: Mathematics or Applied Math and Statistics. However, 553.171 Discrete Mathematics " +
        "may not count towards these math requirements. Other than Calculus I and II, all the " +
        "remaining courses must be 200-level or above. The BS math courses must include coverage " +
        "of both probability and statistics, which can be satisfied in many ways, including " +
        "taking any of the 553.3xx combined Probability & Statistics courses.",
      criteria: "AS Mathematics[D]^OR^EN Applied Mathematics & Statistics[D]",
      exception: "EN.553.171[C]",
      fine_requirements: [
        {
          description:
            "<b>Required Courses:</b><p>110.108 Calculus I or AP equivalent</p>110.109 Calculus II or AP equivalent</p>" +
            "<p>550.171/553.171 Discrete Mathematics if grandfathered into old major</p>",
          required_credits: 8,
          criteria: "AS.110.108[C]^OR^AS.110.109[C]",
        },
        {
          description:
            "<b>Probability and Statistics:</b><p>Two paths:</p><p>1. Any of the three courses below:</p><p>EN.553.211</p><p>EN.553.310</p><p>EN.553.311</p><p>2. Both Intro to Probability and Intro to Statistics</p><p>En.553.420</p><p>EN.553.430</p> ",
          required_credits: 4,
          criteria:
            "EN Applied Mathematics & Statistics[D]^AND^(Probability & Statistics[N]^OR^Probability and Statistics[N])^AND^Upper Level Undergraduate[L]",
        },
      ],
    },
    {
      name: "Science",
      required_credits: 8,
      min_credits_per_course: 1,
      description:
        "Students must take two semesters of core science courses (any combination of Physics, " +
        "Chemistry, Biology), with their associated labs. AP credit is an acceptable substitute for these courses and labs.",
      criteria: "N[A]",
    },
    {
      name: "Liberal Arts",
      required_credits: 18,
      min_credits_per_course: 3,
      description:
        "These courses must have either an ‘H’ or ‘S’ area designator on them, but can be " +
        "from any department. At most 2 of these courses may be taken S/U (if not counted towards " +
        "the writing requirement). Foreign language courses can be counted as well, even if " +
        "they don’t carry an ‘H’ or ‘S’ designator.",
      criteria:
        "AS Center for Language Education[D]^OR^AS Modern Languages and Literatures[D]^OR^H[A]^OR^S[A]",
    },
    {
      name: "Writing Intensive",
      required_credits: 6,
      min_credits_per_course: 3,
      double_count: true,
      description:
        "Students are required to fulfill the university’s requirement of two writing intensive courses, " +
        "each at least 3 credits. Students must receive at least a C- grade or better in these writing courses. ",
      criteria: "Written Intensive[W]",
      fine_requirements: [
        {
          description:
            "<b>Writing-focused WI</b><p>At least one course must be explicitly focused on writing skills in English (eg, courses in professional, " +
            "fiction or expository writing). These courses may overlap with other requirements.</p><p>Any of the courses below would be satisfactory:</p><p>AS.060.100</p><p>AS.060.113</p><p>AS.060.114</p><p>AS.180.248</p><p>AS.220.105</p><p>AS.220.106</p><p>AS.220.108</p><p>AS.290.303</p><p>AS.360.133</p><p>EN.661.110</p><p>EN.661.111</p><p>EN.661.250</p><p>EN.661.251</p><p>EN.661.315</p>",

          required_credits: 3,
          criteria:
            "AS.060.100[C]^OR^AS.060.113[C]^OR^AS.060.114[C]^OR^AS.180.248[C]^OR^AS.220.105[C]^OR^AS.220.106[C]^OR^AS.220.108[C]^OR^AS.290.303[C]^OR^AS.360.133[C]^OR^EN.661.110[C]^OR^EN.661.111[C]^OR^EN.661.250[C]^OR^EN.661.251[C]^OR^EN.661.315[C]",
        },
      ],
    },
  ],
};

// https://www.cs.jhu.edu/undergraduate-studies/academics/ugrad-advising-manual/
const baCS_New = {
  degree_name: "B.A. Computer Science (NEW - 2021 & after)",
  department: "EN Computer Science",
  total_degree_credit: 120,
  wi_credit: 12,
  url: "https://www.cs.jhu.edu/2021undergraduate-advising-manual/",
  distributions: [
    {
      name: "Computer Science",
      required_credits: 33,
      min_credits_per_course: 1,
      description:
        "For more information please visit the <a href='https://www.cs.jhu.edu/2021undergraduate-advising-manual/'>" +
        "major degree requirement</a> section on the department website.",
      criteria:
        "EN Computer Science[D]^OR^CSCI-OTHER[T]^OR^Gateway Computing[N]",
      fine_requirements: [
        {
          description:
            "<b>Computer Ethics(601.104).</b><p>Practical Ethics for Future Leaders (660.400/406) may be used as a substitute for the computer ethics requirement for the BS program, but does not count towards the CS total credits at all.</p>",
          required_credits: 1,
          criteria: "EN.600.104[C]^OR^EN.601.104[C]^OR^EN.660.400[C]",
        },
        {
          description:
            "<b>Lower Level Undergraduate:</b><p>500.112/113/114 Gateway Computing or AP Comp Sci A or " +
            "equivalent<p>601.220 Intermediate Programming</p><p>601.226 Data Structures</p><p>601.229 " +
            "Computer System Fundamentals</p><p>601.230 Mathematical Foundations for Computer Science, or 601.231 Automata for those grandfathered into the old major</p><p>601.433 Algorithms</p>",
          required_credits: 21,
          criteria:
            "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]^OR^EN.601.220[C]^OR^EN.601.226[C]" +
            "^OR^EN.601.229[C]^OR^EN.601.230[C]^OR^EN.601.433[C]^OR^EN.601.231",
        },
        {
          description:
            "<b>Upper Level Undergraduate: </b><p>12 upper level CS credits in addition to the required Algorithms course</p>",

          required_credits: 12,
          criteria:
            "EN Computer Science[D]^AND^Upper Level Undergraduate[L]^NOT^EN.601.433[C]^NOT^EN.601.633[C]",
        },
      ],
    },
    {
      name: "Math",
      required_credits: 16,
      min_credits_per_course: 3,
      description:
        "All courses in this category must be from one of the two math departments on " +
        "campus: Mathematics or Applied Math and Statistics. However, 553.171 Discrete Mathematics " +
        "may not count towards these math requirements. At least one course must be 200-level or above",
      criteria: "AS Mathematics[D]^OR^EN Applied Mathematics & Statistics[D]",
      exception: "EN.553.171[C]",
      fine_requirements: [
        {
          description:
            "<b>Required Courses:</b><p>110.108 Calculus I or AP equivalent</p>110.109 Calculus II or AP equivalent</p>" +
            "<p>550.171/553.171 Discrete Mathematics if grandfathered into old major</p>",
          required_credits: 8,
          criteria: "AS.110.108[C]^OR^AS.110.109[C]",
        },
      ],
    },
    {
      name: "Science",
      required_credits: 8,
      min_credits_per_course: 1,
      description:
        "Students must take two semesters of core science courses (any combination of Physics, " +
        "Chemistry, Biology), with their associated labs. AP credit is an acceptable substitute for these courses and labs.",
      criteria: "N[A]",
    },
    {
      name: "Liberal Arts",
      required_credits: 18,
      min_credits_per_course: 3,
      description:
        "These courses must have either an ‘H’ or ‘S’ area designator on them, but can be " +
        "from any department. At least two of these courses must be at the 300-level or above, and all must be taken for a grade." +
        "Students are required to demonstrate proficiency at the intermediate level or take at least 6 credits in one foreign language," +
        "in addition to the six H/S required courses. Students must still have at least six (>=3)-credit courses to fulfill the H/S requirement.",
      criteria:
        "AS Center for Language Education[D]^OR^AS Modern Languages and Literatures[D]^OR^H[A]^OR^S[A]",
      fine_requirements: [
        {
          description: "<b>300-level</b><p>Two Courses at 300 Level</p>",
          required_credits: 6,
          criteria: "(H[A]^OR^S[A])^AND^(Upper Level Undergraduate[L])",
        },
        {
          description:
            "<b>Foreign Language</b><p>At least 6 credit in one foreign language or proficiency at intermediate level</p>",
          required_credits: 6,
          criteria:
            "AS Center for Language Education[D]^OR^AS Modern Languages and Literatures[D]",
        },
      ],
    },
    {
      name: "Writing Intensive",
      required_credits: 12,
      min_credits_per_course: 3,
      double_count: true,
      description:
        "Students are required to fulfill the university’s requirement of four writing intensive courses, " +
        "each at least 3 credits. Students must receive at least a C- grade or better in these writing courses. ",
      criteria: "Written Intensive[W]",
      fine_requirements: [
        {
          description:
            "<b>Writing-focused WI</b><p>At least one course must be explicitly focused on writing skills in English (eg, courses in professional, " +
            "fiction or expository writing). These courses may overlap with other requirements.</p><p>Any of the courses below would be satisfactory:</p><p>AS.060.100</p><p>AS.060.113</p><p>AS.060.114</p><p>AS.180.248</p><p>AS.220.105</p><p>AS.220.106</p><p>AS.220.108</p><p>AS.290.303</p><p>AS.360.133</p><p>EN.661.110</p><p>EN.661.111</p><p>EN.661.250</p><p>EN.661.251</p><p>EN.661.315</p>",

          required_credits: 3,
          criteria:
            "AS.060.100[C]^OR^AS.060.113[C]^OR^AS.060.114[C]^OR^AS.180.248[C]^OR^AS.220.105[C]^OR^AS.220.106[C]^OR^AS.220.108[C]^OR^AS.290.303[C]^OR^AS.360.133[C]^OR^EN.661.110[C]^OR^EN.661.111[C]^OR^EN.661.250[C]^OR^EN.661.251[C]^OR^EN.661.315[C]",
        },
      ],
    },
  ],
};

// https://www.cs.jhu.edu/undergraduate-studies/academics/cs-minor/
const CS_Minor_New = {
  degree_name: "Minor Computer Science (NEW - 2021 & after)",
  department: "EN Computer Science",
  total_degree_credit: 21,
  wi_credit: 0,
  url: "https://www.cs.jhu.edu/2021undergraduate-advising-manual/",
  distributions: [
    {
      name: "Computer Science",
      required_credits: 21,
      min_credits_per_course: 1,
      description:
        "For more information please visit the <a href=' https://www.cs.jhu.edu/undergraduate-studies/academics/cs-minor/'>" +
        "minor degree requirement</a> section on the department website.",
      criteria:
        "EN Computer Science[D]^OR^CSCI-OTHER[T]^OR^Gateway Computing[N]",
      fine_requirements: [
        {
          description:
            "<b>Lower Level Undergraduate:</b><p>500.112/113/114 Gateway Computing or AP Comp Sci A or " +
            "equivalent<p>601.220 Intermediate Programming</p><p>601.226 Data Structures</p><p> " +
            "any CS course >= 601.200 that is at least 3 credits. ",
          required_credits: 14,
          criteria:
            "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]^OR^EN.601.220[C]^OR^EN.601.226[C]^OR^(EN Computer Science[D]^AND^(Lower Level Undergraduate[L]^OR^Upper Level Undergraduate[L]))",
        },
        {
          description:
            "<b>Upper Level Undergraduate: </b><p>12 upper level CS credits that form a cohesive program of study. One way is to choose all three courses within one or two area tag classifications (CSCI-APPL, CSCI-SOFT, CSCI-THRY, CSCI-RSNG, CSCI-SYST)</p>",
          required_credits: 12,
          criteria: "EN Computer Science[D]^AND^Upper Level Undergraduate[L]",
        },
      ],
    },
  ],
};

// https://www.cs.jhu.edu/undergraduate-studies/academics/cs-minor/
const CS_Minor_Old = {
  degree_name: "Minor Computer Science (OLD - 2020 & before)",
  department: "EN Computer Science",
  total_degree_credit: 23,
  wi_credit: 0,
  url: "https://www.cs.jhu.edu/2021undergraduate-advising-manual/",
  distributions: [
    {
      name: "Computer Science",
      required_credits: 23,
      min_credits_per_course: 1,
      description:
        "For more information please visit the <a href=' https://www.cs.jhu.edu/undergraduate-studies/academics/cs-minor/'>" +
        "minor degree requirement</a> section on the department website.",
      criteria:
        "EN Computer Science[D]^OR^CSCI-OTHER[T]^OR^Gateway Computing[N]",
      fine_requirements: [
        {
          description: "<b>Core Courses:",
          required_credits: 14,
          criteria:
            "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]^OR^EN.601.220[C]^OR^EN.601.226[C]^OR^(EN Computer Science[D]^AND^(Lower Level Undergraduate[L]^OR^Upper Level Undergraduate[L]))",
        },
        {
          description:
            "<b>500.112/113/114 Gateway Computing or AP Comp Sci A or " +
            "equivalent</b>",
          required_credits: 3,
          criteria: "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]",
        },
        {
          description: "<b>601.220 Intermediate Programming</b>",
          required_credits: 4,
          criteria: "EN.601.220[C]",
        },
        {
          description: "<b>601.226 Data Structures</b>",
          required_credits: 4,
          criteria: "EN.601.226[C]",
        },
        {
          description:
            "<b>600.233/601.229 Computer System Fundamentals OR 600.271/601.231 Automata and Computation Theory</b><p>600.120/601.220 is pre-req, this course is a pre-req for some systems upper level courses</p><p>550.171/553.171 is a pre-req, this course is a pre-req for some analysis upper level courses</p>",
          required_credits: 3,
          criteria:
            "EN.600.233[C]^OR^EN.601.229[C]^OR^EN.600.271[C]^OR^EN.601.231[C]",
        },
        {
          description:
            "<b>Discrete Math:</b> Although not explicitly required, EN.553.171 Discrete Math is also strongly recommended for CS minors but does not count towards the minor requirements",
          required_credits: 0,
          criteria: "EN.553.171[C]",
        },
        {
          description:
            "<b>Upper Level Undergraduate: </b><p>9 upper level CS credits that form a cohesive program of study and <b>must be approved by the computer science minor advisor</b>. One way is to choose all three courses within one or two area tag classifications (CSCI-APPL, CSCI-SOFT, CSCI-THRY, CSCI-RSNG, CSCI-SYST)</p>",
          required_credits: 9,
          criteria: "EN Computer Science[D]^AND^Upper Level Undergraduate[L]",
          exclusive: true,
        },
      ],
    },
  ],
};

/*
  TODO:
  1. Some of the search features don't work properly (i.e. research courses, General Physics II for bio majors)
  3. Potentially formatting updates
*/
const bsMolCell = {
  degree_name: "B.S. Molecular and Cellular Biology",
  department: "AS Biology",
  total_degree_credit: 120,
  wi_credit: 12,
  url: "https://e-catalogue.jhu.edu/arts-sciences/full-time-residential-programs/degree-programs/biology/molecular-cellular-biology-bachelor-science/",
  distributions: [
    {
      name: "Biology Core", // 18-19 depending on biochemistry lab
      required_credits: 18,
      min_credits_per_course: 1,
      description:
        "These are the core biology courses." +
        "<br>For more information please visit the major degree requirement section on the department website.",
      criteria: "AS Biology[D]",
      fine_requirements: [
        {
          description: "<p>020.303 Genetics</p>",
          required_credits: 3,
          criteria: "AS.020.303[C]",
        },
        {
          description: "<p>020.304 Molecular Biology</p>",
          required_credits: 3,
          criteria: "AS.020.304[C]",
        },
        {
          description: "<p>020.305 Biochemistry</p>",
          required_credits: 3,
          criteria: "AS.020.305[C]",
        },
        {
          description: "<p>020.306 Cell Biology</p>",
          required_credits: 3,
          criteria: "AS.020.306[C]",
        },
        {
          description: "<p>020.316 Cell Biology Lab</p>",
          required_credits: 1,
          criteria: "AS.020.316[C]",
        },
        {
          description: "<p>020.340 Developmental Genetics Lab</p>",
          required_credits: 2,
          criteria: "AS.020.340[C]",
        },
        {
          description: "<p>020.363 Developmental Biology",
          required_credits: 3,
          criteria: "AS.020.363[C]",
        },
        {
          description:
            "<b>Biochemistry Lab</b>" +
            "<p>020.315 Biochemistry Project Lab</p>" +
            "<p>250.253 Protein Engineering and Biochemistry Lab</p>" +
            "<p>250.254 Protein Biochemistry and Engineering Lab</p>",
          required_credits: 1, // website says 2-3 but biochem project lab is only 1 and satisfies this req
          criteria: "AS.020.315[C]^OR^AS.250.253[C]^OR^AS.250.254[C]",
        },
      ],
    },
    {
      name: "Chemistry",
      required_credits: 19,
      min_credits_per_course: 1, // labs are 1 credit
      description:
        "Must complete General Chemistry (or AP equivalent) and Organic Chemistry in addition to their respective labs.",
      criteria: "AS Chemistry[D]",
      exception: "",
      fine_requirements: [
        {
          description: "<p>030.101 Introductory Chemistry I</p>",
          required_credits: 3,
          criteria: "AS.030.101[C]",
        },
        {
          description: "<p>030.105 Chemistry I Lab</p>",
          required_credits: 1,
          criteria: "AS.030.105[C]",
        },
        {
          description: "<p>030.102 Chemistry II</p>",
          required_credits: 3,
          criteria: "AS.030.102[C]",
        },
        {
          description: "<p>030.106 Chemistry II Lab</p>",
          required_credits: 1,
          criteria: "AS.030.106[C]",
        },
        {
          description: "<p>030.205 Introductory Organic Chemistry I</p>",
          required_credits: 4,
          criteria: "AS.030.205[C]",
        },
        {
          description:
            "<p>030.206 Organic Chemistry II or 030.212 Honors Organic Chemistry II</p>",
          required_credits: 4,
          criteria: "AS.030.206[C]^OR^AS.030.212[C]",
        },
        {
          description:
            "<p>Organic Chemistry Lab</p>" +
            "<p>030.225 Intro Organic Chemistry Lab</p>" +
            "<p>030.227 Chemical Chirality: An Introduction to Organic Chemistry Lab Techniques</p>",
          required_credits: 3,
          criteria: "AS.030.225[C]^OR^AS.030.227[C]",
        },
      ],
    },
    {
      name: "Physics",
      required_credits: 10,
      min_credits_per_course: 1,
      description:
        "Must complete Physics I and II (or AP equivalent) in addition to their respective labs.",
      criteria: "AS Physics & Astronomy[D]",
      fine_requirements: [
        {
          description:
            "<b>General Physics I</b>" +
            "<p>171.101 General Physics: Physical Science Majors I</p>" +
            "<p>171.103 General Physics: Biological Science Majors I</p>",
          required_credits: 4,
          criteria: "AS.171.101[C]^OR^AS.171.103[C]",
        },
        {
          description:
            "<b>General Physics II</b>" +
            "<p>171.102 General Physics: Physical Science Majors II</p>" +
            "<p>171.104 General Physics: Biological Science Majors II</p>",
          required_credits: 4,
          criteria: "AS.171.102[C]^OR^AS.171.104[C]",
        },
        {
          description: "<p>173.111 General Physics Lab I",
          required_credits: 1,
          criteria: "AS.173.111[C]",
        },
        {
          description: "<p>173.112 General Physics Lab II",
          required_credits: 1,
          criteria: "AS.173.112[C]",
        },
      ],
    },
    {
      name: "Mathematics",
      required_credits: 8,
      min_credits_per_course: 4,
      description: "Must complete Calculus I and II",
      criteria: "AS Mathematics[D]",
      fine_requirements: [
        {
          description:
            "<b>Calculus I</b>" +
            "<p>110.106 Calculus I (Biology and Social Sciences)</p>" +
            "<p>110.108 Calculus I (Physical Sciences and Engineering)</p>",
          required_credits: 4,
          criteria: "AS.110.106[C]^OR^AS.110.108[C]",
        },
        {
          description:
            "<b>Calculus II</b>" +
            "<p>110.107 Calculus II (Biology and Social Sciences)</p>" +
            "<p>110.109 Calculus II (Physical Sciences and Engineering)</p>" +
            "<p>110.113 Honors Single Variable Calculus</p>",
          required_credits: 4,
          criteria: "AS.110.107[C]^OR^AS.110.109[C]^OR^AS.110.113[C]",
        },
      ],
    },
    {
      name: "Upper Level Electives",
      required_credits: 12,
      min_credits_per_course: 2,
      description:
        "4 courses and 12 credits required. One 2 or 3 credit elective must be taken in the Biology Department (AS.020.xxx). " +
        "<br>See POS-Tag BIOL-UL on SIS for the courses approved by the Director of Undergraduate Studies. " +
        "<br>Students may use 2 credits of Build-a-Genome (AS.020.420 or AS.020.451) toward the upper level Biology elective requirement.",
      criteria: "AS Biology[D]",
      fine_requirements: [
        {
          description: "<b>Biology Department Upper Level</b>",
          required_credits: 2, // 2 or 3
          criteria: "AS Biology[D]^AND^Upper Level Undergraduate[L]",
        },
      ],
    },
    {
      name: "Biology Research Requirement",
      required_credits: 6,
      min_credits_per_course: 1,
      description:
        "Students may use AS.020.420 and/or AS.020.451 to fulfill 3 credits (each) of the Research Requirement. " +
        "<br>The major emphasis of the BS degree in molecular and cellular biology is the participation of the students in an original research project.",
      criteria:
        "AS.020.135[C]^OR^AS.020.136[C]^OR^AS.020.420[C]^OR^AS.020.451[C]^OR^AS.020.503[C]^OR^AS.020.504[C]^OR^AS.020.513[C]^OR^AS.020.514[C]^OR^" +
        "AS.020.572[C]^OR^AS.020.597[C]^OR^AS.030.501[C]^OR^AS.030.502[C]^OR^AS.030.503[C]^OR^AS.030.504[C]^OR^AS.030.505[C]^OR^AS.030.506[C]^OR^" +
        "AS.030.507[C]^OR^AS.030.509[C]^OR^AS.030.510[C]^OR^AS.030.521[C]^OR^AS.030.522[C]^OR^AS.030.523[C]^OR^AS.030.524[C]^OR^AS.030.525[C]^OR^" +
        "AS.030.526[C]^OR^AS.030.570[C]^OR^AS.030.597[C]^OR^AS.250.521[C]^OR^AS.250.522[C]^OR^AS.250.574[C]^OR^AS.250.597[C]",
    },
    {
      name: "Writing Intensive",
      required_credits: 12,
      min_credits_per_course: 3,
      double_count: true,
      description:
        "Students are required to fulfill the university’s requirement of four writing intensive courses, " +
        "each at least 3 credits. <br>Students must receive at least a C- grade or better in these writing courses. ",
      criteria: "Written Intensive[W]",
    },
    {
      name: "Humanities Distribution Requirement",
      required_credits: 9,
      min_credits_per_course: 1,
      description:
        "Students must earn at least 9 credits in humanities. " +
        "<br>In Arts and Sciences, courses taken for the distribution requirement may be taken for a letter grade or for Satisfactory/Unsatisfactory credit. " +
        "<br>Courses passed with a letter grade of D or better, or passed with a Satisfactory grade, will fulfill the distribution requirement. " +
        "<br>Students who entered JHU prior to Fall 2014 should view the appropriate archived catalogue.",
      criteria: "H[A]",
      exclusive: true,
    },
    {
      name: "Social Science Distribution Requirement",
      required_credits: 9,
      min_credits_per_course: 1,
      description:
        "Students must earn at least 9 credits in social sciences. " +
        "<br>In Arts and Sciences, courses taken for the distribution requirement may be taken for a letter grade or for Satisfactory/Unsatisfactory credit. " +
        "<br>Courses passed with a letter grade of D or better, or passed with a Satisfactory grade, will fulfill the distribution requirement. " +
        "<br>Students who entered JHU prior to Fall 2014 should view the appropriate archived catalogue.",
      criteria: "S[A]",
      exclusive: true,
    },
    {
      name: "Honors",
      required_credits: 0,
      min_credits_per_course: 0,
      description:
        "Students earning either a BA in biology or BS in cellular and molecular biology are eligible to receive their degree with honors. " +
        "The following requirements are in addition to the regular requirements for the degrees. " +
        "<br>- GPA of 3.5 or higher in N and Q courses. " +
        "<br>- r6 credits of registered independent research (note that this is already a requirement for the BS degree). " +
        "<br>- A letter of support from your research supervisor (the PI of the lab)" +
        "<br>- Presentation of your independent research as a seminar or poster presentation",
      criteria: "",
    },
  ],
};

export function getMajorFromCommonName(name) {
  let out = null;
  allMajors.forEach((major) => {
    if (major.degree_name === name) {
      out = major;
    }
  });
  if (out === null) {
    throw Error("Major not found");
  }
  return out;
}

export const allMajors = [
  baIS,
  bsCS_Old,
  bsCS_New,
  baCS_New,
  CS_Minor_New,
  CS_Minor_Old,
  bsMolCell,
];
