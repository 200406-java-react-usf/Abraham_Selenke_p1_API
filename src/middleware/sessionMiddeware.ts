import session from 'express-session';

const sessionConfig = {
    secret: 'project1',
    cookie: {
        secure: false
    },
    resave: false,
    saveUninitialized: false
}

export const sessionMiddleware = session(sessionConfig);