CREATE TABLE User (
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(10),
  address VARCHAR(255) DEFAULT NULL,
  is_admin tinyint(1) DEFAULT 0,
  is_staff tinyint(1) DEFAULT 0
);

CREATE TABLE Category (
  category_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hidden tinyint(1) DEFAULT 0
);

CREATE TABLE Cart (
  cart_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255),
  FOREIGN KEY (user_email) REFERENCES User(email) ON UPDATE CASCADE
);

CREATE TABLE Product (
  product_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  category_id INT(11),
  quantity_available INT(11) DEFAULT 0,
  hidden tinyint(1) DEFAULT 0,
  image_url varchar(255),
  file_key varchar(255),
  FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE SET NULL
);

CREATE TABLE CartItem (
  cartitem_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  cart_id INT(11) NOT NULL,
  product_id INT(11) NOT NULL,
  quantity INT(11) NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE `Order` (
  order_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255),
  order_date_time DATETIME DEFAULT NOW(),
  total_amount DECIMAL(10, 2),
  status INT(1) DEFAULT 0,
  address VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_email) REFERENCES User(email) ON UPDATE CASCADE
);

CREATE TABLE OrderItem (
  orderitem_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  order_id INT(11) NOT NULL,
  product_id INT(11) NOT NULL,
  quantity INT(11) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES `Order`(order_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE Payment (
  payment_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  order_id INT(11),
  payment_method VARCHAR(50),
  amount DECIMAL(10, 2),
  payment_date_time DATETIME DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
);

CREATE TABLE DeliverableZipCode (
  zipcode INT(6) PRIMARY KEY
);

CREATE TABLE AdditionalCharges (
  name VARCHAR(50) PRIMARY KEY,
  rate INT(5)
);

INSERT INTO AdditionalCharges (name, rate) VALUES ('Taxes', 18), ('Delivery', 150);