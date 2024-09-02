CREATE TABLE division (
    divisionID VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50),
    EnabledToBeBorrowed BOOLEAN
);

CREATE TABLE players (
    playerID CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    fullName VARCHAR(100) NOT NULL,
    teamID VARCHAR(50) NOT NULL,
    FOREIGN KEY (teamID) REFERENCES teams(teamID) ON DELETE CASCADE
);


CREATE TABLE teams (
    teamID CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teamName VARCHAR(100) NOT NULL,
    divisionID VARCHAR(50) NOT NULL,
    FOREIGN KEY (divisionID) REFERENCES division(divisionID) ON DELETE CASCADE,
    CONSTRAINT team_division UNIQUE (teamID)  -- Optional constraint if you need uniqueness on teamID.
);


CREATE TABLE borrowDivisions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    divisionID VARCHAR(50) NOT NULL,
    borrowedDivisions VARCHAR(50) NOT NULL,
    FOREIGN KEY (divisionID) REFERENCES division(divisionID),
    FOREIGN KEY (borrowedDivisions) REFERENCES division(divisionID)
);


CREATE TABLE finalesEligibility (
    ID CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    divisionID VARCHAR(10) NOT NULL,
    eligible BOOLEAN NOT NULL,
    noOfMatchPlayed INT NOT NULL,
    allRound VARCHAR(10) NOT NULL,
   FOREIGN KEY (divisionID) REFERENCES division(divisionID) ON DELETE CASCADE
);