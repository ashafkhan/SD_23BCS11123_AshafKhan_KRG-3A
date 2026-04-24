const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, resp) => {
	try {
		const allListings = await Listing.find({});
		console.log(`Found ${allListings.length} listings`);
		resp.json({listings: allListings});
	} catch (error) {
		console.error("Error fetching listings:", error);
		resp.status(500).json({error: "Failed to fetch listings", details: error.message});
	}
};

module.exports.renderSearchResult = async (req, resp) => {
	try {
		let country = req.query.country;
		let allListings = await Listing.find({country: country});
		console.log(`Found ${allListings.length} listings for country: ${country}`);
		resp.json({listings: allListings, country});
	} catch (error) {
		console.error("Error searching listings:", error);
		resp.status(500).json({error: "Failed to search listings", details: error.message});
	}
}

module.exports.renderNewForm = (req, resp) => {
	resp.json({message: "New listing form"});
};

module.exports.createListing = async (req, resp, next) => {
	let response = await geocodingClient.forwardGeocode({
		query: req.body.listing.location,
		limit: 1
	})
	.send();
	let url = req.file.path;
	let filename = req.file.filename;
	let category = req.body.listing.category;
	let newListing = new Listing(req.body.listing);
	newListing.image = {url, filename};
	newListing.owner = req.user._id;
	newListing.geometry = response.body.features[0].geometry;
	newListing.category = category;
	let savedListing = await newListing.save();
	console.log(savedListing);
	resp.json({message: "New Listing Created", listing: savedListing});
};

module.exports.showListing = async (req, resp) => {
	try {
		let {id} = req.params;
		let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",}}).populate("owner");
		if(!listing){
			return resp.status(404).json({error: "Listing You requested for does not exist!"});
		}
		console.log(`Found listing: ${listing.title}`);
		resp.json({listing});
	} catch (error) {
		console.error("Error fetching listing:", error);
		resp.status(500).json({error: "Failed to fetch listing", details: error.message});
	}
};

module.exports.renderEditForm = async (req, resp) => {
	let {id} = req.params;
	let listing = await Listing.findById(id);
	if(!listing){
		return resp.status(404).json({error: "Listing You requested for does not exist!"});
	}
	let originalUrl = listing.image.url;
	originalUrl = originalUrl.replace("/upload", "/upload/e_blur:300");
	resp.json({listing, originalUrl});
};

module.exports.updateListing = async (req, resp) => {
	try {
		let {id} = req.params;
		if(typeof req.file !== "undefined"){
			let url = req.file.path;
			let filename = req.file.filename;
			req.body.listing.image = {url, filename};
		}
		let category = req.body.listing.category;
		let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing, category: category}, {new: true});
		console.log(`Listing updated: ${updatedListing.title}`);
		resp.json({message: "Listing Updated Successfully", listing: updatedListing});
	} catch (error) {
		console.error("Error updating listing:", error);
		resp.status(500).json({error: "Failed to update listing", details: error.message});
	}
};

module.exports.destroyListing = async (req, resp) => {
	let {id} = req.params;
	await Listing.findByIdAndDelete(id);
	resp.json({message: "Listing Deleted Successfully"});
};

module.exports.renderFilteredCategory = async (req, resp) => {
	try {
		let category = req.params.category;
		const allListings = await Listing.find({category: category});
		console.log(`Found ${allListings.length} listings for category: ${category}`);
		resp.json({listings: allListings, category});
	} catch (error) {
		console.error("Error fetching category listings:", error);
		resp.status(500).json({error: "Failed to fetch category listings", details: error.message});
	}
};