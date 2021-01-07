# uCredit-API

##Some Notes##
Data creation must follow this flow: User->Distribution->Courses
The database must have a valid user first since distribution and courses must fulfill the user_id field, and a course must fulfill the distribution field.
When a new user is created it will not have any data in the courses/distribution field.
