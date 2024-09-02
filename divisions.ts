import mysql from 'mysql2/promise';


interface updateDivisionReq {
  maindivision: string[];
  borrowdivisions: string[] | boolean;
}

interface UpdateFinalesEligibilityReq {
  enableFinal: boolean;
  divisions: string[];
  minRoundOfMatch: number;
  EligibleRound: string[];
}


const connectionConfig = {
  host: 'localhost',
  user: 'root',
  database: 'sampleyMySQLDB',
  password: 'root'
} 


async function enabledBorrowDivision(reqBody: updateDivisionReq): Promise<void> {
  const connection = await mysql.createConnection(connectionConfig);
  const { maindivision } = reqBody;

  try {
    await connection.beginTransaction();
    if (maindivision.length > 0) {
      const placeholders = maindivision.map(() => '?').join(',');
      const sql = `UPDATE division SET EnabledToBeBorrowed = false WHERE divisionID IN (${placeholders})`;
      await connection.execute(sql, maindivision);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}



async function updateDivisions(reqBody: updateDivisionReq[]) {
  const connection = await mysql.createConnection(connectionConfig);

  try {
    // Begin transaction
    await connection.beginTransaction();

    for (const group of reqBody) {
      const { maindivision, borrowdivisions } = group;
        // Handle insertion of borrowDivisions for each main divisionID
      if (Array.isArray(borrowdivisions)) {
        if (maindivision.length > 0 && borrowdivisions.length > 0) {
          const placeholders = borrowdivisions.map(() => '(?, ?)').join(',');
          const sql = `INSERT INTO borrowDivisions (DivisionID, BorrowedDivisions) VALUES ${placeholders}`;

          const values: any[] = [];
          for (const mainId of maindivision) {
            for (const borrowId of borrowdivisions) {
              values.push(mainId, borrowId);
            }
          }

          // Execute the query with parameterized inputs
          await connection.execute(sql, values);
        }
      } else if (borrowdivisions === false) {
        // Handle updating EnabledToBeBorrowed to false
        if (maindivision.length > 0) {
          const placeholders = maindivision.map(() => '?').join(',');
          const sql = `UPDATE division SET EnabledToBeBorrowed = false WHERE divisionID IN (${placeholders})`;

          // Execute the query with parameterized inputs
          await connection.execute(sql, maindivision);
        }
      } else if (borrowdivisions === true) {
        // Handle updating EnabledToBeBorrowed to true
        if (maindivision.length > 0) {
          const placeholders = maindivision.map(() => '?').join(',');
          const sql = `UPDATE division SET EnabledToBeBorrowed = true WHERE divisionID IN (${placeholders})`;
          await connection.execute(sql, maindivision);
        }
      }
    }
    // Commit transaction
    await connection.commit();
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Error updating divisions:', error);
    throw error;
  } finally {
    // Close the connection
    await connection.end();
  }
}



async function updateFinalesEligibility(reqBody: UpdateFinalesEligibilityReq[]) {
  const connection = await mysql.createConnection(connectionConfig);

  try {
    await connection.beginTransaction();
    for (const group of reqBody) {
      const { enableFinal, divisions, minRoundOfMatch, EligibleRound } = group;

      if (enableFinal) {
        if (divisions.length > 0 && EligibleRound.length > 0) {
          const placeholders = divisions
            .map(() => `(${EligibleRound.map(() => '(?, ?, ?, ?)').join(',')})`)
            .join(',');
          
          const sql = `INSERT INTO finalesEligibility (divisionID, eligible, noOfMatchPlayed, allRound) VALUES ${placeholders}`;
          const values: any[] = [];
          for (const divisionID of divisions) {
            for (const round of EligibleRound) {
              values.push(divisionID, true, minRoundOfMatch, round);
            }
          }
          await connection.execute(sql, values);
        }
      } 
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
