USE food_macro_db;

-- default login for marking
INSERT IGNORE INTO users (username, password) VALUES ('gold', 'smiths');

-- sample foods
INSERT INTO foods (name, calories, protein, carbs, fats) VALUES
  ('Chicken Breast (100g)', 165, 31, 0, 3.6),
  ('Brown Rice (100g cooked)', 111, 2.6, 23, 0.9),
  ('Banana (100g)', 89, 1.1, 23, 0.3),
  ('Almonds (30g)', 174, 6, 6.1, 15.2);
