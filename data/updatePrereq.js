import { connect } from './db.js';
import dotenv from 'dotenv';
import SISCourseV from '../model/SISCourseV.js';

dotenv.config();

async function updateIntroAlgo() {
  connect();
  const number = 'EN.601.433';
  const oldPrereq = [
    {
      Description:
        'EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231',
      Expression:
        'EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^)',
      IsNegative: 'N',
    },
    {
      Description:
        'Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.',
      Expression: 'EN.600.363[C]^OR^EN.601.633[C]',
      IsNegative: 'Y',
    },
  ];

  const newPrereq = [
    {
      Description:
        'EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230',
      Expression:
        'EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)',
      IsNegative: 'N',
    },
    {
      Description:
        'Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.',
      Expression: 'EN.600.363[C]^OR^EN.601.633[C]',
      IsNegative: 'Y',
    },
  ];

  let data = await SISCourseV.find({ number });
  let course = data[0];
  for (let version of course.versions) {
    version.preReq = newPrereq;
  }
  await course.save();
  console.log('done!');
}

// updateIntroAlgo();

async function checkUpdated() {
  connect();
  const number = 'EN.601.433';
  let data = await SISCourseV.find({ number });
  let course = data[0];

  for (let version of course.versions) {
    console.log(version.preReq);
  }
}

checkUpdated();

/** Intro Algo
 * {
    "data": {
        "_id": "635df458662f1ebee559601f",
        "terms": [
            "Fall 2021",
            "Spring 2023",
            "Fall 2022",
            "Spring 2022",
            "Spring 2021",
            "Fall 2020",
            "Spring 2020",
            "Fall 2019"
        ],
        "title": "Intro Algorithms",
        "number": "EN.601.433",
        "versions": [
            {
                "department": "EN Computer Science",
                "tags": [
                    "BMED-BDS",
                    "COGS-COMPCG",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "637042cbbfb975c236485bf9",
                "areas": "EQ",
                "term": "Fall 2021",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "COGS-COMPCG",
                    "BMED-BDS",
                    "ARCH-ARCH",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [
                    {
                        "RestrictionName": "Computer Science minors",
                        "Description": ""
                    },
                    {
                        "RestrictionName": "UGrad Computer Engineering majors",
                        "Description": ""
                    },
                    {
                        "RestrictionName": "UGrad Computer Science majors",
                        "Description": ""
                    }
                ],
                "_id": "635df5c8662f1ebee559ed3c",
                "areas": "EQ",
                "term": "Spring 2023",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "BMED-BDS",
                    "COGS-COMPCG",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "635df59b662f1ebee559da76",
                "areas": "EQ",
                "term": "Fall 2022",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "COGS-COMPCG",
                    "BMED-BDS",
                    "ARCH-ARCH",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "635df571662f1ebee559c810",
                "areas": "EQ",
                "term": "Spring 2022",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "COGS-COMPCG",
                    "BMED-BDS",
                    "ARCH-ARCH",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "635df501662f1ebee5599dcf",
                "areas": "EQ",
                "term": "Spring 2021",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "BMED-BDS",
                    "COGS-COMPCG",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "635df4c8662f1ebee559885b",
                "areas": "EQ",
                "term": "Fall 2020",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "COGS-COMPCG",
                    "BMED-BDS",
                    "ARCH-ARCH",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "635df489662f1ebee5596c56",
                "areas": "EQ",
                "term": "Spring 2020",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis.  [Analysis]"
            },
            {
                "department": "EN Computer Science",
                "tags": [
                    "COGS-COMPCG",
                    "BME-BDS",
                    "BMED-BDS",
                    "CSCI-THRY"
                ],
                "preReq": [
                    {
                        "Description": "EN.600.226/EN.601.226 AND (EN.553.171/EN.550.171 OR EN.553.172/EN.550.170 OR EN.600.271/EN.601.231 OR EN.601.230",
                        "Expression": "EN.600.226[C]^AND^(^EN.553.171[C]^OR^EN.553.172[C]^OR^EN.600.271[C]^OR^EN.601.230[C]^)",
                        "IsNegative": "N"
                    },
                    {
                        "Description": "Students may receive credit for only one of EN.600.363, EN.600.463, EN.601.433, EN.601.633.",
                        "Expression": "EN.600.363[C]^OR^EN.601.633[C]",
                        "IsNegative": "Y"
                    }
                ],
                "coReq": [],
                "restrictions": [],
                "_id": "635df458662f1ebee5596020",
                "areas": "EQ",
                "term": "Fall 2019",
                "school": "Whiting School of Engineering",
                "credits": 3,
                "wi": false,
                "level": "Upper Level Undergraduate",
                "bio": "This course concentrates on the design of algorithms and the rigorous analysis of their efficiency. topics include the basic definitions of algorithmic complexity (worst case, average case); basic tools such as dynamic programming, sorting, searching, and selection; advanced data structures and their applications (such as union-find); graph algorithms and searching techniques such as minimum spanning trees, depth-first search, shortest paths, design of online algorithms and competitive analysis. [Analysis]"
            }
        ],
        "__v": 9
    }
}
 * 
 */
