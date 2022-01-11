// https://e-catalogue.jhu.edu/arts-sciences/full-time-residential-programs/degree-programs/economics/economics-bachelor-arts/
const baEcon = {
  degree_name: "B.A. Economics",
  department: "AS Economics",
  total_degree_credit: 120,
  wi_credit: 12,
  url: "https://e-catalogue.jhu.edu/arts-sciences/full-time-residential-programs/degree-programs/economics/economics-bachelor-arts/",
  distributions: [
    {
      name: "Economics Core",
      required_credits: 18,
      min_credits_per_course: 1,
      description:
        "For more information please visit the" +
        "<a href='https://econ.jhu.edu/undergraduate/major-requirements/'>" +
        "major degree requirement</a> section on the department website.",
      criteria:
        "AS.180.101[C]^OR^AS.180.102[C]^OR^AS.180.301[C]^OR^AS.108.401[C]^OR^AS.180.302[C]",
      fine_requirements: [
        {
          description:
            "<b>Elements of Macroeconomics</b> <br /> AS.180.101 Elements of Macroeconomics",
          required_credits: 3,
          criteria: "AS.180.101[C]",
        },
        {
          description:
            "<b>Elements of Microeconomics</b> <br /> AS.180.102 Elements of Microeconomics",
          required_credits: 3,
          criteria: "AS.180.102[C]",
        },
        {
          description:
            "<b>Microeconomic Theory</b> <br /> AS.180.301 Microeconomic Theory <br /> <i>OR</i> <br /> AS.108.401 Advanced Microeconomic Theory",
          required_credits: 4.5,
          criteria: "AS.180.301[C]^OR^AS.108.401[C]",
        },
        {
          description:
            "<b>Macroeconomic Theory</b> <br /> AS.180.302 Macroeconomic Theory",
          required_credits: 4.5,
          criteria: "AS.180.302[C]",
        },
        {
          description:
            "<b>Econometrics</b> <br /> AS.180.334 Econometrics <br /> <i>OR</i> <br /> AS.108.434 Advanced Econometrics",
          required_credits: 3,
          criteria: "AS.180.334[C]^OR^AS.108.434[C]",
        },
      ],
    },
    {
      name: "Economics Electives",
      required_credits: 15,
      min_credits_per_course: 3,
      description:
        "All courses in this category must be offered by the Economics Department. Three courses must be taken at the 200 level, " +
        "and two must be taken at the 300 level.",
      criteria: "AS Economics[D]",
      fine_requirements: [
        {
          description: "<b>Lower Level Classes</b>",
          required_credits: 9,
          criteria: "Lower Level[L]",
        },
        {
          description: "<b>Upper Level Classes</b>",
          required_credits: 6,
          criteria: "Upper Level[L]",
        },
      ],
    },
    {
      name: "Mathematics",
      required_credits: 4,
      min_credits_per_course: 3,
      description:
        "Students must complete the math requirement for the major by taking Calculus I (AS.110.106 OR AS.110.108).",
      criteria: "AS.110.106[C]^OR^AS.110.108[C]",
    },
    {
      name: "Statistics",
      required_credits: 4,
      min_credits_per_course: 3,
      description:
        "Students must complete one course from the approved list of statistics courses: <br /> EN.553.111 Statistical Analysis I <br /> " +
        "EN.553.112 Statistical Analysis II <br /> EN.553.211 Probability and Statistics for the Life Sciences <br /> EN.553.310 Probability & Statistics for the Physical Sciences & Engineering <br /> " +
        "EN.553.311 Probability and Statistics for the Biological Sciences and Engineering <br />  EN.553.420 Introduction to Probability <br />  EN.553.430 Introduction to Statistics <br /> " +
        "AS.280.345 Public Health Biostatistics",
      criteria:
        "EN.553.111[C]^OR^EN.553.112[C]^OR^EN.553.211[C]^OR^EN.553.310[C]^OR^EN.553.311[C]^OR^EN.553.420[C]^OR^EN.553.430[C]^OR^AS.280.345[C]",
    },
    {
      name: "Humanities (H) Distribution",
      required_credits: 9,
      min_credits_per_course: 3,
      description:
        "The distribution requirement stipulates that students must earn a minimum number of credits in academic areas outside of their primary major. " +
        "The student must complete at least 9 credits in the Humanities (H) area. " +
        "These credits fulfilling the distribution requirement may overlap with major or minor requirements and the writing-intensive requirement.",
      criteria: "H[A]",
    },
    {
      name: "Social Science (S) Distribution",
      required_credits: 9,
      min_credits_per_course: 3,
      description:
        "The distribution requirement stipulates that students must earn a minimum number of credits in academic areas outside of their primary major. " +
        "The student must complete at least 9 credits in the Social Science (S) area. " +
        "These credits fulfilling the distribution requirement may overlap with major or minor requirements and the writing-intensive requirement.",
      criteria: "S[A]",
    },
    {
      name: "Other (N/E/Q) Distribution",
      required_credits: 9,
      min_credits_per_course: 3,
      description:
        "The distribution requirement stipulates that students must earn a minimum number of credits in academic areas outside of their primary major. " +
        "The student must complete at least 9 credits in any of the other areas: Natural Sciences (N), Engineering (E) and/or Quantitative (Q). " +
        "These credits fulfilling the distribution requirement may overlap with major or minor requirements and the writing-intensive requirement.",
      criteria: "N[A]^OR^E[A]^OR^Q[A]",
    },
    {
      name: "Writing Intensive",
      required_credits: 12,
      min_credits_per_course: 3,
      description:
        "To encourage excellence in writing, across disciplines, the university requires all undergraduates to take a number of writing-intensive courses. " +
        "All students earning a degree from the School of Arts and Sciences must complete at least 12 credits in writing-intensive courses. " +
        "Writing-intensive courses taken to satisfy major, minor, or distribution requirements may also count toward the writing requirement.",
      criteria: "Written Intensive[W]",
      double_count: true,
    },
  ],
};

