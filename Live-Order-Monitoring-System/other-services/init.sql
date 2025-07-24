CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (
        role IN ('customer', 'staff', 'admin')
    ),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sample Users
INSERT INTO
    users (
        email,
        password,
        name,
        role,
        created_at
    )
VALUES (
        'admin@example.com',
        'password123',
        'Admin User',
        'admin',
        NOW()
    ),
    (
        'staff@example.com',
        'password123',
        'Staff User',
        'staff',
        NOW()
    ),
    (
        'customer@example.com',
        'password123',
        'Customer User',
        'customer',
        NOW()
    );

-- Sample Products
INSERT INTO
    products (
        name,
        description,
        price,
        stock,
        created_at,
        updated_at
    )
VALUES (
        'Coffee',
        'Freshly brewed coffee',
        50.00,
        100,
        NOW(),
        NOW()
    ),
    (
        'Sandwich',
        'Ham & cheese sandwich',
        80.00,
        50,
        NOW(),
        NOW()
    ),
    (
        'Cake',
        'Chocolate cake slice',
        60.00,
        30,
        NOW(),
        NOW()
    );

-- Sample Orders
INSERT INTO
    orders (
        customer_id,
        total_amount,
        status,
        created_at,
        updated_at
    )
VALUES (
        3,
        110.00,
        'pending',
        NOW(),
        NOW()
    ), -- customer@example.com

-- Sample Order Items
INSERT INTO
    order_items (
        order_id,
        product_id,
        quantity,
        price,
        created_at,
        updated_at
    )
VALUES (1, 1, 1, 50.00, NOW(), NOW()), -- Coffee
    (1, 2, 1, 60.00, NOW(), NOW());
-- Cake