const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require("sequelize");
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const app = express();
const SequelizeStore = require("connect-session-sequelize")(session.Store);


const sequelize_session = new Sequelize('node_db', 'root', 'helloat0015', {
  dialect: 'mysql',
  storage: "./session.mysql",
});

const csrfProtection = csrf();
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
const myStore = new SequelizeStore({
  db: sequelize_session,
});
app.use(session({secret: 'my secret', store: myStore, resave: false , saveUninitialized: false}));
myStore.sync();
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.session.user);
  if (!req.session.user) {
    console.log('---------------------------------No session--------------------------------------------------------');
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      console.log('-----------------------------------------------user is set-------------------------------------------------');
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
   //.sync({ force: true })
  .sync()
  .then(cart => {
    app.listen(3302);
  })
  .catch(err => {
    console.log(err);
  });