// https://www.bme.jhu.edu/academics/undergraduate/undergraduate-degree-requirements/
const bsBME = {
  degree_name: "B.S. Biomedical Engineering",
  department: "EN Biomedical Engineering",
  total_degree_credit: 129,
  wi_credit: 6,
  url: "https://www.bme.jhu.edu/academics/undergraduate/undergraduate-degree-requirements/",
  distributions: [
    {
      name: "Biomedical Core",
      required_credits: 34,
      min_credits_per_course: 1,
      description:
        "Each student must complete a set of core courses which will serve as foundational knowledge in the discipline of Biomedical Engineering. For more information please visit the " +
        "<a href='https://e-catalogue.jhu.edu/engineering/full-time-residential-programs/degree-programs/biomedical-engineering/biomedical-engineering-bachelor-science/#requirementstext'>" +
        "major degree requirement</a> section on the department website.",
      criteria:
        "EN.580.111[C]^OR^EN.580.151[C]^OR^EN.580.153[C]^OR^EN.580.221[C]^OR^EN.580.241[C]^OR^EN.580.242[C]^OR^EN.580.243[C]^OR^" +
        "EN.580.244[C]^OR^EN.580.246[C]^OR^EN.580.248[C]^OR^EN.580.475[C]^OR^EN.580.477[C]^OR^EN.580.485[C]^OR^EN.580.487[C]^OR^" +
        "EN.580.424[C]^OR^EN.580.427[C]^OR^EN.580.452[C]^OR^EN.580.453[C]^OR^EN.580.454[C]^OR^EN.580.494[C]",
      fine_requirements: [
        {
          description:
            "<b>Biomedical Engineering and Design</b> <br /> EN.580.111 Biomedical Engineering and Design",
          required_credits: 2,
          criteria: "EN.580.111[C]",
        },
        {
          description:
            "<b>Structural Biology of Cells</b> <br /> EN.580.151 Structural Biology of Cells",
          required_credits: 3,
          criteria: "EN.580.151[C]",
        },
        {
          description:
            "<b>Structural Biology of Cells Laboratory</b> <br /> EN.580.153 Structural Biology of Cells Laboratory",
          required_credits: 1,
          criteria: "EN.580.153[C]",
        },
        {
          description:
            "<b>Biochemistry and Molecular Engineering</b> <br /> EN.580.221 Biochemistry and Molecular Engineering",
          required_credits: 4,
          criteria: "EN.580.221[C]",
        },
        {
          description:
            "<b>Statistical Physics</b> <br /> EN.580.241 Statistical Physics",
          required_credits: 2,
          criteria: "EN.580.241[C]",
        },
        {
          description:
            "<b>Biological Models and Simulations</b> <br /> EN.580.242 Biological Models and Simulations",
          required_credits: 2,
          criteria: "EN.580.242[C]",
        },
        {
          description:
            "<b>Linear Signals and Systems</b> <br /> EN.580.243 Linear Signals and Systems",
          required_credits: 2,
          criteria: "EN.580.243[C]",
        },
        {
          description:
            "<b>Nonlinear Dynamics of Biological Systems</b> <br /> EN.580.244 Nonlinear Dynamics of Biological Systems",
          required_credits: 2,
          criteria: "EN.580.244[C]",
        },
        {
          description:
            "<b>Systems and Controls</b> <br /> EN.580.246 Systems and Controls",
          required_credits: 2,
          criteria: "EN.580.246[C]",
        },
        {
          description:
            "<b>Systems Biology of the Cell</b> <br /> EN.580.248 Systems Biology of the Cell",
          required_credits: 2,
          criteria: "EN.580.248[C]",
        },
        {
          description:
            "<b>Biomedical Data Science</b> <br /> EN.580.475 Biomedical Data Science",
          required_credits: 2,
          criteria: "EN.580.475[C]",
        },
        {
          description:
            "<b>Biomedical Data Science Laboratory</b> <br /> EN.580.477 Biomedical Data Science Laboratory",
          required_credits: 1,
          criteria: "EN.580.477[C]",
        },
        {
          description:
            "<b>Computational Medicine: Cardiology</b> <br /> EN.580.485 Computational Medicine: Cardiology",
          required_credits: 2,
          criteria: "EN.580.485[C]",
        },
        {
          description:
            "<b>Computational Medicine: Cardiology Laboratory</b> <br /> EN.580.487 Computational Medicine: Cardiology Laboratory",
          required_credits: 1,
          criteria: "EN.580.487[C]",
        },
        {
          description:
            "<b>Core Electives</b> <br /> Select two of the following core electives (Note: These courses cannot be double-counted toward the 21-credit focus area " +
            "requirement. Courses taken in excess of the 6 credit core elective requirement can be counted in a relevant focus area):" +
            "<br /> EN.580.424 Neuroengineering and Lab <br /> EN.580.427 Microphysiological Systems and Lab <br />" +
            "EN.580.452 Cell and Tissue Engineering Lab <br /> EN.580.453 Immunoengineering Principles and Applications <br />" +
            "EN.580.454 Methods in Nucleic Acid Sequencing Lab <br /> EN.580.494 Build an Imager",
          required_credits: 6,
          criteria:
            "EN.580.424[C]^OR^EN.580.427[C]^OR^EN.580.452[C]^OR^EN.580.453[C]^OR^EN.580.454[C]^OR^EN.580.494[C]",
        },
        {
          description:
            "<b>Career Exploration</b> <br /> Career Exploration in BME is a 0-credit self-identified set of career related events (lectures, panels, journal clubs, etc.) " +
            "beginning in the spring semester of year one and continuing until graduation. Career Exploration is administered through a " +
            "Community Blackboard site; students will be enrolled by the department.",
          required_credits: 0,
          criteria: "EN Career Exploration[D]",
        },
      ],
    },
    {
      name: "Basic Sciences",
      required_credits: 18,
      min_credits_per_course: 1,
      description:
        "Students who receive credit for AP Physics I and/or Physics II will receive a waiver for the laboratory course. " +
        "This will reduce the required number of credits for Basic Sciences by 1 or 2 credits. Students are still required " +
        "to complete at least 129 total credits for the degree.",
      criteria:
        "AS.171.101[C]^OR^AS.171.107[C]^OR^AS.171.102[C]^OR^AS.171.108[C]^OR^AS.173.111[C]^OR^AS.173.112[C]" +
        "^OR^AS.030.101[C]^OR^AS.030.102[C]^OR^AS.030.105[C]^OR^AS.030.106[C]",
      fine_requirements: [
        {
          description:
            "<b>General Physics I</b> <br /> AS.171.101 General Physics: Physical Science Majors I <br /> <i>OR</i> <br /> AS.171.107 General Physics for Physical Sciences Majors I (AL)",
          required_credits: 4,
          criteria: "AS.171.101[C]^OR^AS.171.107[C]",
        },
        {
          description:
            "<b>General Physics II</b> <br /> AS.171.102 General Physics: Physical Science Majors II <br /> <i>OR</i> <br /> AS.171.108 General Physics for Physical Sciences Majors II (AL)",
          required_credits: 4,
          criteria: "AS.171.102[C]^OR^AS.171.108[C]",
        },
        {
          description:
            "<b>General Physics Laboratory I</b> <br /> AS.173.111 General Physics Laboratory I",
          required_credits: 1,
          criteria: "AS.173.111[C]",
        },
        {
          description:
            "<b>General Physics Laboratory II</b> <br /> AS.173.112 General Physics Laboratory II",
          required_credits: 1,
          criteria: "AS.173.112[C]",
        },
        {
          description:
            "<b>Introductory Chemistry I</b> <br /> AS.030.101 Introductory Chemistry I",
          required_credits: 3,
          criteria: "AS.030.101[C]",
        },
        {
          description:
            "<b>Introductory Chemistry II</b> <br /> AS.030.102 Introductory Chemistry II",
          required_credits: 3,
          criteria: "AS.030.102[C]",
        },
        {
          description:
            "<b>Introductory Chemistry Laboratory I</b> <br /> AS.030.105 Introductory Chemistry Laboratory I",
          required_credits: 1,
          criteria: "AS.030.105[C]",
        },
        {
          description:
            "<b>Introductory Chemistry Laboratory II</b> <br /> AS.030.106 Introductory Chemistry Laboratory II",
          required_credits: 1,
          criteria: "AS.030.106[C]",
        },
      ],
    },
    {
      name: "Mathematics",
      required_credits: 19,
      min_credits_per_course: 3,
      description:
        "Students who take an approved math course and receive 3 credits will have a total of 19 credits. Students are " +
        "still required to complete at least 129 total credits for the degree.",
      criteria:
        "AS.110.108[C]^OR^AS.110.109[C]^OR^AS.110.202[C]^OR^AS.110.211[C]^OR^EN.553.291[C]" +
        "^OR^EN.553.310[C]^OR^EN.553.311[C]^OR^EN.553.413[C]^OR^EN.553.430[C]^OR^EN.553.433[C]^OR^EN.560.348[C]",
      fine_requirements: [
        {
          description:
            "<b>Calculus I</b> <br /> AS.110.108 Calculus I (Physical Sciences & Engineering)",
          required_credits: 4,
          criteria: "AS.110.108[C]",
        },
        {
          description:
            "<b>Calculus II</b> <br /> AS.110.109 Calculus II (Physical Sciences & Engineering)",
          required_credits: 4,
          criteria: "AS.110.109[C]",
        },
        {
          description:
            "<b>Calculus III</b> <br /> AS.110.202 Calculus III <br /> <i>OR</i> <br /> AS.110.211 Honors Multivariable Calculus",
          required_credits: 4,
          criteria: "AS.110.202[C]^OR^AS.110.211[C]",
        },
        {
          description:
            "<b>Linear Algebra and Differential Equations</b> <br /> EN.553.291 Linear Algebra and Differential Equations",
          required_credits: 4,
          criteria: "EN.553.291[C]",
        },
        {
          description:
            "<b>Probability and Statistics</b> <br /> Select one of the following: <br /> EN.553.310 Probability and Statistics for the Physical Sciences and Engineering <br />" +
            "EN.553.311 Probability and Statistics for the Biological Sciences & Engineering <br /> EN.553.413 Applied Statistics and Data Analysis <br />" +
            "EN.553.430 Introduction to Statistics <br /> EN.553.433 Monte Carlo Methods <br /> EN.560.348 Probability & Statistics in Civil Engineering",
          required_credits: 3,
          criteria:
            "EN.553.310[C]^OR^EN.553.311[C]^OR^EN.553.413[C]^OR^EN.553.430[C]^OR^EN.553.433[C]^OR^EN.560.348[C]",
        },
      ],
    },
    {
      name: "Computer Programming",
      required_credits: 3,
      min_credits_per_course: 3,
      description:
        "Students are required to take at least one semester of programming from a select set of gateway computing courses.",
      criteria: "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]",
      fine_requirements: [
        {
          description:
            "<b>Computer Programming</b> <br /> Select one of the following: <br /> EN.500.112 Gateway Computing: JAVA <br /> EN.500.113 Gateway Computing: Python <br />" +
            "EN.500.114 Gateway Computing: MATLAB",
          required_credits: 3,
          criteria: "EN.500.112[C]^OR^EN.500.113[C]^OR^EN.500.114[C]",
        },
      ],
    },
    {
      name: "Focus Area",
      required_credits: 21,
      min_credits_per_course: 1,
      pathing: true,
      description:
        "The student must select at least 21 credits from the approved list of courses for a specific focus area. Coordinate with your advisor to" +
        " determine the best combination of classes for you:",
      criteria:
        "BMED-BDS[T]^OR^BMED-CM[T]^OR^BMED-GSB[T]^OR^BMED-IMD[T]^OR^BMED-IMMU[T]^OR^BMED-NE[T]^OR^BMED-TCTE[T]",
      fine_requirements: [
        {
          description: "<b>Biomedical Data Science</b>",
          required_credits: 21,
          criteria: "BMED-BDS[T]",
        },
        {
          description: "<b>Computational Medicine</b>",
          required_credits: 21,
          criteria: "BMED-CM[T]",
        },
        {
          description: "<b>Genomics and Systems Biology</b>",
          required_credits: 21,
          criteria: "BMED-GSB[T]",
        },
        {
          description: "<b>Imaging and Medical Devices</b>",
          required_credits: 21,
          criteria: "BMED-IMD[T]",
        },
        {
          description: "<b>Imunoengineering</b>",
          required_credits: 21,
          criteria: "BMED-IMMU[T]",
        },
        {
          description: "<b>Neuroengineering</b>",
          required_credits: 21,
          criteria: "BMED-NE[T]",
        },
        {
          description: "<b>Translational Cell and Tissue Engineering</b>",
          required_credits: 21,
          criteria: "BMED-TCTE[T]",
        },
      ],
    },
    {
      name: "Design",
      required_credits: 6,
      min_credits_per_course: 3,
      description: "Select at least one of the following design sequences",
      criteria:
        "(EN.510.433[C]^OR^EN.510.434[C])^OR^(EN.520.462[C]^OR^EN.520.463[C])^OR^" +
        "(EN.520.498[C]^OR^EN.520.499[C])^OR^(EN.540.400[C]^OR^EN.540.421[C])^OR^" +
        "(EN.580.311[C]^OR^EN.580.312[C])^OR^(EN.580.411[C]^OR^EN.580.412[C])^OR^" +
        "(EN.580.456[C]^OR^EN.580.457[C])^OR^(EN.580.471[C]^OR^EN.580.571[C])^OR^" +
        "(EN.580.480[C]^OR^EN.580.481[C])^OR^(EN.580.580[C]^OR^EN.580.581[C])^OR^" +
        "(EN.601.455[C]^OR^EN.601.456[C])^OR^(EN.580.437[C]^OR^EN.580.438[C])",
      pathing: true,
      fine_requirements: [
        {
          description:
            "<b>EN.500.308 and EN.500.309</b> <br /> EN.500.308 Multidisciplinary Engineering Design I <br /> EN.500.309 Advanced Multidisciplinary Design",
          required_credits: 6,
          criteria: "EN.500.308[C]^OR^EN.500.309[C]",
        },
        {
          description:
            "<b>EN.510.433 and EN.510.434</b> <br /> EN.510.433 Senior Design Research <br /> EN.510.434 Senior Design/Research II <br />" +
            "(This option must be approved by the Materials Science & Engineering Department)",
          required_credits: 6,
          criteria: "EN.510.433[C]^OR^EN.510.434[C]",
        },
        {
          description:
            "<b>EN.520.462 and EN.520.463</b> <br /> EN.520.462 Leading Innovation Design Team <br /> EN.520.463 Leading Innovation Design Team II",
          required_credits: 6,
          criteria: "EN.520.462[C]^OR^EN.520.463[C]",
        },
        {
          description:
            "<b>EN.520.498 and EN.520.499</b> <br /> EN.520.498 Senior Design Project <br /> EN.520.499 Senior Design Project II",
          required_credits: 6,
          criteria: "EN.520.498[C]^OR^EN.520.499[C]",
        },
        {
          description:
            "<b>EN.540.400 and EN.540.421</b> <br /> EN.540.400 Project in Design: Pharmacokinetics <br /> EN.540.421 Project in Design: Pharmacodynamics",
          required_credits: 6,
          criteria: "EN.540.400[C]^OR^EN.540.421[C]",
        },
        {
          description:
            "<b>EN.580.311 and EN.580.312</b> <br /> EN.580.311 Design Team Health Tech Project I <br /> EN.580.312 Design Team Health Tech Project II",
          required_credits: 6,
          criteria: "EN.580.311[C]^OR^EN.580.312[C]",
        },
        {
          description:
            "<b>EN.580.411 and EN.580.412</b> <br /> EN.580.411 Design Team Health Tech Project I <br /> EN.580.412 Design Team Health Tech Project II",
          required_credits: 6,
          criteria: "EN.580.411[C]^OR^EN.580.412[C]",
        },
        {
          description:
            "<b>EN.580.437 and EN.580.438</b> <br /> EN.580.437 Neuro Data Design I <br /> EN.580.438 Neuro Data Design II",
          required_credits: 6,
          criteria: "EN.580.437[C]^OR^EN.580.438[C]",
        },
        {
          description:
            "<b>EN.580.456 and EN.580.457</b> <br /> EN.580.456 Introduction to Rehabilitation Engineering <br /> EN.580.457 Introduction to Rehabilitation Engineering: Design Lab",
          required_credits: 6,
          criteria: "EN.580.456[C]^OR^EN.580.457[C]",
        },
        {
          description:
            "<b>EN.580.471 and EN.580.571</b> <br /> EN.580.471 Principles of Design of BME Instrumentation <br /> EN.580.571 Honors Instrumentation",
          required_credits: 6,
          criteria: "EN.580.471[C]^OR^EN.580.571[C]",
        },
        {
          description:
            "<b>EN.580.480 and EN.580.481</b> <br /> EN.580.480 Precision Care Medicine I <br /> EN.580.481 Precision Care Medicine II",
          required_credits: 6,
          criteria: "EN.580.480[C]^OR^EN.580.481[C]",
        },
        {
          description:
            "<b>EN.580.580 and EN.580.581</b> <br /> EN.580.580 Senior Design Project I <br /> EN.580.581 Senior Design Project II",
          required_credits: 6,
          criteria: "EN.580.580[C]^OR^EN.580.581[C]",
        },
        {
          description:
            "<b>EN.601.455 and EN.601.456</b> <br /> EN.601.455 Computer Integrated Surgery I <br /> EN.601.456 Computer Integrated Surgery II",
          required_credits: 6,
          criteria: "EN.601.455[C]^OR^EN.601.456[C]",
        },
      ],
    },
    {
      name: "Other Electives",
      required_credits: 9,
      min_credits_per_course: 1,
      description: "Select 9 credits from any area.",
      criteria: "H[A]^OR^S[A]^OR^Q[A]^OR^N[A]^OR^E[A]",
      exclusive: true,
    },
    {
      name: "Humanities and Social Sciences",
      required_credits: 18,
      min_credits_per_course: 3,
      description:
        "Select courses to form a coherent program, relevant to the student’s goals. One course in which ethical and social " +
        "issues related to technology or medicine is recommended.",
      criteria: "H[A]^OR^S[A]",
      fine_requirements: [
        {
          description: "<b>One Upper Level class</b>",
          required_credits: 3,
          criteria: "(H[A]^OR^S[A])^AND^(Upper Level[L])",
        },
      ],
    },
    {
      name: "Writing Intensive",
      required_credits: 6,
      min_credits_per_course: 3,
      double_count: true,
      description:
        "Students are required to fulfill the university’s requirement of two writing intensive courses, " +
        "each at least 3 credits. Students must receive at least a C- grade or better in these writing courses.",
      criteria: "Written Intensive[W]",
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
