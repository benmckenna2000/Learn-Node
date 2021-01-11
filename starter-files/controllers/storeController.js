const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuidv4 = require("uuid/v4");

const multerOptions = {
  storage: multer.memoryStorage(), //store in memory
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true); //callback
    } else {
      next({ message: "That filetype is not accepted." }, false);
    }
  },
};

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add store" });
};

exports.upload = multer(multerOptions).single("photo"); //looking for single photo input

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next(); //if no new file to resize, skip to next middleware which is createStore
    return;
  }
  const extension = req.file.mimetype.split("/")[1]; //get extension from mimetype
  req.body.photo = `${uuidv4()}.${extension}`;
  //now resize
  //read from buffer bc img stored in memory prior to resizing
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  //.save(); //fires off connection to mongoDB database and eii//ther returns store info or error message
  req.flash(
    "success",
    `Successfully created ${store.name}. Want to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error("You must own a store to edit it!");
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  confirmOwner(store, req.user);
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash(
    "success",
    `Successfully updated ${store.name} <a href="/stores/${store.slug}">View Store</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await (await Store.findOne({ slug: req.params.slug })).populate(
    "author"
  );
  if (!store) return next();
  res.render("store", { store, title: store.name });
};

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storePromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storePromise]);
  res.render("tags", { tags, title: "Tags", tag, stores });
};
