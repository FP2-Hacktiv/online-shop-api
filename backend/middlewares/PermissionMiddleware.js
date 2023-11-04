import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const PermissionMiddleware = asyncHandler(async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	
	if (!token) {
		res.status(401);
		throw new Error('Unauthenticated');
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

		req.user = await User.findById(decoded.id);

    if (req.user.isAdmin !== true) {
      res.status(401);
      throw new Error('Not authorize to access this route');
    }

		next();
	} catch (error) {
		res.status(401);
		throw new Error(error.message);
	}
});

export default PermissionMiddleware;
