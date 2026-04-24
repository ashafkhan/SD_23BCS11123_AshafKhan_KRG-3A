const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const port = 8080;
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError");
const Listing = require("./models/listing");
const cors = require("cors");

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
	mongoUrl: dbUrl,
	crypto: {
		secret: process.env.SECRET,
	},
	touchAfter: 24 * 3600,
})

store.on("error", (err) => {
	console.log("Error in MONGO Session Store", err);
})

const sessionOptions = {
	store,
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		secure: process.env.NODE_ENV === 'production'
	}
};

async function main(){
	try {
		await mongoose.connect(dbUrl);
		console.log("MongoDB Connection successful");
	} catch (err) {
		console.log("MongoDB Connection Error:", err.message);
		console.log("Note: Make sure your IP is whitelisted in MongoDB Atlas");
		// Retry connection after 5 seconds
		setTimeout(() => {
			console.log("Retrying MongoDB connection...");
			main();
		}, 5000);
	}
};

main();


// app.get("/", (req, resp) => {
// 	resp.send("working!!");
// })

app.listen(port, () => {
	console.log("Server is listening to port ", port);
})

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, resp, next) => {
	resp.locals.success = req.flash("success");
	resp.locals.error = req.flash("error");
	resp.locals.currUser = req.user;
	next();
})

// API Routes
app.use("/api/listings", listingRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api", userRouter);

// Auth routes
app.get("/api/auth/current", (req, resp) => {
	if (req.user) {
		resp.json({ user: req.user });
	} else {
		resp.json({ user: null });
	}
});

app.get("/api/auth/map-token", (req, resp) => {
	resp.json({ token: process.env.MAP_TOKEN });
});

// Endpoint to check if route requires auth and get redirect info
app.get("/api/auth/check-route", (req, resp) => {
	const protectedRoutes = ['/listings/new', '/listings/:id/edit'];
	const requestedPath = req.query.path;
	
	if (!req.isAuthenticated() && protectedRoutes.some(route => {
		const routePattern = route.replace(':id', '[^/]+');
		const regex = new RegExp(`^${routePattern}$`);
		return regex.test(requestedPath) || requestedPath === route;
	})) {
		// Save redirect URL in session
		req.session.redirectUrl = requestedPath;
		resp.json({ 
			requiresAuth: true, 
			redirectUrl: requestedPath,
			message: "You need to be logged in first!"
		});
	} else {
		resp.json({ requiresAuth: false });
	}
});

// Test endpoint to check database connection
app.get("/api/test", async (req, resp) => {
	try {
		const Listing = require("./models/listing");
		const count = await Listing.countDocuments();
		resp.json({ 
			status: "OK", 
			database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
			listingsCount: count,
			message: "Backend is working correctly"
		});
	} catch (error) {
		resp.status(500).json({ 
			status: "Error", 
			database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
			error: error.message 
		});
	}
});

// Catch-all for undefined API routes (must come before non-API catch-all)
app.all("/api/*", (req, resp, next) => {
	next(new ExpressError(404, "API endpoint not found"));
})

// Serve React app for all non-API routes
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, "client/dist")));
	app.get("*", (req, resp) => {
		resp.sendFile(path.join(__dirname, "client/dist/index.html"));
	});
} else {
	// In development, let Vite handle the frontend
	app.get("*", (req, resp, next) => {
		if (!req.path.startsWith("/api")) {
			return resp.status(404).json({ error: "Frontend not served in development. Run 'npm run dev' in client directory." });
		}
		next();
	});
}

//Error Handling Middleware
app.use((err, req, resp, next) => {
	// Check if response was already sent
	if (resp.headersSent) {
		return next(err);
	}
	
	let {status=500, message="Something Went Wrong"} = err;
	
	// Handle ExpressError objects
	if (err instanceof ExpressError) {
		status = err.status;
		message = err.message;
	}
	
	// Handle validation errors
	if (err.name === 'ValidationError') {
		status = 400;
		message = err.message;
	}
	
	// Handle MongoDB errors
	if (err.name === 'MongoServerError' || err.name === 'MongooseServerSelectionError') {
		status = 500;
		message = "Database connection error. Please check your MongoDB connection.";
	}
	
	resp.status(status).json({ error: message });
})
