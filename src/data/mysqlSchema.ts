export const MYSQL_SCHEMA_DDL = `-- ====================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU THƯƠNG MẠI ĐIỆN TỬ GEARTECH
-- PHÂN HỆ: LINH KIỆN MÁY TÍNH, PC GAMING & PHỤ KIỆN
-- CÔNG NGHỆ: MySQL 8.0+ (InnoDB, utf8mb4_unicode_ci)
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP SCHEMA IF EXISTS \`geartech_db\`;
CREATE SCHEMA \`geartech_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`geartech_db\`;

-- --------------------------------------------------------------------
-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (users)
-- --------------------------------------------------------------------
CREATE TABLE \`users\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`full_name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('ADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER',
  \`address\` VARCHAR(255) NULL,
  \`loyalty_points\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`status\` ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_users_phone\` (\`phone\`),
  INDEX \`idx_users_role\` (\`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng và tài khoản quản trị';

-- --------------------------------------------------------------------
-- 2. BẢNG DANH MỤC SẢN PHẨM PHÂN CẤP (categories - Adjacency List)
-- --------------------------------------------------------------------
CREATE TABLE \`categories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL UNIQUE,
  \`parent_id\` INT UNSIGNED NULL,
  \`icon\` VARCHAR(100) NULL,
  \`display_order\` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  \`status\` ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_categories_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX \`idx_categories_parent\` (\`parent_id\`),
  INDEX \`idx_categories_slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục linh kiện và thiết bị phân cấp cha - con';

-- --------------------------------------------------------------------
-- 3. BẢNG THƯƠNG HIỆU ĐỐI TÁC (brands)
-- --------------------------------------------------------------------
CREATE TABLE \`brands\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL UNIQUE,
  \`slug\` VARCHAR(120) NOT NULL UNIQUE,
  \`logo_url\` VARCHAR(255) NULL,
  \`website\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hãng sản xuất (ASUS, MSI, Intel, AMD, Corsair...)';

-- --------------------------------------------------------------------
-- 4. BẢNG SẢN PHẨM (products)
-- --------------------------------------------------------------------
CREATE TABLE \`products\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(280) NOT NULL UNIQUE,
  \`sku\` VARCHAR(50) NOT NULL UNIQUE,
  \`price_original\` DECIMAL(15,2) NOT NULL,
  \`price_sale\` DECIMAL(15,2) NOT NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`min_stock_threshold\` INT NOT NULL DEFAULT 5,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`brand_id\` INT UNSIGNED NULL,
  \`warranty_months\` SMALLINT UNSIGNED NOT NULL DEFAULT 24,
  \`thumbnail_url\` VARCHAR(500) NOT NULL,
  \`pinned_section\` VARCHAR(50) NULL COMMENT 'Ghim vào block trang chủ (FLASH_SALE, PC_HOT, HIGH_END, v.v.)',
  \`description\` MEDIUMTEXT NULL,
  \`rating_avg\` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  \`review_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`sold_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_flash_sale\` TINYINT(1) NOT NULL DEFAULT 0,
  \`flash_sale_end\` DATETIME NULL,
  \`status\` ENUM('ACTIVE', 'HIDDEN', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_products_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT \`fk_products_brand\` FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX \`idx_products_cat_brand\` (\`category_id\`, \`brand_id\`),
  INDEX \`idx_products_price\` (\`price_sale\`),
  INDEX \`idx_products_stock\` (\`stock\`),
  INDEX \`idx_products_rating\` (\`rating_avg\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng sản phẩm chính';

-- --------------------------------------------------------------------
-- 5. BẢNG ẢNH PHỤ SẢN PHẨM (product_images)
-- --------------------------------------------------------------------
CREATE TABLE \`product_images\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` BIGINT UNSIGNED NOT NULL,
  \`image_url\` VARCHAR(500) NOT NULL,
  \`display_order\` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  \`is_primary\` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT \`fk_product_images_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX \`idx_product_images_product\` (\`product_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. BẢNG THÔNG SỐ KỸ THUẬT SẢN PHẨM (product_specifications)
-- --------------------------------------------------------------------
CREATE TABLE \`product_specifications\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` BIGINT UNSIGNED NOT NULL,
  \`spec_group\` VARCHAR(100) NOT NULL COMMENT 'Nhóm thông số (VD: Thông tin chung, Hiệu năng, Kết nối)',
  \`spec_name\` VARCHAR(100) NOT NULL COMMENT 'Tên thông số (VD: Xung nhịp, Socket, Dung lượng)',
  \`spec_value\` VARCHAR(255) NOT NULL,
  CONSTRAINT \`fk_product_specs_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX \`idx_product_specs_product\` (\`product_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. BẢNG MÃ GIẢM GIÁ / VOUCHER (vouchers)
-- --------------------------------------------------------------------
CREATE TABLE \`vouchers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(50) NOT NULL UNIQUE,
  \`description\` VARCHAR(255) NOT NULL,
  \`discount_type\` ENUM('PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING') NOT NULL,
  \`discount_mode\` ENUM('ORDER', 'PRODUCT') NOT NULL DEFAULT 'ORDER',
  \`value\` DECIMAL(15,2) NOT NULL,
  \`max_discount\` DECIMAL(15,2) NULL,
  \`min_order\` DECIMAL(15,2) NOT NULL DEFAULT 0,
  \`usage_limit\` INT UNSIGNED NOT NULL DEFAULT 1000,
  \`used_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`start_date\` DATETIME NOT NULL,
  \`end_date\` DATETIME NOT NULL,
  \`status\` ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_vouchers_code\` (\`code\`),
  INDEX \`idx_vouchers_status_dates\` (\`status\`, \`start_date\`, \`end_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. BẢNG ĐƠN HÀNG (orders)
-- --------------------------------------------------------------------
CREATE TABLE \`orders\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`order_code\` VARCHAR(32) NOT NULL UNIQUE,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`order_date\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`receiver_name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL,
  \`province\` VARCHAR(100) NOT NULL,
  \`district\` VARCHAR(100) NOT NULL,
  \`ward\` VARCHAR(100) NOT NULL,
  \`address_detail\` VARCHAR(255) NOT NULL,
  \`note\` TEXT NULL,
  \`payment_method\` ENUM('COD', 'VNPAY_QR') NOT NULL DEFAULT 'COD',
  \`payment_status\` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  \`voucher_code\` VARCHAR(50) NULL,
  \`discount_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`shipping_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`total_amount\` DECIMAL(15,2) NOT NULL,
  \`status\` ENUM('PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_orders_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_orders_user\` (\`user_id\`),
  INDEX \`idx_orders_status\` (\`status\`),
  INDEX \`idx_orders_phone\` (\`phone\`),
  INDEX \`idx_orders_code\` (\`order_code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. BẢNG CHI TIẾT ĐƠN HÀNG & BẢO HÀNH (order_items)
-- --------------------------------------------------------------------
CREATE TABLE \`order_items\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` BIGINT UNSIGNED NOT NULL,
  \`product_id\` BIGINT UNSIGNED NOT NULL,
  \`product_name\` VARCHAR(255) NOT NULL,
  \`product_thumbnail\` VARCHAR(500) NOT NULL,
  \`quantity\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`unit_price\` DECIMAL(15,2) NOT NULL,
  \`total_price\` DECIMAL(15,2) NOT NULL,
  \`warranty_months\` SMALLINT UNSIGNED NOT NULL DEFAULT 24,
  \`warranty_end_date\` DATE NOT NULL,
  CONSTRAINT \`fk_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_order_items_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_order_items_order\` (\`order_id\`),
  INDEX \`idx_order_items_product\` (\`product_id\`),
  INDEX \`idx_order_items_warranty\` (\`warranty_end_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết các mặt hàng và lưu vết bảo hành từng linh kiện';

-- --------------------------------------------------------------------
-- 10. BẢNG ĐÁNH GIÁ SẢN PHẨM & PHẢN HỒI SHOP (reviews)
-- --------------------------------------------------------------------
CREATE TABLE \`reviews\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` BIGINT UNSIGNED NOT NULL,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`rating\` TINYINT UNSIGNED NOT NULL CHECK (\`rating\` BETWEEN 1 AND 5),
  \`comment\` TEXT NOT NULL,
  \`image_url\` VARCHAR(500) NULL,
  \`seller_reply\` TEXT NULL COMMENT 'Phản hồi chính thức từ cửa hàng GearTech',
  \`seller_reply_at\` DATETIME NULL,
  \`status\` ENUM('APPROVED', 'PENDING', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_reviews_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_reviews_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX \`idx_reviews_product_rating\` (\`product_id\`, \`rating\`),
  INDEX \`idx_reviews_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 11. BẢNG CẤU HÌNH SECTION TRANG CHỦ (homepage_sections)
-- --------------------------------------------------------------------
CREATE TABLE \`homepage_sections\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(100) NOT NULL,
  \`section_key\` VARCHAR(50) NOT NULL UNIQUE,
  \`section_type\` ENUM('FLASH_SALE', 'GRID_PRODUCTS', 'BANNER_CAROUSEL', 'BRAND_LIST') NOT NULL,
  \`display_order\` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`filter_tag\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 12. BẢNG QUẢN LÝ KHO & NHẬP XUẤT (inventory_transactions)
-- --------------------------------------------------------------------
CREATE TABLE \`inventory_transactions\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` BIGINT UNSIGNED NOT NULL,
  \`transaction_type\` ENUM('IMPORT', 'EXPORT', 'ADJUSTMENT') NOT NULL,
  \`batch_number\` VARCHAR(50) NOT NULL,
  \`quantity\` INT NOT NULL,
  \`unit_cost\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`supplier_name\` VARCHAR(150) NULL,
  \`note\` VARCHAR(255) NULL,
  \`created_by_user_id\` BIGINT UNSIGNED NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_inventory_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_inventory_user\` FOREIGN KEY (\`created_by_user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX \`idx_inventory_product\` (\`product_id\`),
  INDEX \`idx_inventory_type_date\` (\`transaction_type\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý xuất nhập kho theo lô và lịch sử';

-- --------------------------------------------------------------------
-- 13. TRIGGER TỰ ĐỘNG TÍNH TOÁN HẠN BẢO HÀNH KHI TẠO ORDER ITEM
-- --------------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER \`trg_calc_warranty_end\`
BEFORE INSERT ON \`order_items\`
FOR EACH ROW
BEGIN
  IF NEW.warranty_end_date IS NULL OR NEW.warranty_end_date = '0000-00-00' THEN
    SET NEW.warranty_end_date = DATE_ADD(CURRENT_DATE(), INTERVAL NEW.warranty_months MONTH);
  END IF;
END$$

-- TRIGGER CẬP NHẬT ĐIỂM ĐÁNH GIÁ TRUNG BÌNH SAU KHI ĐÁNH GIÁ ĐƯỢC DUYỆT
CREATE TRIGGER \`trg_update_product_rating\`
AFTER INSERT ON \`reviews\`
FOR EACH ROW
BEGIN
  IF NEW.status = 'APPROVED' THEN
    UPDATE \`products\`
    SET \`rating_avg\` = (SELECT ROUND(AVG(rating), 2) FROM \`reviews\` WHERE product_id = NEW.product_id AND status = 'APPROVED'),
        \`review_count\` = (SELECT COUNT(*) FROM \`reviews\` WHERE product_id = NEW.product_id AND status = 'APPROVED')
    WHERE id = NEW.product_id;
  END IF;
END$$

-- TRIGGER TỰ ĐỘNG CẬP NHẬT TỒN KHO KHI CÓ PHIẾU NHẬP/XUẤT KHO
CREATE TRIGGER \`trg_inventory_update_stock\`
AFTER INSERT ON \`inventory_transactions\`
FOR EACH ROW
BEGIN
  IF NEW.transaction_type = 'IMPORT' THEN
    UPDATE \`products\` SET \`stock\` = \`stock\` + NEW.quantity WHERE id = NEW.product_id;
  ELSEIF NEW.transaction_type = 'EXPORT' THEN
    UPDATE \`products\` SET \`stock\` = GREATEST(0, \`stock\` - NEW.quantity) WHERE id = NEW.product_id;
  END IF;
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
`;

export const SCHEMA_EXPLANATION = [
  {
    table: 'users',
    purpose: 'Lưu trữ tài khoản khách hàng, nhân viên và quản trị viên',
    keyFeatures: 'Phân quyền ENUM(ADMIN, STAFF, USER), tích điểm thành viên, đánh chỉ mục theo Phone và Role để tra cứu nhanh.'
  },
  {
    table: 'categories',
    purpose: 'Cây danh mục sản phẩm đa cấp (Adjacency List Pattern)',
    keyFeatures: 'Hỗ trợ cấu trúc Cha - Con vô hạn cấp (CPU, VGA, Mainboard...), khóa ngoại tự tham chiếu parent_id.'
  },
  {
    table: 'products',
    purpose: 'Bảng sản phẩm trung tâm quản lý linh kiện, máy tính và phụ kiện',
    keyFeatures: 'Quản lý giá gốc, giá sale, tồn kho, ngưỡng cảnh báo, ghim section trang chủ, rating trung bình và thời gian bảo hành.'
  },
  {
    table: 'product_specifications',
    purpose: 'Chi tiết thông số kỹ thuật chuẩn hóa theo từng nhóm',
    keyFeatures: 'Tách bảng 1-N giúp dễ dàng filter theo CPU Socket, RAM Bus, Chuẩn kích thước Mainboard, Công suất TDP.'
  },
  {
    table: 'orders & order_items',
    purpose: 'Quản lý đơn đặt hàng và lưu vết bảo hành từng linh kiện',
    keyFeatures: 'Lưu đầy đủ snapshot giá tại thời điểm mua, địa chỉ 3 cấp (Tỉnh-Huyện-Xã), trạng thái đơn, và trigger tự động sinh ngày hết hạn bảo hành.'
  },
  {
    table: 'reviews',
    purpose: 'Đánh giá sản phẩm, xếp hạng sao, upload ảnh và phản hồi từ shop',
    keyFeatures: 'Cột seller_reply và seller_reply_at cho phép quản trị viên phản hồi chính thức cho khách hàng, trigger tự động tính điểm rating.'
  },
  {
    table: 'vouchers',
    purpose: 'Hệ thống mã khuyến mãi linh hoạt',
    keyFeatures: 'Hỗ trợ giảm theo %, giảm tiền mặt cố định, miễn phí vận chuyển kèm điều kiện đơn hàng tối thiểu và giới hạn số lượt.'
  },
  {
    table: 'inventory_transactions',
    purpose: 'Quản lý nhập xuất kho theo lô và cảnh báo tồn kho',
    keyFeatures: 'Theo dõi giá vốn nhập, nhà cung cấp, số lô, trigger tự động tăng/giảm tồn kho thực tế của bảng products.'
  },
  {
    table: 'homepage_sections',
    purpose: 'Cấu hình các khối hiển thị trang chủ động',
    keyFeatures: 'Admin có thể bật/tắt, sắp xếp thứ tự và thay đổi tiêu đề block Flash Sale, PC Bán Chạy, High-End PC ngay trên giao diện.'
  }
];
