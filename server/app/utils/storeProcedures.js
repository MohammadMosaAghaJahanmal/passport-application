const { connection } = require('./sequelizeConnection'); // Include your Sequelize connection

// Function to check if a stored procedure exists

async function doesProcedureExist(procedureName) {
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM information_schema.routines
            WHERE routine_name = '${procedureName}'
            AND routine_type = 'PROCEDURE';
        `;

        const [result] = await connection.query(query);
        const exists = result[0].count > 0;
        return exists;
    } catch (error) {
        console.error(`Error checking procedure existence: ${error.message}`);
        return false;
    }
}

// Function to create a stored procedure if it doesn't exist
async function createProcedureIfNotExists(procedureName, procedureQuery) {
  const exists = await doesProcedureExist(procedureName);

  if (!exists) {
      await connection.query(procedureQuery);
      console.log(`Stored procedure ${procedureName} created successfully.`);
  } else {
      console.log(`Stored procedure ${procedureName} already exists.`);
  }
}

const callProcedures = async () =>
{
// Your stored procedure queries
const createProcedureQuery = `
    CREATE PROCEDURE sp_CreateUser
        @username NVARCHAR(200),
        @password NVARCHAR(200),
        @active BIT
    AS
    BEGIN
        INSERT INTO users (username, password, active)
        VALUES (@username, @password, @active);
    END;
`;

const getUserProcedureQuery = `
    CREATE PROCEDURE sp_GetUser
        @userId INT
    AS
    BEGIN
        SELECT * FROM users WHERE id = @userId;
    END;
`;

const updateProcedureQuery = `
    CREATE PROCEDURE sp_UpdateUser
        @userId INT,
        @username NVARCHAR(200),
        @password NVARCHAR(200),
        @active BIT
    AS
    BEGIN
        UPDATE users
        SET username = @username, password = @password, active = @active
        WHERE id = @userId;
    END;
`;

const deleteProcedureQuery = `
    CREATE PROCEDURE sp_DeleteUser
        @userId INT
    AS
    BEGIN
        DELETE FROM users WHERE id = @userId;
    END;
`;

const authenticateUserQuery = `

    CREATE PROCEDURE sp_AuthenticateUser
        @username NVARCHAR(200),
        @password NVARCHAR(200)
    AS
    BEGIN
        DECLARE @userId INT;

        -- Check if the user exists
        SELECT @userId = id
        FROM users
        WHERE username = @username;

        -- If the user exists, check the password
        IF @userId IS NOT NULL
        BEGIN
            SELECT @userId = id
            FROM users
            WHERE username = @username AND password = @password;

            -- If the password is correct, return user data; otherwise, return 0
            IF @userId IS NOT NULL
            BEGIN
                SELECT id, username, active, lecturerId
                FROM users
                WHERE id = @userId;
            END
            ELSE
            BEGIN
                SELECT 0 AS 'AuthenticationResult';
            END
        END
        ELSE
        BEGIN
            -- If the username is incorrect, return null
            SELECT NULL AS 'AuthenticationResult';
        END
    END;

`;

const getUserInformationQuery = `

    CREATE PROCEDURE sp_GetUserInformation
        @userId INT
    AS
    BEGIN
        SELECT
            U.username,
            L.name AS lecturer_name,
            L.englishName AS lecturer_english_name,
            L.designation AS lecturer_designation,
            C.name AS course_name,
            C.id AS course_id,
            C.englishName AS course_english_name,
            C.credit AS course_credit,
            CA.year,
            CA.session,
            CA.faculty,
            CA.department,
            CA.semester,
            CA.section
        FROM
            Users U
        JOIN
            Lecturers L ON U.lecturerId = L.id
        LEFT JOIN
            course_arrangements CA ON L.id = CA.lecturerId
        LEFT JOIN
            Courses C ON CA.courseId = C.id
        WHERE
            U.id = @userId;
    END;

`;

const getStudentsForCourseQuery = `
    CREATE PROCEDURE sp_GetStudentsForCourse
        @CourseId INT
    AS
    BEGIN
        SELECT
            S.name AS studentName,
            S.fatherName AS fatherName,
            S.year,
            S.season,
            S.faculty,
            S.department,
            S.semester,
            S.section,
            S.picture,
            S.bioSample,
            SCR.hourNo,
            SCR.attendanceFlag,
            SCR.dateTime
        FROM
            student_course_registrations SCR
        INNER JOIN
            Students S ON SCR.studentId = S.id
        WHERE
            SCR.courseId = @CourseId;
    END;
`;

  let result = {};

  result.createUser = await createProcedureIfNotExists('sp_CreateUser', createProcedureQuery);
  result.getUser = await createProcedureIfNotExists('sp_GetUser', getUserProcedureQuery);
  result.updateUser = await createProcedureIfNotExists('sp_UpdateUser', updateProcedureQuery);
  result.deleteUser = await createProcedureIfNotExists('sp_DeleteUser', deleteProcedureQuery);
  result.authenticateUser = await createProcedureIfNotExists('sp_AuthenticateUser', authenticateUserQuery);
  result.getUserInformationQuery = await createProcedureIfNotExists('sp_GetUserInformation', getUserInformationQuery);
  result.getStudentsForCourseQuery = await createProcedureIfNotExists('sp_GetStudentsForCourse', getStudentsForCourseQuery);

  return result;

}


module.exports = callProcedures;