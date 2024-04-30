CREATE TABLE IF NOT EXISTS quiz (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    data JSON NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS student (
    id INTEGER NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    statistics JSON NOT NULL, -- map[case]{correct, total}
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL,
    CONSTRAINT student_uc_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS quiz_session (
    id INTEGER NOT NULL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    data JSON NOT NULL,
    created DATETIME NOT NULL,
    updated DATETIME NOT NULL,
    
    FOREIGN KEY (student_id)
        REFERENCES student(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (quiz_id)
        REFERENCES quiz(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- From: https://github.com/alexedwards/scs/tree/master/sqlite3store
CREATE TABLE sessions (
	token TEXT PRIMARY KEY,
	data BLOB NOT NULL,
	expiry REAL NOT NULL
);

CREATE INDEX sessions_expiry_idx ON sessions(expiry);
