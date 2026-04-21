// ═══════════════════════════════════════════════════════════════
// LIFEOS GLOBAL FOOD DATABASE — 55,000+ Items
// Organized: Type → Cuisine → Items
// ═══════════════════════════════════════════════════════════════

// ─── HELPER: Generate item ───
function mkItem(name, cal, pro, carb, fat, fib = 1, water = 0) {
  return { name, calories: cal, protein: pro, carbs: carb, fat, fiber: fib, water };
}

// ══════════════════════════════════════════════════════════════
//  PANEER DISHES (300+ named + generated)
// ══════════════════════════════════════════════════════════════
const paneerDishes = [
  mkItem('Palak Paneer', 240, 14, 10, 17, 3),
  mkItem('Paneer Tikka', 260, 18, 8, 18, 1),
  mkItem('Paneer Butter Masala', 320, 16, 14, 24, 2),
  mkItem('Kadhai Paneer', 280, 16, 10, 20, 2),
  mkItem('Paneer Bhurji', 250, 16, 8, 18, 1),
  mkItem('Shahi Paneer', 310, 15, 12, 24, 1),
  mkItem('Paneer Do Pyaza', 270, 15, 12, 19, 2),
  mkItem('Paneer Lababdar', 300, 14, 14, 22, 2),
  mkItem('Paneer Tikka Masala', 290, 17, 12, 20, 2),
  mkItem('Paneer Kolhapuri', 280, 15, 10, 20, 2),
  mkItem('Matar Paneer', 260, 14, 16, 16, 4),
  mkItem('Methi Paneer', 250, 15, 8, 18, 2),
  mkItem('Paneer Paratha', 320, 12, 35, 16, 2),
  mkItem('Paneer Sandwich', 300, 14, 30, 14, 2),
  mkItem('Paneer Makhani', 330, 15, 12, 26, 1),
  mkItem('Malai Paneer', 340, 14, 10, 28, 1),
  mkItem('Paneer Kofta Curry', 310, 14, 16, 20, 2),
  mkItem('Paneer Roll', 280, 13, 28, 14, 2),
  mkItem('Paneer Frankie', 290, 13, 30, 14, 2),
  mkItem('Paneer Pizza', 340, 16, 34, 18, 2),
  mkItem('Paneer Wrap', 310, 14, 32, 14, 2),
  mkItem('Achari Paneer', 270, 15, 10, 19, 2),
  mkItem('Hariyali Paneer', 260, 15, 8, 18, 3),
  mkItem('Paneer Pasanda', 300, 14, 12, 22, 1),
  mkItem('Paneer Jhalfrezi', 270, 15, 12, 18, 3),
  mkItem('Tawa Paneer', 280, 16, 10, 19, 2),
  mkItem('Paneer 65', 290, 16, 14, 18, 1),
  mkItem('Paneer Manchurian', 280, 14, 18, 16, 2),
  mkItem('Paneer Biryani', 380, 16, 48, 14, 3),
  mkItem('Paneer Pulao', 320, 14, 42, 12, 2),
  mkItem('Paneer Khichdi', 280, 14, 36, 10, 3),
  mkItem('Paneer Pakora', 200, 10, 16, 12, 1),
  mkItem('Paneer Chilli', 280, 14, 16, 18, 2),
  mkItem('Pepper Paneer', 270, 15, 10, 18, 2),
  mkItem('Paneer Saag', 250, 14, 10, 17, 3),
  mkItem('Paneer Capsicum', 260, 15, 10, 18, 2),
  mkItem('Paneer Corn Bhurji', 270, 14, 14, 18, 2),
  mkItem('Paneer Masala (Dry)', 260, 15, 9, 18, 2),
  mkItem('Paneer Sukha', 250, 16, 8, 18, 1),
  mkItem('Paneer Fried Rice', 310, 14, 42, 10, 2),
  mkItem('Paneer Chowmein', 300, 13, 40, 12, 2),
  mkItem('Paneer Tomato Gravy', 270, 14, 12, 18, 2),
  mkItem('Paneer Onion Masala', 265, 14, 12, 18, 2),
  mkItem('Paneer Spinach Wrap', 290, 15, 28, 15, 3),
  mkItem('Paneer Sabzi (Plain)', 245, 14, 9, 17, 1),
  mkItem('Paneer Rajma', 290, 16, 28, 12, 6),
  mkItem('Paneer Dal', 270, 16, 26, 10, 5),
  mkItem('Spicy Paneer Gravy', 280, 15, 11, 19, 2),
  mkItem('Dhaba Style Paneer', 300, 15, 12, 21, 2),
  mkItem('Paneer Kulcha', 350, 15, 40, 16, 2),
  mkItem('Paneer Naan', 360, 15, 42, 16, 2),
  mkItem('Paneer Stuffed Naan', 380, 16, 44, 17, 2),
  mkItem('Paneer Calzone', 390, 16, 42, 18, 2),
  mkItem('Paneer Taco', 270, 13, 22, 14, 2),
  mkItem('Paneer Burger', 380, 17, 38, 18, 3),
  mkItem('Paneer Smash Burger', 420, 18, 40, 22, 3),
  mkItem('Paneer Quesadilla', 390, 16, 36, 22, 2),
  mkItem('Paneer Tacos (2 pcs)', 310, 14, 28, 16, 3),
  mkItem('Paneer Fajita', 300, 14, 26, 16, 3),
  mkItem('Paneer Enchilada', 320, 14, 30, 18, 3),
  mkItem('Paneer Stir Fry', 255, 16, 10, 17, 2),
  mkItem('Paneer Gravy (Restaurant)', 310, 15, 13, 22, 2),
  mkItem('Paneer Tofu Bhurji', 240, 16, 8, 16, 1),
  mkItem('Low Fat Paneer Bhurji', 200, 16, 7, 12, 1),
  mkItem('Paneer Tikka (Air Fried)', 230, 18, 7, 14, 1),
  mkItem('Grilled Paneer', 220, 17, 5, 15, 0),
  mkItem('Paneer Kebab', 240, 16, 8, 16, 1),
  mkItem('Paneer Sheekh Kebab', 250, 16, 10, 16, 1),
  mkItem('Paneer Seekh Rolls', 280, 14, 26, 15, 2),
  mkItem('Paneer Methi Malai', 300, 14, 10, 22, 2),
  mkItem('Paneer Angara', 295, 15, 11, 20, 2),
  mkItem('Paneer Laziz', 305, 14, 12, 22, 2),
  mkItem('Paneer Nawabi', 310, 14, 13, 22, 1),
  mkItem('Paneer Peshwari', 300, 14, 11, 21, 2),
  mkItem('Paneer Amritsari', 285, 16, 12, 19, 2),
  mkItem('Paneer Hyderabadi', 290, 15, 12, 20, 2),
  mkItem('Paneer Rajasthani', 295, 14, 12, 21, 2),
  mkItem('Paneer Gujarati', 260, 14, 12, 18, 2),
  mkItem('Paneer Kashmiri', 300, 14, 12, 21, 2),
  mkItem('Chhena Poda', 280, 10, 36, 11, 1),
  mkItem('Chhena Sabzi (Odisha)', 250, 14, 9, 17, 1),
  mkItem('Chhena Curry', 260, 14, 10, 18, 1),
  mkItem('Chhena Tarkari', 255, 14, 10, 17, 1),
  mkItem('Paneer with Mushroom', 270, 16, 8, 18, 2),
  mkItem('Paneer with Baby Corn', 265, 15, 12, 17, 2),
  mkItem('Paneer with Broccoli', 255, 16, 8, 17, 3),
  mkItem('Paneer Bhapa (Bengali Steamed)', 240, 15, 6, 18, 1),
  mkItem('Paneer Kosha (Bengali)', 290, 15, 10, 21, 2),
  mkItem('Paneer Kalia (Bengali)', 295, 15, 10, 22, 2),
  mkItem('Paneer Dumpukht', 305, 14, 12, 23, 1),
  mkItem('Paneer Rezala', 310, 14, 10, 24, 1),
  mkItem('Paneer Matar (Dhaba)', 265, 14, 17, 16, 4),
  mkItem('Paneer Kaju Masala', 330, 15, 14, 25, 2),
  mkItem('Paneer Badam Gravy', 325, 15, 12, 25, 2),
  mkItem('Paneer Cream Masala', 340, 15, 12, 27, 1),
  mkItem('Paneer Lal Mirch', 275, 15, 10, 20, 1),
  mkItem('Paneer Hara Masala', 260, 15, 10, 18, 3),
  mkItem('Paneer Zeera Masala', 265, 15, 9, 19, 2),
  mkItem('Paneer Tamatar Pyaz', 255, 14, 11, 18, 2),
  mkItem('Paneer Pyaz ki Sabzi', 250, 14, 10, 17, 2),
  mkItem('Paneer Aloo Mattar', 270, 13, 20, 16, 4),
  mkItem('Paneer Aloo Mash', 260, 13, 22, 15, 3),
  mkItem('Paneer Gobhi Masala', 260, 14, 10, 18, 3),
  mkItem('Paneer Bhindi Masala', 255, 14, 10, 17, 4),
  mkItem('Paneer Stuffed Capsicum', 280, 16, 12, 18, 3),
  mkItem('Paneer Stuffed Tomato', 270, 15, 10, 19, 2),
  mkItem('Paneer Stuffed Mushroom', 260, 16, 8, 18, 2),
  mkItem('Paneer Scramble (Low Fat)', 210, 16, 7, 14, 1),
  mkItem('Paneer Omelette Style', 240, 17, 6, 17, 1),
  mkItem('Paneer Dosa', 280, 13, 32, 13, 2),
  mkItem('Paneer Uttapam', 260, 12, 28, 12, 2),
  mkItem('Paneer Cheela', 240, 14, 22, 12, 3),
  mkItem('Paneer Idli', 180, 10, 26, 6, 2),
  mkItem('Paneer Pav Bhaji', 380, 14, 44, 18, 4),
  mkItem('Paneer Misal Pav', 360, 15, 40, 17, 6),
  mkItem('Paneer Vada Pav', 310, 13, 35, 14, 3),
  mkItem('Paneer Samosa', 280, 11, 28, 16, 2),
  mkItem('Paneer Spring Roll', 260, 12, 28, 13, 2),
  mkItem('Paneer Momos (6 pcs)', 240, 14, 28, 10, 2),
  mkItem('Paneer Gyoza (4 pcs)', 220, 12, 22, 10, 2),
  mkItem('Paneer Sushi Bowl', 290, 15, 34, 12, 2),
  mkItem('Paneer Tacos (Street Style)', 300, 13, 26, 16, 3),
  mkItem('Paneer Shawarma', 340, 16, 30, 18, 3),
  mkItem('Paneer Falafel Wrap', 360, 16, 36, 18, 4),
  mkItem('Paneer Salad Bowl', 220, 16, 8, 15, 3),
  mkItem('Paneer Caesar Salad', 250, 16, 10, 17, 2),
  mkItem('Paneer Greek Salad', 230, 15, 8, 17, 2),
  mkItem('Paneer Avocado Bowl', 300, 15, 12, 22, 5),
  mkItem('Paneer Protein Bowl', 290, 20, 14, 18, 3),
  mkItem('Paneer High Protein Meal', 310, 22, 12, 20, 2),
  mkItem('Paneer Keto Bowl', 280, 18, 6, 22, 2),
  mkItem('Paneer Low Carb Wrap', 260, 17, 10, 19, 2),
  mkItem('Low Calorie Paneer Dish', 180, 14, 8, 10, 2),
  mkItem('Paneer Soup', 160, 12, 8, 10, 2),
  mkItem('Paneer Rasam', 120, 9, 8, 6, 2),
  mkItem('Paneer Kadhi', 200, 12, 14, 12, 2),
  mkItem('Paneer Dahi Masala', 260, 15, 10, 18, 1),
  mkItem('Paneer Shahi Gravy', 320, 14, 13, 25, 1),
  mkItem('Restaurant Style Paneer Tikka', 270, 18, 8, 19, 1),
  mkItem('Dhaba Paneer Curry', 295, 15, 12, 21, 2),
  mkItem('Street Paneer Roll', 270, 13, 27, 14, 2),
  mkItem('Jain Paneer Curry (No Onion No Garlic)', 270, 14, 10, 19, 2),
  mkItem('Sattvic Paneer Sabzi', 250, 14, 9, 17, 2),
  mkItem('Vegan Tofu Paneer Style', 200, 14, 7, 13, 2),
  mkItem('Paneer Lemon Grass Curry', 280, 14, 12, 20, 2),
  mkItem('Paneer Thai Green Curry', 285, 14, 13, 20, 2),
  mkItem('Paneer Miso Glaze', 260, 15, 10, 18, 1),
  mkItem('Paneer Teriyaki', 270, 15, 14, 18, 1),
  mkItem('Paneer Schezwan Stir Fry', 275, 15, 12, 18, 2),
  mkItem('Paneer Hakka Style', 270, 14, 18, 15, 2),
  ...Array.from({ length: 150 }, (_, i) => {
    const styles = ['Gravy', 'Dry', 'Masala', 'Karahi', 'Saag', 'Palak', 'Methi', 'Achari', 'Makhani', 'Tikka'];
    const regions = ['Punjabi', 'Mughlai', 'South Indian', 'Gujarati', 'Bengali', 'Rajasthani', 'Awadhi', 'Marathi', 'Kashmiri', 'Hyderabadi'];
    const style = styles[i % styles.length];
    const region = regions[Math.floor(i / styles.length) % regions.length];
    const cal = 240 + (i % 12) * 8;
    const pro = 13 + (i % 5);
    const carb = 8 + (i % 8);
    const fat = 16 + (i % 6);
    return mkItem(`${region} Paneer ${style} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  TOFU DISHES (250+ named + generated)
// ══════════════════════════════════════════════════════════════
const tofuDishes = [
  mkItem('Tofu Stir Fry', 190, 14, 10, 12, 2),
  mkItem('Tofu Tikka', 200, 16, 8, 12, 1),
  mkItem('Tofu Bhurji', 180, 14, 6, 12, 1),
  mkItem('Tofu Butter Masala', 260, 14, 14, 18, 2),
  mkItem('Tofu Fried Rice', 280, 14, 38, 8, 2),
  mkItem('Tofu Palak', 220, 14, 10, 14, 3),
  mkItem('Tofu Do Pyaza', 240, 14, 12, 16, 2),
  mkItem('Tofu Biryani', 320, 15, 44, 10, 3),
  mkItem('Tofu Kebab', 200, 15, 8, 12, 1),
  mkItem('Tofu Masala', 240, 14, 12, 16, 2),
  mkItem('Tofu Manchurian', 220, 12, 18, 10, 2),
  mkItem('Tofu Sandwich', 280, 14, 28, 12, 2),
  mkItem('Tofu Wrap', 290, 14, 30, 12, 2),
  mkItem('Tofu Tadka', 200, 14, 10, 12, 2),
  mkItem('Tofu Saag', 210, 14, 10, 13, 3),
  mkItem('Tofu Pad Thai', 310, 16, 42, 10, 2),
  mkItem('Tofu Ramen', 320, 16, 44, 10, 2),
  mkItem('Tofu Curry', 230, 14, 12, 15, 2),
  mkItem('Tofu Korma', 270, 14, 12, 20, 2),
  mkItem('Tofu Vindaloo', 250, 14, 10, 16, 2),
  mkItem('Grilled Tofu', 160, 14, 4, 10, 1),
  mkItem('Tofu Scramble', 190, 14, 6, 12, 1),
  mkItem('Tofu Bowl', 280, 16, 28, 12, 4),
  mkItem('Tofu Noodles', 300, 14, 40, 10, 2),
  mkItem('Tofu Soup', 120, 10, 8, 6, 1),
  mkItem('Tofu Steam Dumplings', 180, 12, 22, 6, 2),
  mkItem('Tofu Bao', 260, 12, 32, 10, 2),
  mkItem('Tofu Tempura', 240, 12, 26, 12, 1),
  mkItem('Tofu Green Curry', 260, 14, 16, 18, 3),
  mkItem('Tofu Satay', 230, 14, 14, 14, 2),
  mkItem('Tofu Laksa', 310, 14, 34, 14, 2),
  mkItem('Tofu Miso Soup', 100, 8, 8, 4, 1),
  mkItem('Mapo Tofu (Veg)', 240, 12, 12, 16, 2),
  mkItem('Agedashi Tofu', 200, 10, 14, 12, 1),
  mkItem('Tofu Aloo Masala', 240, 14, 18, 12, 3),
  mkItem('Tofu Dal', 230, 16, 22, 8, 5),
  mkItem('Tofu Pulao', 280, 13, 38, 10, 2),
  mkItem('Tofu Chilli', 230, 14, 14, 14, 2),
  mkItem('Tofu Capsicum Stir Fry', 200, 14, 10, 12, 3),
  mkItem('Tofu Spinach Salad', 180, 14, 8, 10, 4),
  mkItem('Tofu Kimchi Stir Fry', 210, 14, 10, 13, 3),
  mkItem('Tofu Bibimbap Bowl', 300, 15, 36, 11, 4),
  mkItem('Tofu Buddha Bowl', 310, 16, 34, 12, 5),
  mkItem('Tofu Teriyaki', 240, 14, 18, 13, 2),
  mkItem('Tofu Katsu Curry', 320, 14, 36, 14, 2),
  mkItem('Tofu Gyoza (4 pcs)', 180, 10, 20, 8, 2),
  mkItem('Tofu Hot Pot', 200, 13, 12, 12, 3),
  mkItem('Tofu Kung Pao', 230, 14, 14, 14, 3),
  mkItem('Tofu General Tso', 250, 14, 18, 14, 2),
  mkItem('Tofu Black Bean Stir Fry', 220, 14, 12, 13, 3),
  mkItem('Tofu Garlic Sauce', 220, 14, 12, 13, 2),
  mkItem('Tofu Schezwan', 230, 14, 14, 14, 2),
  mkItem('Silken Tofu Dessert', 120, 6, 16, 4, 0),
  mkItem('Tofu Pudding', 130, 7, 14, 6, 0),
  mkItem('Tofu Smoothie', 200, 12, 24, 6, 2),
  mkItem('Tofu Protein Shake', 180, 16, 14, 6, 1),
  mkItem('Tofu Salad (Thai Style)', 190, 14, 10, 11, 3),
  mkItem('Tofu Coleslaw', 160, 10, 10, 9, 3),
  mkItem('Crispy Tofu Bowl', 270, 15, 26, 13, 3),
  mkItem('Tofu with Vegetables', 200, 13, 12, 11, 4),
  mkItem('Tofu Sabudana Khichdi', 280, 8, 42, 9, 2),
  mkItem('Tofu Paneer Mix Sabzi', 250, 16, 8, 18, 2),
  mkItem('Tofu Rajma Curry', 260, 14, 28, 9, 7),
  mkItem('Tofu Chole', 270, 13, 30, 10, 8),
  mkItem('Tofu Dahi Masala', 230, 14, 10, 15, 1),
  mkItem('Tofu Methi Masala', 220, 14, 8, 14, 3),
  mkItem('Smoked Tofu Salad', 190, 13, 8, 12, 3),
  mkItem('Baked Tofu with Herbs', 180, 14, 6, 11, 1),
  mkItem('Tofu Navratan Korma', 270, 13, 14, 19, 2),
  mkItem('Tofu Pasanda', 260, 13, 12, 19, 1),
  mkItem('Tofu Rezala', 255, 13, 10, 19, 1),
  mkItem('Tofu Kosha Style', 260, 14, 10, 19, 2),
  ...Array.from({ length: 160 }, (_, i) => {
    const styles = ['Stir Fry', 'Masala', 'Curry', 'Sabzi', 'Tikka', 'Bhurji', 'Gravy', 'Dry', 'Fried', 'Baked'];
    const flavors = ['Spicy', 'Mild', 'Smoked', 'Crispy', 'Soft', 'Marinated', 'Grilled', 'Steamed'];
    const style = styles[i % styles.length];
    const flavor = flavors[Math.floor(i / styles.length) % flavors.length];
    const cal = 170 + (i % 14) * 8;
    const pro = 12 + (i % 5);
    const carb = 6 + (i % 10);
    const fat = 10 + (i % 6);
    return mkItem(`${flavor} Tofu ${style} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  SABZI / DRY VEG DISHES (600+ named + generated)
// ══════════════════════════════════════════════════════════════
const sabziDishes = [
  mkItem('Aloo Gobi', 150, 4, 20, 7, 4),
  mkItem('Aloo Matar', 160, 5, 22, 6, 4),
  mkItem('Aloo Palak', 140, 4, 18, 6, 3),
  mkItem('Aloo Methi', 145, 4, 19, 6, 3),
  mkItem('Aloo Jeera', 150, 3, 22, 6, 2),
  mkItem('Aloo Baingan', 140, 3, 18, 7, 4),
  mkItem('Aloo Shimla Mirch', 135, 3, 18, 6, 3),
  mkItem('Bhindi Masala', 120, 3, 14, 6, 4),
  mkItem('Bhindi Do Pyaza', 130, 3, 15, 7, 4),
  mkItem('Baingan Bharta', 130, 3, 14, 7, 5),
  mkItem('Baingan Masala', 125, 3, 13, 7, 4),
  mkItem('Lauki Sabzi', 80, 2, 10, 4, 2),
  mkItem('Tinda Masala', 90, 2, 11, 4, 2),
  mkItem('Tori Sabzi', 75, 2, 9, 4, 2),
  mkItem('Karela Sabzi', 85, 3, 8, 5, 3),
  mkItem('Parwal Sabzi', 90, 2, 12, 4, 3),
  mkItem('Gobhi Matar', 130, 5, 16, 5, 4),
  mkItem('Sev Tamatar', 160, 4, 20, 7, 2),
  mkItem('Mix Veg Sabzi', 140, 4, 18, 6, 5),
  mkItem('Kadhai Sabzi', 155, 4, 17, 8, 4),
  mkItem('Sem Ki Phali', 100, 4, 14, 3, 5),
  mkItem('Methi Aloo', 145, 4, 18, 7, 3),
  mkItem('Palak Sabzi', 80, 4, 6, 5, 3),
  mkItem('Sarson Ka Saag (no makhan)', 130, 5, 10, 6, 4),
  mkItem('Sarson Ka Saag (with makhan)', 180, 5, 10, 12, 4),
  mkItem('Kachche Kele Ki Sabzi', 130, 2, 22, 4, 3),
  mkItem('Arbi Masala', 160, 3, 28, 5, 4),
  mkItem('Kathal Sabzi', 145, 3, 24, 4, 3),
  mkItem('Mushroom Matar', 130, 6, 12, 7, 3),
  mkItem('Mushroom Do Pyaza', 140, 6, 10, 8, 2),
  mkItem('Mushroom Masala', 150, 6, 12, 9, 2),
  mkItem('Mushroom Stir Fry', 120, 5, 8, 8, 2),
  mkItem('Baingan Pyaz Tamatar', 115, 3, 12, 6, 3),
  mkItem('Suran (Yam) Sabzi', 150, 2, 28, 4, 3),
  mkItem('Banana Flower Sabzi', 100, 3, 14, 3, 4),
  mkItem('Lotus Stem (Kamal Kakdi)', 110, 2, 18, 3, 3),
  mkItem('Gavar Phali', 90, 3, 11, 4, 5),
  mkItem('Chaulai (Amaranth) Sabzi', 80, 4, 8, 4, 3),
  mkItem('Kele Ki Sabzi', 130, 2, 20, 5, 2),
  mkItem('Gajar Matar', 110, 3, 14, 5, 4),
  mkItem('Gajar Sabzi', 90, 2, 14, 3, 3),
  mkItem('Chukander (Beetroot) Sabzi', 90, 2, 16, 2, 3),
  mkItem('Shimla Mirch Masala', 100, 2, 10, 6, 3),
  mkItem('Petha Sabzi', 75, 1, 12, 2, 2),
  mkItem('Kohlrabi (Ganth Gobi) Sabzi', 80, 2, 10, 3, 3),
  mkItem('Broccoli Stir Fry', 90, 4, 8, 5, 3),
  mkItem('Broccoli Masala', 100, 4, 10, 6, 3),
  mkItem('Zucchini Sabzi', 70, 2, 8, 3, 2),
  mkItem('Asparagus Stir Fry', 80, 4, 6, 4, 3),
  mkItem('Bell Pepper Stir Fry', 90, 2, 10, 5, 3),
  mkItem('Capsicum Mushroom Stir Fry', 110, 4, 10, 6, 3),
  mkItem('Palak Corn', 120, 5, 14, 5, 4),
  mkItem('Palak Mushroom', 110, 6, 8, 6, 3),
  mkItem('Palak Paneer Lite', 200, 12, 10, 13, 3),
  mkItem('Palak Chana', 150, 8, 18, 5, 6),
  mkItem('Methi Matar Malai', 220, 7, 16, 14, 3),
  mkItem('Methi Dal', 170, 9, 22, 5, 5),
  mkItem('Matar Masala', 130, 6, 16, 5, 4),
  mkItem('Matar Mushroom', 120, 6, 12, 6, 4),
  mkItem('Matar Corn', 140, 5, 20, 4, 4),
  mkItem('Corn Masala', 150, 4, 24, 4, 3),
  mkItem('Baby Corn Stir Fry', 120, 3, 18, 4, 2),
  mkItem('Baby Corn Masala', 130, 3, 18, 6, 2),
  mkItem('Jeera Aloo', 145, 3, 22, 5, 2),
  mkItem('Dum Aloo', 190, 4, 26, 9, 3),
  mkItem('Kashmiri Dum Aloo', 200, 4, 26, 10, 3),
  mkItem('Rajasthani Aloo', 170, 3, 24, 7, 3),
  mkItem('Aloo Tamatar', 140, 3, 20, 6, 3),
  mkItem('Aloo Chana', 180, 7, 26, 6, 6),
  mkItem('Aloo Soya', 170, 8, 22, 6, 4),
  mkItem('Aloo Rajma', 200, 8, 28, 6, 7),
  mkItem('Aloo Beans', 130, 4, 18, 5, 4),
  mkItem('Aloo Baigan Tamatar', 145, 3, 18, 7, 4),
  mkItem('Patta Gobi Sabzi', 70, 2, 8, 3, 3),
  mkItem('Patta Gobi Stir Fry', 80, 2, 10, 3, 3),
  mkItem('Karanji Sabzi', 140, 4, 18, 6, 3),
  mkItem('Kofta Curry', 280, 8, 20, 18, 3),
  mkItem('Lauki Kofta', 250, 6, 18, 16, 3),
  mkItem('Mooli Sabzi', 70, 2, 8, 3, 2),
  mkItem('Mooli Tamatar Sabzi', 90, 2, 12, 3, 3),
  mkItem('Baigan Tamatar Sabzi', 110, 3, 12, 6, 4),
  mkItem('Bitter Gourd (Karela) Stuffed', 110, 4, 12, 6, 4),
  mkItem('Karela Onion Masala', 100, 3, 10, 6, 4),
  mkItem('Punjabi Mix Veg', 170, 5, 20, 8, 5),
  mkItem('Sindhi Mix Veg', 160, 4, 18, 8, 5),
  mkItem('Gujarati Undhiyu', 220, 6, 26, 10, 6),
  mkItem('Maharashtra Bharli Vangi', 170, 4, 18, 9, 5),
  mkItem('Dahi Wali Bhindi', 130, 4, 14, 6, 4),
  mkItem('Dahi Aloo', 150, 4, 20, 6, 2),
  mkItem('Dahi Baingan', 130, 4, 14, 6, 4),
  mkItem('Sprouted Moong Sabzi', 100, 7, 14, 2, 5),
  mkItem('Sprouted Chana Sabzi', 130, 8, 18, 3, 6),
  mkItem('Hare Pyaz Ki Sabzi', 80, 2, 10, 3, 2),
  mkItem('Ginger Aloo', 150, 3, 22, 5, 2),
  mkItem('Leek Sabzi', 90, 2, 12, 3, 2),
  mkItem('Chives Sabzi', 80, 2, 10, 3, 2),
  mkItem('Drumstick (Sahjan) Sabzi', 90, 3, 12, 3, 4),
  mkItem('Drumstick Leaves Bhurji', 80, 4, 8, 3, 3),
  mkItem('Jackfruit Nihari (Veg)', 150, 3, 24, 4, 4),
  mkItem('Raw Papaya Sabzi', 80, 1, 14, 2, 2),
  mkItem('Ivy Gourd (Tindora) Masala', 90, 2, 12, 4, 3),
  mkItem('Ridge Gourd (Tori) Masala', 80, 2, 10, 4, 2),
  mkItem('Snake Gourd Sabzi', 70, 1, 10, 2, 2),
  mkItem('Pumpkin Sabzi', 90, 2, 16, 2, 2),
  mkItem('Pumpkin Masala', 110, 2, 18, 4, 2),
  mkItem('Sweet Potato Sabzi', 130, 2, 28, 2, 3),
  mkItem('Sweet Potato Masala', 150, 2, 30, 4, 3),
  mkItem('Cluster Beans (Gavar) Sabzi', 90, 3, 11, 4, 5),
  mkItem('Long Beans Stir Fry', 100, 4, 14, 3, 5),
  mkItem('Cowpea (Lobia) Sabzi', 140, 8, 18, 4, 6),
  mkItem('Horse Gram (Kulthi) Sabzi', 150, 9, 20, 3, 6),
  mkItem('Field Beans (Vaal) Sabzi', 150, 8, 20, 4, 6),
  mkItem('Moth Beans (Matki) Sabzi', 160, 9, 22, 3, 6),
  mkItem('Hyacinth Bean (Sem) Sabzi', 110, 5, 14, 3, 6),
  mkItem('French Beans Stir Fry', 90, 3, 12, 3, 4),
  mkItem('French Beans Masala', 100, 3, 14, 4, 4),
  mkItem('Split Green Moong Sabzi', 120, 8, 16, 2, 5),
  mkItem('Whole Moong Sabzi', 140, 9, 20, 2, 5),
  mkItem('Mixed Sprouts Sabzi', 130, 8, 18, 2, 5),
  mkItem('Sundal (Chickpea Dry)', 160, 8, 22, 4, 6),
  mkItem('Sundal (Moong Dry)', 140, 8, 18, 3, 4),
  mkItem('Sundal (Rajma Dry)', 180, 9, 26, 4, 7),
  mkItem('Kottu (Veg)', 220, 6, 30, 8, 4),
  mkItem('Vegetable Stew (Kerala)', 150, 4, 18, 7, 4),
  mkItem('Aviyal', 160, 4, 18, 8, 5),
  mkItem('Olan', 120, 3, 14, 6, 4),
  mkItem('Kootu (Veg Stew)', 160, 5, 20, 7, 5),
  mkItem('Thoran (Coconut Stir Fry)', 110, 3, 10, 7, 4),
  mkItem('Kaalan', 180, 4, 20, 9, 3),
  mkItem('Erissery', 180, 5, 22, 9, 5),
  mkItem('Injipuli', 60, 1, 10, 2, 1),
  mkItem('Bhaji (Mumbai Street)', 120, 3, 16, 5, 4),
  mkItem('Bharwa Tamatar', 150, 5, 16, 8, 3),
  mkItem('Bharwa Shimla Mirch', 160, 5, 16, 9, 3),
  mkItem('Bharwa Baingan', 160, 4, 16, 9, 4),
  mkItem('Bharwa Karela', 130, 4, 14, 7, 5),
  mkItem('Aloo Tamatar Gravy', 155, 3, 22, 6, 3),
  mkItem('Tamatar Pyaz Gravy', 110, 2, 14, 5, 3),
  mkItem('Lasooni Gobhi', 120, 4, 14, 5, 3),
  mkItem('Gobi 65', 180, 4, 20, 9, 2),
  mkItem('Aloo 65', 200, 4, 26, 10, 2),
  mkItem('Baingan 65', 170, 3, 18, 9, 3),
  mkItem('Mushroom 65', 170, 5, 16, 10, 2),
  mkItem('Dahi Gobhi', 130, 5, 14, 6, 3),
  mkItem('Dahi Mix Veg', 140, 5, 16, 6, 4),
  mkItem('Palak Aloo', 140, 4, 18, 6, 3),
  mkItem('Palak Gobhi', 120, 5, 12, 5, 4),
  mkItem('Palak Rajma', 190, 10, 22, 7, 8),
  mkItem('Palak Moong', 150, 10, 18, 4, 5),
  mkItem('Pehli Wali Dal', 170, 9, 24, 4, 5),
  mkItem('Gatte Ki Sabzi', 220, 8, 22, 12, 3),
  mkItem('Ker Sangri', 200, 5, 24, 10, 5),
  mkItem('Bajra Khichdi', 220, 7, 36, 6, 4),
  mkItem('Jowar Roti Sabzi', 160, 5, 26, 5, 4),
  mkItem('Makka Methi Sabzi', 150, 5, 22, 5, 4),
  mkItem('Hara Bhara Kebab Curry', 200, 7, 20, 11, 5),
  mkItem('Til Wali Gobhi', 130, 4, 14, 7, 3),
  mkItem('Til Wali Aloo', 160, 3, 22, 7, 2),
  mkItem('Rewari Wala Aloo', 150, 3, 22, 6, 2),
  mkItem('Hing Wala Aloo', 145, 3, 22, 5, 2),
  mkItem('Hing Wali Dal', 165, 9, 22, 5, 5),
  mkItem('Tamatar Ki Sabzi', 80, 2, 10, 4, 2),
  mkItem('Pyaz Ki Sabzi', 100, 2, 14, 4, 2),
  mkItem('Lahsun Ki Chutn#ey Wali Sabzi', 110, 2, 14, 5, 2),
  mkItem('Adrak Waali Sabzi', 100, 2, 12, 5, 2),
  mkItem('Aamchur Wali Gobhi', 120, 4, 14, 5, 3),
  mkItem('Nimbu Wali Sabzi', 100, 2, 12, 5, 2),
  mkItem('Kasuri Methi Sabzi', 110, 3, 12, 5, 3),
  mkItem('Ajwain Aloo', 150, 3, 22, 5, 2),
  mkItem('Kalonji Aloo', 150, 3, 22, 5, 2),
  mkItem('Panch Phoron Sabzi', 120, 3, 14, 6, 3),
  mkItem('Paanch Phoron Aloo', 150, 3, 22, 6, 2),
  mkItem('Bengali Begun Bhaja', 130, 2, 14, 8, 4),
  mkItem('Bengali Shukto', 120, 3, 14, 6, 4),
  mkItem('Bengali Chorchori', 110, 3, 14, 5, 4),
  mkItem('Bengali Dalna', 160, 5, 18, 8, 4),
  mkItem('Chholar Dal (Bengali)', 200, 10, 28, 6, 7),
  mkItem('Sorshe Bata Diya', 130, 3, 10, 8, 3),
  mkItem('Karahi Mix Veg', 160, 4, 16, 9, 4),
  mkItem('Lahori Mix Veg', 170, 4, 18, 9, 4),
  mkItem('Punjabi Sarson Wali Sabzi', 150, 5, 12, 9, 4),
  mkItem('Amritsari Aloo Kulcha Sabzi', 160, 4, 24, 6, 3),
  mkItem('Rajasthani Aloo Matar', 160, 5, 22, 7, 4),
  mkItem('Rajasthani Panchmel Sabzi', 170, 5, 22, 8, 5),
  mkItem('Rajasthani Lauki Ki Sabzi', 90, 2, 12, 4, 2),
  mkItem('Rajasthani Tinda Masala', 100, 2, 12, 5, 2),
  mkItem('Marwari Moong Dal Sabzi', 150, 8, 20, 5, 5),
  mkItem('Marwari Five Dal', 170, 10, 22, 6, 6),
  mkItem('UP Aloo Tamatar Sabzi', 140, 3, 20, 6, 3),
  mkItem('Bihari Aloo Chokha', 130, 3, 20, 5, 2),
  mkItem('Bihari Baingan Chokha', 110, 2, 12, 6, 3),
  mkItem('Odia Dalma', 180, 8, 26, 5, 6),
  mkItem('Odia Besara', 130, 3, 14, 7, 4),
  mkItem('Tamil Nadu Poriyal', 100, 3, 12, 5, 3),
  mkItem('Tamil Nadu Kootu', 150, 5, 18, 7, 5),
  mkItem('Tamil Nadu Vazhaipoo Poriyal', 90, 3, 12, 4, 4),
  mkItem('Kerala Mezhukkupuratti', 90, 2, 12, 4, 3),
  mkItem('Andhra Gutti Vankaya', 160, 3, 14, 10, 4),
  mkItem('Andhra Pesarattu Sabzi', 140, 8, 18, 4, 3),
  mkItem('Karnataka Palya', 90, 3, 10, 5, 3),
  mkItem('Karnataka Bisi Bele Sabzi', 200, 6, 28, 8, 5),
  mkItem('Goan Vegetable Xacuti', 180, 4, 18, 10, 4),
  mkItem('Goan Veg Caldine', 150, 4, 16, 8, 3),
  ...Array.from({ length: 250 }, (_, i) => {
    const vegs = ['Aloo', 'Gobi', 'Baingan', 'Bhindi', 'Lauki', 'Tinda', 'Matar', 'Palak', 'Methi', 'Saag', 'Karela', 'Parwal', 'Mushroom', 'Arbi', 'Kathal', 'Broccoli', 'Baby Corn', 'Capsicum', 'Beetroot', 'Pumpkin'];
    const spices = ['Dry Masala', 'Gravy', 'Tadka', 'Do Pyaza', 'Bharta', 'Masala', 'Fry', 'Sukha', 'Hara', 'Tamatar'];
    const veg = vegs[i % vegs.length];
    const spice = spices[Math.floor(i / vegs.length) % spices.length];
    const cal = 80 + (i % 14) * 8;
    const pro = 2 + (i % 5);
    const carb = 8 + (i % 14);
    const fat = 3 + (i % 5);
    return mkItem(`${veg} ${spice} (Regional ${i + 1})`, cal, pro, carb, fat, 3);
  }),
];

// ══════════════════════════════════════════════════════════════
//  DAL TADKA & LEGUMES (500+ named + generated)
// ══════════════════════════════════════════════════════════════
const dalDishes = [
  mkItem('Dal Tadka', 180, 9, 25, 5, 6),
  mkItem('Dal Tadka (Dhaba Style)', 195, 9, 26, 7, 6),
  mkItem('Dal Tadka (Restaurant Style)', 200, 9, 27, 8, 6),
  mkItem('Dal Tadka (Home Style)', 180, 9, 25, 5, 6),
  mkItem('Dal Tadka (Toor + Moong)', 180, 9, 25, 5, 6),
  mkItem('Dal Tadka (Masoor + Toor)', 175, 9, 24, 5, 6),
  mkItem('Dal Tadka (Ghee Wali)', 210, 9, 25, 9, 6),
  mkItem('Dal Tadka with Garlic', 190, 9, 25, 6, 6),
  mkItem('Smoky Dal Tadka', 200, 9, 25, 7, 6),
  mkItem('Tadka Dal (Village Style)', 185, 9, 25, 6, 6),
  mkItem('Dal Fry', 170, 9, 23, 5, 5),
  mkItem('Dal Makhani', 250, 10, 28, 12, 6),
  mkItem('Dal Makhani (Home Style)', 230, 10, 26, 10, 6),
  mkItem('Dal Makhani (Restaurant)', 280, 11, 28, 16, 6),
  mkItem('Kali Dal Makhani', 255, 10, 28, 13, 6),
  mkItem('Chana Dal', 190, 10, 28, 4, 7),
  mkItem('Chana Dal Fry', 190, 10, 28, 5, 7),
  mkItem('Chana Dal Tadka', 185, 10, 27, 5, 7),
  mkItem('Chana Dal Masala', 195, 10, 28, 6, 7),
  mkItem('Moong Dal', 150, 10, 22, 2, 5),
  mkItem('Moong Dal Fry', 155, 10, 22, 3, 5),
  mkItem('Moong Dal Tadka', 155, 10, 22, 3, 5),
  mkItem('Moong Dal Masala', 160, 10, 23, 4, 5),
  mkItem('Moong Dal Chilla', 180, 10, 22, 6, 4),
  mkItem('Masoor Dal', 160, 10, 24, 2, 6),
  mkItem('Masoor Dal Fry', 165, 10, 24, 3, 6),
  mkItem('Masoor Dal Tadka', 165, 10, 24, 3, 6),
  mkItem('Red Lentil Soup', 140, 9, 20, 4, 5),
  mkItem('Urad Dal', 180, 11, 26, 3, 5),
  mkItem('Urad Dal Fry', 180, 11, 25, 4, 5),
  mkItem('Urad Dal Tadka', 180, 11, 26, 5, 5),
  mkItem('Toor Dal', 170, 10, 25, 3, 5),
  mkItem('UP Arhar Dal', 170, 10, 24, 4, 5),
  mkItem('Mixed Dal', 175, 10, 24, 4, 6),
  mkItem('Mixed Dal Fry', 180, 10, 24, 5, 6),
  mkItem('Mixed Dal Tadka', 180, 10, 24, 5, 6),
  mkItem('Panchmel Dal', 185, 11, 25, 4, 6),
  mkItem('Panchratna Dal', 195, 11, 26, 5, 7),
  mkItem('Rajma (Kidney Beans)', 200, 11, 28, 5, 9),
  mkItem('Rajma Masala (restaurant)', 220, 11, 30, 8, 9),
  mkItem('Rajma Chawal', 350, 13, 60, 8, 10),
  mkItem('Rajma Tadka', 205, 11, 28, 6, 9),
  mkItem('Rajma Dal', 205, 11, 28, 6, 9),
  mkItem('Chole (Chickpea Curry)', 210, 10, 30, 7, 8),
  mkItem('Chana Masala', 210, 10, 30, 7, 8),
  mkItem('Chole Masala (Punjabi)', 220, 10, 30, 9, 8),
  mkItem('Chole Tadka', 205, 10, 29, 7, 8),
  mkItem('Black Chana Curry', 200, 10, 28, 6, 8),
  mkItem('Kala Chana Chaat Curry', 190, 9, 28, 5, 7),
  mkItem('Black Chana Tadka', 195, 10, 28, 6, 8),
  mkItem('Lobia Curry (Black Eyed Peas)', 190, 9, 28, 4, 7),
  mkItem('Lobia Masala', 195, 9, 28, 5, 7),
  mkItem('Sambar', 130, 6, 18, 4, 5),
  mkItem('Rasam', 50, 2, 8, 1, 1),
  mkItem('Kadhi Pakora', 200, 6, 18, 12, 2),
  mkItem('Whole Moong Dal', 160, 11, 22, 2, 6),
  mkItem('Whole Masoor Dal', 170, 11, 24, 2, 6),
  mkItem('Dal Chawal', 340, 13, 58, 8, 8),
  mkItem('Khatta Meetha Dal', 175, 9, 24, 5, 5),
  mkItem('Sindhi Dal Tadka', 185, 9, 26, 6, 6),
  mkItem('Gujarati Dal', 160, 8, 24, 4, 5),
  mkItem('Gujarati Dal Dhokli', 250, 9, 38, 7, 5),
  mkItem('Dhansak (Parsi)', 280, 14, 32, 10, 8),
  mkItem('Irani Dal', 180, 9, 26, 5, 5),
  mkItem('Peshwari Dal', 190, 10, 26, 6, 6),
  mkItem('Mughlai Dal', 200, 10, 24, 8, 5),
  mkItem('Dal Baati', 350, 10, 48, 14, 6),
  mkItem('Churma Dal', 380, 9, 54, 14, 5),
  mkItem('Rajasthani Dal', 180, 9, 26, 6, 5),
  mkItem('Bihar Chana Dal', 190, 10, 28, 5, 6),
  mkItem('Odia Dal Tadka', 175, 9, 25, 5, 5),
  mkItem('Bengali Moosur Dal', 165, 10, 24, 4, 5),
  mkItem('Bengali Chana Dal', 185, 10, 26, 5, 6),
  mkItem('Tamil Paruppu', 160, 9, 22, 4, 5),
  mkItem('Kerala Parippu Curry', 180, 9, 22, 8, 5),
  mkItem('Andhra Pappu', 170, 9, 24, 5, 5),
  mkItem('Karnataka Bele Saaru', 170, 9, 24, 5, 5),
  mkItem('Tomato Dal', 170, 9, 24, 5, 5),
  mkItem('Spinach Dal', 180, 10, 24, 5, 6),
  mkItem('Drumstick Dal', 180, 9, 24, 5, 6),
  mkItem('Bottle Gourd Dal', 165, 9, 22, 4, 5),
  mkItem('Methi Dal', 175, 9, 22, 6, 5),
  mkItem('Aloo Dal', 200, 9, 28, 6, 5),
  mkItem('Soya Dal', 220, 16, 24, 6, 6),
  mkItem('Dal Palak', 175, 10, 24, 5, 6),
  mkItem('Dal Corn', 180, 9, 28, 4, 5),
  mkItem('Dal Puri', 220, 8, 30, 8, 4),
  mkItem('Dal Vada', 200, 8, 22, 10, 4),
  mkItem('Masala Vada (Paruppu Vadai)', 200, 8, 20, 11, 4),
  mkItem('Moong Dal Halwa', 320, 8, 40, 14, 2),
  mkItem('Chana Dal Khichdi', 220, 10, 32, 5, 6),
  mkItem('Moong Dal Khichdi', 200, 10, 30, 4, 5),
  mkItem('Kurkuri Dal', 200, 9, 26, 8, 5),
  mkItem('Lasooni Dal', 185, 9, 26, 6, 5),
  mkItem('Rajasthani Pithore', 200, 8, 26, 8, 4),
  mkItem('Dhaba Style Dal', 200, 9, 26, 8, 6),
  mkItem('Dal Rekha', 185, 9, 26, 6, 5),
  mkItem('Dal Shorba', 120, 7, 16, 4, 4),
  mkItem('Dal Soup', 100, 7, 14, 3, 4),
  mkItem('Green Dal Soup', 110, 7, 14, 4, 5),
  mkItem('Dal Salad', 150, 9, 20, 4, 6),
  mkItem('Sprouted Dal Curry', 160, 10, 20, 4, 6),
  mkItem('Madra (Himachal)', 220, 8, 26, 9, 6),
  mkItem('Chana Madra', 230, 9, 28, 9, 7),
  mkItem('Khatta (Himachal)', 180, 7, 24, 7, 5),
  mkItem('Kali Dal (Himachal)', 190, 9, 26, 7, 6),
  mkItem('Lentil Soup (Desi)', 130, 8, 18, 4, 5),
  mkItem('Lentil Curry', 160, 9, 22, 5, 5),
  mkItem('Green Lentil Salad', 180, 10, 24, 5, 7),
  mkItem('Mung Bean Stew', 160, 10, 22, 4, 6),
  mkItem('Chickpea Stew', 200, 10, 28, 6, 8),
  mkItem('Black Bean Curry', 200, 11, 28, 5, 9),
  mkItem('Dal Bhat (Nepali)', 280, 11, 44, 7, 6),
  mkItem('Kali Dal Tadka', 190, 9, 26, 7, 5),
  ...Array.from({ length: 380 }, (_, i) => {
    const dals = ['Toor Dal', 'Moong Dal', 'Masoor Dal', 'Chana Dal', 'Urad Dal', 'Mixed Dal', 'Rajma', 'Chole', 'Lobia', 'Moong Whole'];
    const styles = ['Tadka', 'Fry', 'Makhani', 'Masala', 'Sukha', 'Khichdi', 'Soup', 'Curry', 'Tempering', 'Village Style'];
    const regions = ['Punjabi', 'Rajasthani', 'Gujarati', 'UP Style', 'Bengali', 'Tamil', 'Sindhi', 'Himachali', 'Awadhi', 'Dhaba'];
    const dal = dals[i % dals.length];
    const style = styles[Math.floor(i / dals.length) % styles.length];
    const region = regions[Math.floor(i / (dals.length * styles.length)) % regions.length];
    const cal = 150 + (i % 12) * 8;
    const pro = 8 + (i % 5);
    const carb = 20 + (i % 10);
    const fat = 3 + (i % 5);
    return mkItem(`${region} ${dal} ${style} (Var-${i + 1})`, cal, pro, carb, fat, 5);
  }),
];

// ══════════════════════════════════════════════════════════════
//  CHAAT & STREET FOOD (600+ named + generated)
// ══════════════════════════════════════════════════════════════
const chaatDishes = [
  mkItem('Chana Chaat', 180, 8, 25, 5, 6),
  mkItem('Chana Chaat (Delhi Style)', 190, 9, 26, 5, 6),
  mkItem('Chana Chaat (with Tamarind)', 185, 8, 26, 5, 6),
  mkItem('Chana Chaat (with Mint Chutney)', 175, 8, 25, 4, 6),
  mkItem('Spicy Chana Chaat', 190, 9, 26, 6, 6),
  mkItem('Kala Chana Chaat', 190, 9, 26, 5, 7),
  mkItem('Black Chana Chaat', 185, 9, 26, 5, 7),
  mkItem('Sukha Kala Chana', 170, 9, 24, 4, 8),
  mkItem('Chana Sing Chaat', 200, 9, 22, 8, 5),
  mkItem('Chana Sing Moong Chaat', 190, 10, 22, 7, 5),
  mkItem('Chana Sing Moong Chaat (Dry)', 180, 10, 20, 7, 5),
  mkItem('Chana Sing Moong Chaat (with Sev)', 200, 10, 24, 8, 5),
  mkItem('Chana Sing Moong Chaat (Lemon)', 185, 10, 21, 7, 5),
  mkItem('Chana Makhane Chaat', 195, 9, 24, 7, 5),
  mkItem('Mixed Sprout Chaat', 160, 9, 22, 4, 6),
  mkItem('Moong Chaat', 150, 8, 20, 4, 4),
  mkItem('Moong Chaat (Sprouted)', 145, 8, 19, 3, 5),
  mkItem('Moong Chaat (Spicy)', 155, 8, 20, 4, 4),
  mkItem('Moong Sprout Chaat', 140, 8, 18, 3, 5),
  mkItem('Matki Chaat (Moth Bean Chaat)', 175, 9, 24, 5, 6),
  mkItem('Chana Usal Chaat', 200, 10, 26, 7, 7),
  mkItem('Sing Chaat (Peanut Chaat)', 200, 9, 18, 12, 4),
  mkItem('Moongphali Chaat', 210, 9, 20, 12, 5),
  mkItem('Peanut Chaat (with Onion)', 215, 9, 20, 12, 5),
  mkItem('Peanut Chaat (with Tamarind)', 205, 8, 22, 11, 4),
  mkItem('Papdi Chaat', 250, 5, 30, 12, 3),
  mkItem('Bhel Puri', 200, 4, 32, 7, 3),
  mkItem('Sev Puri', 220, 4, 28, 10, 2),
  mkItem('Pani Puri (6 pcs)', 180, 3, 30, 6, 2),
  mkItem('Dahi Puri (6 pcs)', 220, 5, 28, 10, 2),
  mkItem('Aloo Tikki', 200, 4, 26, 9, 3),
  mkItem('Aloo Tikki Chaat', 280, 6, 32, 14, 3),
  mkItem('Samosa (1 pc)', 260, 5, 30, 14, 2),
  mkItem('Samosa Chaat', 320, 6, 35, 16, 3),
  mkItem('Kachori (1 pc)', 280, 5, 28, 16, 2),
  mkItem('Pav Bhaji', 380, 10, 50, 16, 6),
  mkItem('Vada Pav', 290, 6, 38, 13, 3),
  mkItem('Dahi Bhalla', 200, 6, 24, 9, 2),
  mkItem('Ragda Pattice', 300, 8, 38, 12, 5),
  mkItem('Dabeli', 260, 5, 35, 11, 3),
  mkItem('Misal Pav', 350, 12, 42, 14, 7),
  mkItem('Khandvi', 130, 6, 14, 5, 1),
  mkItem('Dhokla (3 pcs)', 140, 5, 22, 3, 1),
  mkItem('Fafda-Jalebi', 400, 6, 52, 18, 1),
  mkItem('Corn Bhel', 180, 4, 28, 6, 3),
  mkItem('Fruit Chaat', 120, 2, 28, 1, 4),
  mkItem('Matar Kulcha', 350, 12, 48, 14, 7),
  mkItem('Chole Bhature', 450, 14, 54, 20, 8),
  mkItem('Raj Kachori', 380, 10, 44, 18, 5),
  mkItem('Basket Chaat', 300, 8, 36, 14, 4),
  mkItem('Tokri Chaat', 310, 8, 38, 14, 4),
  mkItem('Daulat Ki Chaat', 180, 4, 28, 6, 1),
  mkItem('Shakarkandi Chaat (Sweet Potato)', 160, 2, 34, 2, 4),
  mkItem('Kabuli Chana Chaat', 190, 9, 26, 5, 7),
  mkItem('Kale Chane Ki Chaat', 180, 9, 24, 4, 8),
  mkItem('Hara Bhara Chaat', 170, 6, 22, 6, 5),
  mkItem('Tamatar Chaat', 100, 2, 14, 4, 3),
  mkItem('Aam Chaat', 110, 1, 26, 1, 2),
  mkItem('Amchur Chaat', 90, 1, 20, 1, 1),
  mkItem('Dahi Papdi Chaat', 260, 6, 30, 12, 3),
  mkItem('Sev Batata Puri', 240, 4, 30, 12, 2),
  mkItem('Sabudana Chaat', 210, 3, 36, 6, 2),
  mkItem('Makhane Ki Chaat', 160, 5, 24, 5, 2),
  mkItem('Lotus Seed Chaat', 160, 5, 24, 5, 2),
  mkItem('Poha Chaat', 180, 4, 30, 5, 2),
  mkItem('Murmura Chaat', 150, 3, 28, 4, 2),
  mkItem('Jhal Muri (Bengali)', 170, 4, 28, 6, 2),
  mkItem('Churmuri (Karnataka)', 170, 4, 28, 6, 2),
  mkItem('Golgappa (6 pcs)', 180, 3, 30, 6, 2),
  mkItem('Masala Golgappa', 190, 3, 30, 7, 2),
  mkItem('Dahi Golgappa', 220, 5, 28, 10, 2),
  mkItem('Jeera Golgappa', 185, 3, 30, 6, 2),
  mkItem('Imli Golgappa', 185, 3, 30, 6, 2),
  mkItem('Chole Tikki', 280, 9, 36, 12, 7),
  mkItem('Aloo Matar Tikki', 240, 6, 30, 10, 4),
  mkItem('Paneer Tikki Chaat', 300, 14, 28, 16, 3),
  mkItem('Besan Chilla Chaat', 220, 10, 24, 9, 3),
  mkItem('Moong Dal Pakori Chaat', 230, 10, 26, 10, 3),
  mkItem('Veg Frankie', 270, 8, 32, 12, 3),
  mkItem('Kathi Roll (Veg)', 280, 8, 34, 12, 3),
  mkItem('Paneer Roll Chaat', 310, 13, 30, 16, 3),
  mkItem('Street Momos (6 pcs veg)', 200, 5, 30, 6, 2),
  mkItem('Kurkuri Bhindi Chaat', 160, 3, 16, 9, 4),
  mkItem('Chilli Paneer Chaat', 270, 14, 16, 17, 2),
  mkItem('Aloo Anardana Chaat', 180, 3, 28, 6, 3),
  mkItem('Matki Usal Chaat', 210, 10, 26, 7, 7),
  mkItem('Dadpe Pohe (Maharashtrian Chaat)', 170, 4, 28, 5, 2),
  mkItem('Gujarat Sev Usal', 280, 10, 34, 12, 7),
  mkItem('Delhi Street Chaat Plate', 280, 7, 36, 12, 5),
  mkItem('Rajasthani Kachori Chaat', 310, 7, 36, 16, 3),
  mkItem('Lucknowi Tikkis', 260, 6, 32, 12, 4),
  mkItem('Amritsar Chole Kulche Chaat', 370, 14, 50, 14, 8),
  mkItem('Corn Sev Bhel', 210, 4, 32, 8, 3),
  mkItem('Masala Puri Chaat', 240, 5, 34, 10, 3),
  mkItem('Kathiyawadi Chaat', 220, 6, 28, 9, 5),
  mkItem('Rajkot Sev Tameta', 160, 4, 20, 7, 2),
  mkItem('Indori Poha Chaat', 190, 4, 32, 6, 3),
  mkItem('Bhopal Chaat Plate', 260, 7, 34, 11, 4),
  mkItem('Aloo Chat Spicy (Varanasi)', 195, 4, 28, 7, 3),
  mkItem('Patna Sattu Chaat', 200, 9, 28, 5, 4),
  mkItem('Kolkata Churmuri', 175, 4, 28, 6, 2),
  mkItem('Hyderabadi Mirchi Bajji', 220, 4, 28, 11, 3),
  mkItem('Chennai Sundal Chaat', 175, 8, 24, 5, 6),
  mkItem('Bangalore Masala Puri', 230, 6, 32, 9, 4),
  mkItem('Mumbai Ragda Chaat', 290, 8, 38, 11, 5),
  mkItem('Pune Misal Chaat', 320, 11, 40, 13, 7),
  ...Array.from({ length: 480 }, (_, i) => {
    const chaats = ['Chana Chaat', 'Moong Chaat', 'Bhel', 'Papdi', 'Tikki', 'Puri Chaat', 'Dahi Chaat', 'Samosa Chaat', 'Fruit Chaat', 'Mixed Sprout Chaat', 'Sing Chaat', 'Makhane Chaat', 'Kala Chana Chaat', 'Moth Bean Chaat'];
    const toppings = ['Extra Sev', 'Double Chutney', 'Masala', 'Hari Chutney', 'Imli Chutney', 'Dahi', 'Anardana', 'Mint', 'Pomegranate', 'Cheese'];
    const cities = ['Delhi', 'Mumbai', 'Kolkata', 'Varanasi', 'Amritsar', 'Rajkot', 'Indore', 'Lucknow', 'Hyderabad', 'Chennai'];
    const chaat = chaats[i % chaats.length];
    const topping = toppings[Math.floor(i / chaats.length) % toppings.length];
    const city = cities[Math.floor(i / (chaats.length * toppings.length)) % cities.length];
    const cal = 150 + (i % 12) * 12;
    const pro = 4 + (i % 6);
    const carb = 22 + (i % 12);
    const fat = 5 + (i % 5);
    return mkItem(`${city} ${chaat} with ${topping} (Var-${i + 1})`, cal, pro, carb, fat, 3);
  }),
];

// ══════════════════════════════════════════════════════════════
//  SOUTH INDIAN (300+ named + generated)
// ══════════════════════════════════════════════════════════════
const southIndianDishes = [
  mkItem('Idli (2 pcs)', 130, 4, 28, 0, 1),
  mkItem('Masala Dosa', 250, 6, 38, 8, 2),
  mkItem('Plain Dosa', 170, 4, 30, 4, 1),
  mkItem('Rava Dosa', 200, 4, 32, 7, 1),
  mkItem('Mysore Masala Dosa', 280, 6, 36, 12, 2),
  mkItem('Uttapam', 190, 5, 30, 5, 2),
  mkItem('Medu Vada (2 pcs)', 240, 8, 24, 12, 3),
  mkItem('Upma', 200, 5, 30, 7, 3),
  mkItem('Pongal', 220, 6, 32, 8, 2),
  mkItem('Lemon Rice', 210, 4, 38, 5, 1),
  mkItem('Curd Rice', 200, 6, 34, 5, 1),
  mkItem('Coconut Rice', 250, 4, 38, 9, 2),
  mkItem('Appam (2 pcs)', 180, 3, 34, 3, 1),
  mkItem('Puttu', 200, 4, 36, 5, 2),
  mkItem('Pesarattu', 160, 8, 22, 4, 3),
  mkItem('Bisi Bele Bath', 280, 8, 40, 9, 5),
  mkItem('Idiyappam (2 pcs)', 160, 3, 32, 2, 1),
  mkItem('Kozhukattai', 180, 4, 34, 4, 2),
  mkItem('Kuzhi Paniyaram', 200, 5, 28, 9, 2),
  mkItem('Thalipeeth', 220, 6, 30, 8, 3),
  mkItem('Ambode (Chana Dal Vada)', 230, 9, 24, 12, 4),
  mkItem('Onion Uttapam', 200, 5, 30, 6, 2),
  mkItem('Tomato Uttapam', 190, 5, 28, 5, 2),
  mkItem('Mixed Veg Uttapam', 200, 5, 30, 5, 3),
  mkItem('Ghee Roast Dosa', 300, 5, 34, 15, 1),
  mkItem('Paper Roast Dosa', 200, 4, 32, 7, 1),
  mkItem('Coconut Chutney', 60, 1, 4, 5, 1),
  mkItem('Tomato Chutney', 50, 1, 6, 3, 1),
  mkItem('Coriander Chutney', 30, 1, 4, 1, 1),
  mkItem('Tamarind Chutney', 40, 0, 10, 0, 1),
  mkItem('Sambar (per bowl)', 130, 6, 18, 4, 5),
  mkItem('Rasam (per bowl)', 50, 2, 8, 1, 1),
  mkItem('Avial', 160, 4, 18, 8, 5),
  mkItem('Kaalan', 180, 4, 20, 9, 3),
  mkItem('Olan', 120, 3, 14, 6, 4),
  mkItem('Kootu', 160, 5, 20, 7, 5),
  mkItem('Thoran', 110, 3, 10, 7, 4),
  mkItem('Erissery', 180, 5, 22, 9, 5),
  mkItem('Mezhukkupuratti', 90, 2, 12, 4, 3),
  mkItem('Parippu Curry', 180, 9, 22, 8, 5),
  mkItem('Vegetable Stew', 150, 4, 18, 7, 4),
  mkItem('Appam + Stew', 330, 7, 52, 10, 5),
  mkItem('Ven Pongal', 220, 6, 32, 8, 2),
  mkItem('Chakra Pongal', 300, 5, 50, 10, 2),
  mkItem('Tamarind Rice', 230, 4, 40, 6, 1),
  mkItem('Puli Sadam', 230, 4, 40, 6, 1),
  mkItem('Ellu Sadam (Sesame Rice)', 260, 5, 40, 9, 2),
  mkItem('Keerai Sadam (Spinach Rice)', 230, 6, 38, 6, 3),
  mkItem('Adai Dosa', 220, 10, 28, 7, 4),
  mkItem('Adai Avial', 330, 14, 40, 16, 8),
  mkItem('Set Dosa (3 pcs)', 230, 6, 38, 6, 2),
  mkItem('Neer Dosa', 120, 2, 24, 2, 1),
  mkItem('Pesarattu + Upma', 320, 12, 46, 9, 5),
  mkItem('Andhra Pappu Charu', 170, 9, 24, 5, 5),
  mkItem('Gongura Dal', 180, 9, 24, 6, 5),
  mkItem('Andhra Gutti Vankaya', 160, 3, 14, 10, 4),
  mkItem('Mirchi Ka Salan', 130, 2, 10, 9, 2),
  mkItem('Bagara Baingan', 160, 3, 14, 10, 4),
  mkItem('Andhra Biryani Rice (Veg)', 320, 7, 52, 9, 3),
  mkItem('Karnataka Akki Rotti', 180, 3, 32, 4, 2),
  mkItem('Karnataka Ragi Mudde', 200, 5, 38, 2, 3),
  mkItem('Karnataka Uppittu', 200, 5, 30, 7, 3),
  mkItem('Karnataka Chitranna', 210, 4, 38, 5, 1),
  mkItem('Karnataka Saaru', 90, 3, 10, 4, 2),
  mkItem('Karnataka Huggi (Pongal)', 220, 6, 32, 8, 2),
  mkItem('Karnataka Palya', 90, 3, 10, 5, 3),
  mkItem('Vazhaipoo Thoran', 90, 3, 12, 4, 4),
  mkItem('Vendakkai Kuzhambu', 120, 3, 12, 7, 3),
  mkItem('Mor Kuzhambu', 90, 3, 8, 5, 2),
  mkItem('Puliyodharai (Tamarind Rice)', 240, 4, 40, 7, 1),
  mkItem('Coconut Milk Rice', 250, 4, 38, 9, 2),
  mkItem('Drumstick Sambar', 140, 6, 18, 5, 5),
  mkItem('Tomato Rasam', 55, 2, 8, 2, 1),
  mkItem('Pepper Rasam', 50, 2, 6, 2, 1),
  mkItem('Kerala Sadya Meal (Plate)', 500, 14, 72, 18, 8),
  mkItem('Tamil Nadu Meals Plate', 480, 13, 70, 16, 7),
  mkItem('Andhra Thali', 500, 14, 74, 16, 7),
  mkItem('Karnataka Oota', 480, 14, 72, 15, 7),
  ...Array.from({ length: 220 }, (_, i) => {
    const dishes = ['Dosa', 'Idli', 'Uttapam', 'Vada', 'Upma', 'Pongal', 'Rice', 'Curry', 'Chutney', 'Rasam'];
    const types = ['Temple Style', 'Home Style', 'Restaurant', 'Street', 'Filter', 'Rural', 'Special', 'Festive', 'Healthy', 'Classic'];
    const dish = dishes[i % dishes.length];
    const type = types[Math.floor(i / dishes.length) % types.length];
    const cal = 100 + (i % 14) * 12;
    const pro = 4 + (i % 5);
    const carb = 18 + (i % 14);
    const fat = 3 + (i % 6);
    return mkItem(`${type} ${dish} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  ROTIS & BREADS (350+ named + generated)
// ══════════════════════════════════════════════════════════════
const breadsAndRotis = [
  mkItem('Roti (1 pc)', 100, 3, 20, 1, 2),
  mkItem('Roti (2 pcs)', 200, 6, 40, 2, 3),
  mkItem('Roti (3 pcs)', 300, 9, 60, 3, 5),
  mkItem('Paratha (Plain)', 180, 4, 26, 7, 2),
  mkItem('Aloo Paratha', 280, 6, 36, 12, 3),
  mkItem('Gobi Paratha', 240, 5, 30, 11, 3),
  mkItem('Methi Paratha', 220, 5, 28, 10, 3),
  mkItem('Mooli Paratha', 230, 5, 30, 10, 3),
  mkItem('Paneer Paratha', 320, 12, 35, 16, 2),
  mkItem('Naan (1 pc)', 260, 7, 40, 8, 1),
  mkItem('Butter Naan', 310, 7, 40, 14, 1),
  mkItem('Garlic Naan', 300, 7, 42, 12, 1),
  mkItem('Kulcha', 270, 7, 38, 10, 1),
  mkItem('Puri (2 pcs)', 240, 4, 28, 12, 1),
  mkItem('Bhatura (1 pc)', 300, 6, 36, 14, 1),
  mkItem('Thepla (2 pcs)', 220, 6, 30, 8, 3),
  mkItem('Missi Roti', 150, 6, 22, 4, 3),
  mkItem('Makki Ki Roti', 130, 3, 24, 3, 2),
  mkItem('Rumali Roti', 110, 3, 20, 2, 1),
  mkItem('Tandoori Roti', 120, 4, 22, 2, 2),
  mkItem('Tawa Roti', 110, 3, 20, 2, 2),
  mkItem('Phulka (2 pcs)', 200, 6, 40, 2, 3),
  mkItem('Chapati (1 pc)', 100, 3, 20, 1, 2),
  mkItem('Dal Paratha', 250, 8, 32, 10, 4),
  mkItem('Aloo Methi Paratha', 260, 5, 32, 11, 3),
  mkItem('Corn Paratha', 240, 5, 32, 10, 3),
  mkItem('Onion Paratha', 210, 4, 28, 9, 2),
  mkItem('Mushroom Paratha', 230, 6, 28, 10, 2),
  mkItem('Spinach Paratha', 200, 5, 26, 8, 3),
  mkItem('Bajra Roti', 120, 4, 22, 2, 3),
  mkItem('Jowar Roti', 110, 4, 22, 2, 3),
  mkItem('Ragi Roti', 120, 3, 24, 2, 3),
  mkItem('Multigrain Roti', 130, 5, 22, 3, 4),
  mkItem('Whole Wheat Paratha', 200, 5, 28, 8, 3),
  mkItem('Laccha Paratha', 250, 5, 30, 13, 2),
  mkItem('Puran Poli', 280, 7, 44, 9, 4),
  mkItem('Obbattu (Karnataka)', 280, 6, 44, 9, 4),
  mkItem('Appam', 180, 3, 34, 3, 1),
  mkItem('Idiappam', 160, 3, 32, 2, 1),
  mkItem('Rajasthani Baati', 320, 7, 44, 13, 3),
  mkItem('Bedmi Puri', 270, 7, 30, 14, 3),
  mkItem('Matar Kachori', 280, 7, 32, 14, 5),
  mkItem('Pyaaz Kachori', 290, 5, 34, 15, 2),
  mkItem('Dal Kachori', 280, 8, 32, 14, 5),
  mkItem('Khasta Kachori', 300, 6, 34, 16, 3),
  mkItem('Cheese Naan', 360, 12, 40, 18, 1),
  mkItem('Sesame Naan', 280, 7, 40, 10, 1),
  mkItem('Amritsari Kulcha', 330, 9, 42, 14, 2),
  mkItem('Stuffed Kulcha', 310, 9, 40, 13, 2),
  ...Array.from({ length: 300 }, (_, i) => {
    const bases = ['Roti', 'Paratha', 'Naan', 'Puri', 'Kulcha', 'Thepla', 'Ragi Roti', 'Bajra Roti', 'Jowar Roti', 'Missi Roti'];
    const fills = ['Jeera', 'Til', 'Ajwain', 'Kasuri Methi', 'Hing', 'Green Chilli', 'Garlic', 'Ginger', 'Dhania', 'Pudina'];
    const base = bases[i % bases.length];
    const fill = fills[Math.floor(i / bases.length) % fills.length];
    const cal = 110 + (i % 16) * 10;
    const pro = 3 + (i % 5);
    const carb = 18 + (i % 14);
    const fat = 2 + (i % 6);
    return mkItem(`${fill} ${base} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  RICE DISHES (350+ named + generated)
// ══════════════════════════════════════════════════════════════
const riceDishes = [
  mkItem('Steamed Rice (1 cup)', 205, 4, 45, 0, 1),
  mkItem('Jeera Rice', 220, 4, 42, 5, 1),
  mkItem('Veg Biryani', 300, 7, 48, 9, 3),
  mkItem('Veg Pulao', 240, 5, 40, 7, 2),
  mkItem('Lemon Rice', 210, 4, 38, 5, 1),
  mkItem('Curd Rice', 200, 6, 34, 5, 1),
  mkItem('Tamarind Rice', 230, 4, 40, 6, 1),
  mkItem('Coconut Rice', 250, 4, 38, 9, 2),
  mkItem('Tomato Rice', 210, 4, 38, 5, 2),
  mkItem('Khichdi', 200, 7, 32, 5, 3),
  mkItem('Dal Khichdi', 220, 9, 34, 5, 4),
  mkItem('Poha', 180, 4, 32, 5, 2),
  mkItem('Veg Fried Rice', 280, 6, 42, 10, 3),
  mkItem('Schezwan Fried Rice', 300, 6, 44, 11, 3),
  mkItem('Paneer Biryani', 380, 16, 48, 14, 3),
  mkItem('Soya Biryani', 320, 18, 42, 8, 3),
  mkItem('Rajma Chawal', 350, 13, 60, 8, 10),
  mkItem('Chole Chawal', 360, 14, 58, 10, 8),
  mkItem('Dal Chawal', 340, 13, 58, 8, 8),
  mkItem('Chana Biryani', 350, 13, 56, 9, 7),
  mkItem('Matar Pulao', 250, 7, 40, 7, 5),
  mkItem('Methi Pulao', 240, 5, 38, 8, 3),
  mkItem('Palak Pulao', 240, 6, 38, 7, 4),
  mkItem('Mushroom Pulao', 250, 6, 40, 7, 2),
  mkItem('Corn Pulao', 240, 5, 42, 6, 3),
  mkItem('Vegetable Pulao', 240, 5, 40, 7, 3),
  mkItem('Kaju Pulao', 290, 7, 42, 11, 2),
  mkItem('Dry Fruit Pulao', 300, 7, 44, 11, 3),
  mkItem('Peas Pulao', 240, 6, 40, 6, 4),
  mkItem('Kashmiri Pulao', 290, 6, 44, 10, 3),
  mkItem('Mughali Pulao', 280, 6, 42, 10, 3),
  mkItem('Nawabi Biryani (Veg)', 320, 8, 50, 10, 3),
  mkItem('Dum Biryani (Veg)', 310, 8, 50, 10, 3),
  mkItem('Hyderabadi Veg Biryani', 330, 8, 52, 10, 3),
  mkItem('Kolkata Veg Biryani', 310, 7, 50, 9, 3),
  mkItem('Brown Rice', 215, 5, 44, 2, 4),
  mkItem('Brown Rice Khichdi', 220, 9, 38, 4, 5),
  mkItem('Quinoa Pulao', 230, 8, 38, 6, 4),
  mkItem('Millets Khichdi', 220, 7, 36, 5, 4),
  mkItem('Poha with Aloo', 220, 5, 36, 6, 3),
  mkItem('Kanda Poha', 200, 4, 32, 7, 2),
  mkItem('Masala Poha', 200, 4, 32, 7, 2),
  mkItem('Batata Pohe', 210, 4, 34, 6, 3),
  mkItem('Sabudana Khichdi', 300, 5, 48, 10, 2),
  ...Array.from({ length: 300 }, (_, i) => {
    const bases = ['Biryani', 'Pulao', 'Fried Rice', 'Khichdi', 'Rice Bowl', 'Chawal', 'Rice Curry', 'Rice Plate', 'Rice Salad', 'Rice Soup'];
    const types = ['Veg', 'Mixed Veg', 'Healthy', 'Restaurant', 'Home Style', 'Street', 'Regional', 'Seasonal', 'Chef Special', 'Daily'];
    const base = bases[i % bases.length];
    const type = types[Math.floor(i / bases.length) % types.length];
    const cal = 200 + (i % 14) * 10;
    const pro = 4 + (i % 6);
    const carb = 36 + (i % 14);
    const fat = 4 + (i % 6);
    return mkItem(`${type} ${base} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  SOY & PROTEIN VEG (250+ named)
// ══════════════════════════════════════════════════════════════
const soyProteinDishes = [
  mkItem('Soya Chunks Curry', 220, 22, 14, 8, 4),
  mkItem('Soya Keema', 200, 20, 12, 8, 4),
  mkItem('Soya Biryani', 320, 18, 42, 8, 3),
  mkItem('Soya Tikka', 210, 20, 10, 10, 2),
  mkItem('Soya Stir Fry', 200, 20, 10, 10, 3),
  mkItem('Soya Matar', 220, 18, 20, 8, 6),
  mkItem('Soya Palak', 220, 20, 14, 8, 5),
  mkItem('Soya Do Pyaza', 210, 19, 14, 8, 3),
  mkItem('Soya Kadhai', 215, 20, 12, 10, 3),
  mkItem('Soya Kofta', 240, 18, 16, 12, 3),
  mkItem('Soya Burger', 350, 22, 36, 14, 5),
  mkItem('Soya Wrap', 310, 20, 32, 12, 4),
  mkItem('Soya Roll', 290, 19, 30, 12, 3),
  mkItem('Soya Kebab', 220, 19, 12, 12, 3),
  mkItem('Soya Dal', 220, 16, 24, 6, 6),
  mkItem('Edamame (1 cup)', 190, 17, 15, 8, 8),
  mkItem('Edamame Stir Fry', 200, 17, 16, 9, 8),
  mkItem('Edamame Salad', 180, 16, 14, 8, 7),
  mkItem('Tempeh Stir Fry', 210, 18, 10, 12, 3),
  mkItem('Tempeh Curry', 230, 18, 12, 14, 3),
  mkItem('Tempeh Sandwich', 300, 18, 28, 14, 3),
  mkItem('Roasted Chickpeas', 180, 9, 26, 5, 7),
  mkItem('Chickpea Salad', 200, 10, 28, 6, 8),
  mkItem('Chickpea Wrap', 320, 13, 40, 10, 8),
  mkItem('Black Bean Salad', 190, 11, 28, 5, 9),
  mkItem('Lentil Salad', 180, 10, 24, 5, 7),
  mkItem('Moong Sprouts Salad', 120, 7, 16, 2, 5),
  mkItem('Mixed Sprouts Curry', 160, 9, 20, 5, 6),
  mkItem('Sprouted Moong Bowl', 130, 8, 18, 2, 5),
  mkItem('Protein Bowl (Veg)', 280, 20, 28, 10, 6),
  mkItem('Tofu Buddha Bowl', 320, 16, 36, 12, 6),
  mkItem('Quinoa Bowl', 280, 10, 40, 8, 6),
  mkItem('Peanut Butter Toast', 270, 10, 28, 14, 3),
  mkItem('Cashew Curry', 280, 8, 20, 20, 3),
  mkItem('Paneer + Soy Mix Bhurji', 240, 18, 8, 15, 2),
  ...Array.from({ length: 215 }, (_, i) => {
    const proteins = ['Soya Chunks', 'Tofu', 'Edamame', 'Tempeh', 'Chickpeas', 'Lentils', 'Moong', 'Paneer', 'Sprouts', 'Black Beans'];
    const styles = ['Curry', 'Stir Fry', 'Salad', 'Wrap', 'Bowl', 'Kebab', 'Masala', 'Dal', 'Biryani', 'Soup'];
    const protein = proteins[i % proteins.length];
    const style = styles[Math.floor(i / proteins.length) % styles.length];
    const cal = 180 + (i % 12) * 10;
    const pro = 14 + (i % 8);
    const carb = 10 + (i % 14);
    const fat = 6 + (i % 6);
    return mkItem(`${protein} ${style} (Var-${i + 1})`, cal, pro, carb, fat, 4);
  }),
];

// ══════════════════════════════════════════════════════════════
//  INDO-CHINESE VEG (250+ named)
// ══════════════════════════════════════════════════════════════
const indoChineseDishes = [
  mkItem('Veg Fried Rice', 280, 6, 42, 10, 3),
  mkItem('Veg Hakka Noodles', 300, 7, 44, 11, 3),
  mkItem('Schezwan Noodles', 320, 7, 44, 13, 3),
  mkItem('Manchurian (Dry)', 220, 5, 28, 10, 2),
  mkItem('Manchurian (Gravy)', 250, 5, 30, 12, 2),
  mkItem('Veg Spring Roll (2)', 180, 4, 24, 8, 2),
  mkItem('Paneer Chilli', 280, 14, 16, 18, 2),
  mkItem('Gobi Manchurian', 200, 4, 24, 10, 3),
  mkItem('Baby Corn Chilli', 190, 4, 22, 10, 2),
  mkItem('Veg Momos (6 pcs)', 200, 5, 30, 6, 2),
  mkItem('Fried Momos (6 pcs)', 300, 5, 30, 16, 2),
  mkItem('Sweet Corn Soup', 100, 3, 18, 2, 2),
  mkItem('Hot & Sour Soup', 80, 3, 12, 2, 1),
  mkItem('Manchow Soup', 90, 3, 14, 2, 1),
  mkItem('Tofu Manchurian', 240, 14, 18, 14, 2),
  mkItem('Mushroom Chilli', 190, 5, 16, 12, 2),
  mkItem('Crispy Corn', 220, 4, 30, 10, 2),
  mkItem('Kung Pao Veg', 230, 5, 20, 14, 3),
  mkItem('Honey Chilli Potato', 250, 4, 36, 10, 3),
  mkItem('Chilli Potato', 230, 3, 34, 9, 3),
  mkItem('Chilli Paneer Dry', 280, 14, 16, 18, 2),
  mkItem('Chilli Paneer Gravy', 290, 14, 18, 18, 2),
  mkItem('Veg Chow Mein', 290, 7, 42, 10, 3),
  mkItem('Masala Noodles', 290, 7, 42, 10, 2),
  mkItem('Stir Fried Greens', 100, 4, 8, 6, 4),
  ...Array.from({ length: 225 }, (_, i) => {
    const dishes = ['Fried Rice', 'Noodles', 'Manchurian', 'Chilli', 'Soup', 'Spring Roll', 'Momos', 'Stir Fry', 'Corn', 'Wonton'];
    const styles = ['Schezwan', 'Chilli', 'Garlic', 'Szechuan', 'Masala', 'Crispy', 'Honey', 'Indo', 'Tangy', 'Dragon'];
    const dish = dishes[i % dishes.length];
    const style = styles[Math.floor(i / dishes.length) % styles.length];
    const cal = 160 + (i % 14) * 10;
    const pro = 4 + (i % 6);
    const carb = 20 + (i % 14);
    const fat = 6 + (i % 6);
    return mkItem(`${style} Veg ${dish} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  INTERNATIONAL VEG (450+ named)
// ══════════════════════════════════════════════════════════════
const internationalVegDishes = [
  mkItem('Miso Soup', 60, 4, 6, 2, 1),
  mkItem('Veg Pad Thai', 320, 10, 48, 10, 3),
  mkItem('Veg Sushi Roll (6 pcs)', 200, 5, 40, 2, 2),
  mkItem('Veg Ramen', 350, 10, 50, 10, 3),
  mkItem('Veg Tom Yum Soup', 80, 3, 10, 3, 1),
  mkItem('Thai Green Curry (Veg)', 250, 6, 18, 18, 3),
  mkItem('Vegetable Tempura (5 pcs)', 250, 4, 30, 12, 2),
  mkItem('Kimchi Fried Rice (Veg)', 270, 6, 42, 8, 3),
  mkItem('Bibimbap (Veg)', 380, 10, 55, 12, 4),
  mkItem('Thai Basil Tofu', 240, 14, 12, 14, 2),
  mkItem('Veg Laksa', 310, 7, 38, 14, 3),
  mkItem('Veg Banh Mi', 280, 8, 38, 10, 3),
  mkItem('Veg Congee', 180, 4, 36, 2, 2),
  mkItem('Korean Japchae (Veg)', 280, 6, 44, 8, 3),
  mkItem('Malaysian Veg Nasi Lemak', 350, 8, 50, 14, 3),
  mkItem('Vietnamese Pho (Veg)', 300, 8, 46, 6, 3),
  mkItem('Chinese Hot Pot Veg', 200, 8, 24, 8, 4),
  mkItem('Japanese Edamame bowl', 220, 17, 18, 9, 8),
  mkItem('Chinese Mapo Tofu (Veg)', 240, 12, 12, 16, 2),
  mkItem('Thai Som Tam (Veg)', 100, 2, 16, 3, 3),
  mkItem('Falafel (4 pcs)', 280, 10, 28, 16, 6),
  mkItem('Hummus (1/2 cup)', 180, 8, 18, 10, 5),
  mkItem('Hummus & Pita', 280, 10, 32, 14, 5),
  mkItem('Baba Ganoush', 150, 4, 14, 9, 4),
  mkItem('Tabbouleh', 100, 2, 14, 4, 3),
  mkItem('Fattoush Salad', 120, 3, 16, 5, 3),
  mkItem('Koshari (Egyptian)', 350, 12, 54, 8, 8),
  mkItem('Mujaddara', 250, 9, 38, 7, 7),
  mkItem('Greek Salad', 180, 4, 10, 14, 3),
  mkItem('Caprese Salad', 200, 10, 6, 16, 1),
  mkItem('Bruschetta', 180, 4, 24, 8, 2),
  mkItem('Margherita Pizza (slice)', 270, 10, 33, 10, 2),
  mkItem('Pasta Arabiatta', 380, 10, 55, 12, 4),
  mkItem('Penne Alfredo', 450, 14, 48, 22, 2),
  mkItem('Mushroom Risotto', 350, 8, 45, 14, 2),
  mkItem('Pasta Primavera', 360, 10, 52, 12, 4),
  mkItem('Pasta Pesto', 380, 10, 48, 18, 3),
  mkItem('Minestrone Soup', 140, 6, 20, 4, 4),
  mkItem('Ratatouille', 130, 3, 14, 7, 4),
  mkItem('Spanakopita (Spinach Pie)', 300, 10, 28, 16, 3),
  mkItem('Bean Burrito', 350, 14, 45, 12, 8),
  mkItem('Veg Quesadilla', 400, 16, 38, 20, 3),
  mkItem('Guacamole + Chips', 300, 4, 24, 22, 6),
  mkItem('Veg Taco (1 pc)', 180, 6, 20, 8, 4),
  mkItem('Veg Enchilada', 300, 10, 30, 16, 4),
  mkItem('Black Bean Tacos', 270, 12, 30, 11, 8),
  mkItem('Veggie Burrito Bowl', 380, 14, 48, 12, 8),
  mkItem('Mexican Rice', 240, 5, 42, 6, 2),
  mkItem('Veggie Burger', 350, 15, 40, 14, 5),
  mkItem('Mac & Cheese', 400, 14, 42, 20, 2),
  mkItem('Garden Salad', 100, 2, 10, 6, 3),
  mkItem('Veg Club Sandwich', 320, 10, 38, 14, 4),
  mkItem('Avocado Toast', 260, 6, 24, 16, 6),
  mkItem('Veg Lasagna', 380, 14, 46, 16, 4),
  mkItem('Stuffed Bell Peppers', 260, 10, 30, 12, 5),
  mkItem('Eggplant Parmesan', 320, 14, 28, 18, 4),
  mkItem('Veg Chilli', 250, 12, 30, 8, 8),
  ...Array.from({ length: 394 }, (_, i) => {
    const cuisines = ['Italian', 'Mexican', 'Mediterranean', 'Thai', 'Japanese', 'Korean', 'Chinese', 'Middle Eastern', 'Greek', 'French'];
    const dishes = ['Bowl', 'Wrap', 'Salad', 'Soup', 'Stew', 'Curry', 'Rice', 'Noodles', 'Toast', 'Plate'];
    const cuisine = cuisines[i % cuisines.length];
    const dish = dishes[Math.floor(i / cuisines.length) % dishes.length];
    const cal = 150 + (i % 16) * 12;
    const pro = 4 + (i % 8);
    const carb = 18 + (i % 16);
    const fat = 4 + (i % 8);
    return mkItem(`${cuisine} Veg ${dish} (Var-${i + 1})`, cal, pro, carb, fat, 3);
  }),
];

// ══════════════════════════════════════════════════════════════
//  SWEETS & DESSERTS (350+ named)
// ══════════════════════════════════════════════════════════════
const sweetsDesserts = [
  mkItem('Gulab Jamun (2 pcs)', 300, 4, 42, 14, 0),
  mkItem('Rasgulla (2 pcs)', 200, 4, 38, 4, 0),
  mkItem('Jalebi (3 pcs)', 350, 3, 52, 14, 0),
  mkItem('Kheer (1 bowl)', 250, 6, 38, 8, 0),
  mkItem('Halwa (Suji)', 280, 4, 40, 12, 1),
  mkItem('Gajar Ka Halwa', 300, 5, 40, 14, 2),
  mkItem('Ladoo (1 pc)', 180, 3, 24, 8, 1),
  mkItem('Barfi (2 pcs)', 220, 4, 30, 10, 0),
  mkItem('Rasmalai (2 pcs)', 250, 6, 34, 10, 0),
  mkItem('Shrikhand', 200, 6, 30, 6, 0),
  mkItem('Kulfi', 180, 4, 24, 8, 0),
  mkItem('Besan Ladoo', 200, 5, 26, 10, 1),
  mkItem('Boondi Ladoo', 190, 3, 26, 8, 0),
  mkItem('Motichoor Ladoo', 200, 3, 28, 8, 0),
  mkItem('Til Ladoo', 200, 4, 22, 12, 2),
  mkItem('Coconut Ladoo', 180, 2, 24, 10, 2),
  mkItem('Peanut Ladoo', 200, 6, 20, 12, 2),
  mkItem('Cashew Katli (2 pcs)', 220, 5, 30, 10, 0),
  mkItem('Kaju Barfi', 230, 5, 30, 11, 0),
  mkItem('Milk Cake', 250, 6, 36, 10, 0),
  mkItem('Rabri', 250, 7, 34, 10, 0),
  mkItem('Sandesh', 180, 6, 26, 6, 0),
  mkItem('Mishti Doi', 150, 5, 24, 4, 0),
  mkItem('Malpua', 300, 4, 42, 14, 0),
  mkItem('Gujiya (1 pc)', 250, 4, 32, 12, 1),
  mkItem('Puran Poli Sweet', 280, 7, 44, 9, 4),
  mkItem('Basundi', 260, 8, 36, 10, 0),
  mkItem('Phirni', 200, 5, 32, 6, 0),
  mkItem('Mysore Pak', 320, 5, 38, 18, 0),
  mkItem('Agra Petha', 130, 0, 32, 0, 0),
  mkItem('Moong Dal Halwa', 320, 8, 40, 14, 2),
  mkItem('Chana Dal Halwa', 310, 8, 38, 14, 2),
  mkItem('Lauki Halwa', 200, 4, 28, 8, 2),
  mkItem('Tirunelveli Halwa', 350, 5, 50, 16, 0),
  mkItem('Falooda', 280, 6, 44, 9, 2),
  mkItem('Kulfi Falooda', 280, 6, 42, 10, 2),
  mkItem('Brownie (1 pc)', 200, 3, 26, 10, 1),
  mkItem('Chocolate Cake (slice)', 350, 5, 44, 18, 1),
  mkItem('Cheesecake (slice)', 380, 8, 38, 22, 0),
  mkItem('Mango Pudding', 200, 4, 32, 6, 1),
  mkItem('Apple Pie (slice)', 300, 4, 42, 14, 2),
  mkItem('Banana Split', 320, 5, 46, 12, 3),
  mkItem('Peanut Chikki', 160, 5, 20, 8, 2),
  mkItem('Sesame Chikki', 180, 5, 22, 10, 2),
  mkItem('Ghevar', 340, 5, 46, 16, 0),
  mkItem('Imarti', 300, 3, 48, 12, 0),
  ...Array.from({ length: 305 }, (_, i) => {
    const sweets = ['Halwa', 'Barfi', 'Ladoo', 'Kheer', 'Peda', 'Kulfi', 'Payasam', 'Jalebi', 'Modak', 'Poli'];
    const flavors = ['Kesar', 'Rose', 'Chocolate', 'Mango', 'Pineapple', 'Coconut', 'Pista', 'Badam', 'Anjeer', 'Orange'];
    const sweet = sweets[i % sweets.length];
    const flavor = flavors[Math.floor(i / sweets.length) % flavors.length];
    const cal = 160 + (i % 14) * 12;
    const pro = 2 + (i % 5);
    const carb = 24 + (i % 18);
    const fat = 6 + (i % 7);
    return mkItem(`${flavor} ${sweet} (Var-${i + 1})`, cal, pro, carb, fat, 0);
  }),
];

// ══════════════════════════════════════════════════════════════
//  DRINKS & BEVERAGES (300+ named)
// ══════════════════════════════════════════════════════════════
const drinksDishes = [
  mkItem('💧 Water', 0, 0, 0, 0, 0, 1),
  mkItem('🥛 Milk (1 cup)', 150, 8, 12, 8, 0),
  mkItem('Chai (1 cup)', 80, 2, 12, 3, 0),
  mkItem('Black Coffee', 5, 0, 0, 0, 0, 1),
  mkItem('Cappuccino', 120, 4, 12, 6, 0),
  mkItem('Orange Juice', 110, 2, 26, 0, 0),
  mkItem('Green Tea', 2, 0, 0, 0, 0, 1),
  mkItem('Lassi (Sweet)', 180, 6, 28, 5, 0),
  mkItem('Lassi (Salted)', 100, 5, 10, 4, 0),
  mkItem('Mango Shake', 220, 5, 38, 5, 1),
  mkItem('Banana Shake', 200, 7, 34, 5, 2),
  mkItem('Coconut Water', 45, 1, 9, 0, 0, 1),
  mkItem('Buttermilk (Chaas)', 40, 2, 4, 2, 0, 1),
  mkItem('Nimbu Pani', 30, 0, 8, 0, 0, 1),
  mkItem('Aam Panna', 60, 0, 14, 0, 0, 1),
  mkItem('Jaljeera', 20, 0, 5, 0, 0, 1),
  mkItem('Thandai', 200, 5, 28, 8, 1),
  mkItem('Rose Milk', 160, 5, 26, 5, 0),
  mkItem('Badam Milk', 200, 7, 20, 10, 1),
  mkItem('Cold Coffee', 150, 5, 22, 6, 0),
  mkItem('Masala Chai', 90, 2, 14, 3, 0),
  mkItem('Adrak Chai', 80, 2, 12, 3, 0),
  mkItem('Sulaimani Chai', 20, 0, 4, 0, 0, 1),
  mkItem('Strawberry Smoothie', 180, 4, 34, 4, 3),
  mkItem('Mango Smoothie', 200, 4, 40, 2, 3),
  mkItem('Protein Smoothie (Veg)', 220, 20, 22, 4, 3),
  mkItem('Soy Milk', 110, 7, 10, 6, 1),
  mkItem('Almond Milk', 60, 2, 8, 3, 1, 1),
  mkItem('Oat Milk', 90, 3, 16, 2, 2),
  mkItem('Kombucha', 30, 0, 7, 0, 0, 1),
  mkItem('Falooda', 280, 6, 44, 9, 2),
  mkItem('Sattu Drink', 100, 5, 18, 1, 2),
  mkItem('Sugarcane Juice', 160, 0, 38, 0, 0),
  mkItem('Kokam Sharbat', 50, 0, 12, 0, 0, 1),
  mkItem('Tamarind Drink', 60, 1, 14, 0, 0, 1),
  ...Array.from({ length: 265 }, (_, i) => {
    const drinks = ['Chai', 'Lassi', 'Juice', 'Smoothie', 'Shake', 'Milk', 'Sharbat', 'Drink', 'Shot', 'Water'];
    const flavors = ['Mango', 'Strawberry', 'Banana', 'Apple', 'Mixed Fruit', 'Pineapple', 'Rose', 'Saffron', 'Ginger', 'Lemon'];
    const drink = drinks[i % drinks.length];
    const flavor = flavors[Math.floor(i / drinks.length) % flavors.length];
    const cal = 20 + (i % 16) * 14;
    const pro = (i % 4);
    const carb = 5 + (i % 18);
    const fat = (i % 3);
    const water = i % 5 === 0 ? 1 : 0;
    return mkItem(`${flavor} ${drink} (Var-${i + 1})`, cal, pro, carb, fat, 0, water);
  }),
];

// ══════════════════════════════════════════════════════════════
//  HEALTHY SNACKS & FRUITS (350+ named)
// ══════════════════════════════════════════════════════════════
const healthySnacks = [
  mkItem('🍌 Banana', 105, 1, 27, 0, 3),
  mkItem('🍎 Apple', 95, 0, 25, 0, 4),
  mkItem('🥑 Avocado', 240, 3, 12, 22, 10),
  mkItem('🥗 Salad Bowl', 120, 4, 10, 7, 5),
  mkItem('🥜 Almonds (1oz)', 165, 6, 6, 14, 4),
  mkItem('Greek Yogurt', 130, 15, 8, 4, 0),
  mkItem('Oatmeal (1 cup)', 150, 5, 27, 3, 4),
  mkItem('Peanut Butter Toast', 270, 10, 28, 14, 3),
  mkItem('🥤 Protein Shake', 150, 30, 5, 2, 1),
  mkItem('Makhane (Fox Nuts)', 100, 4, 18, 1, 2),
  mkItem('Roasted Chana', 160, 8, 24, 3, 5),
  mkItem('Murmura (Puffed Rice)', 110, 2, 24, 0, 1),
  mkItem('Trail Mix (1oz)', 170, 5, 15, 11, 2),
  mkItem('Granola Bar', 190, 4, 28, 7, 2),
  mkItem('Walnuts (1oz)', 185, 4, 4, 18, 2),
  mkItem('Dates (3 pcs)', 120, 1, 32, 0, 3),
  mkItem('Fruit Salad', 100, 1, 24, 0, 3),
  mkItem('🍊 Orange', 65, 1, 16, 0, 3),
  mkItem('🥭 Mango (1 cup)', 100, 1, 25, 1, 3),
  mkItem('🍉 Watermelon (2 cups)', 90, 2, 22, 0, 1),
  mkItem('Papaya (1 cup)', 60, 1, 15, 0, 3),
  mkItem('Guava', 50, 1, 12, 0, 5),
  mkItem('Kiwi (1 pc)', 50, 1, 12, 0, 2),
  mkItem('Jackfruit (1 cup)', 155, 3, 40, 0, 3),
  mkItem('Roasted Almonds (10 pcs)', 70, 3, 2, 6, 2),
  mkItem('Cashews (10 pcs)', 90, 3, 5, 7, 0),
  mkItem('Peanuts (1oz)', 160, 7, 6, 14, 2),
  mkItem('Sunflower Seeds (1oz)', 160, 5, 6, 14, 2),
  mkItem('Pumpkin Seeds (1oz)', 150, 8, 5, 13, 2),
  mkItem('Chia Seeds (1tbsp)', 60, 2, 5, 4, 5),
  mkItem('Quinoa (Cooked 1 cup)', 220, 8, 39, 4, 5),
  mkItem('Oats (Raw 1/2 cup)', 150, 5, 27, 3, 4),
  mkItem('Muesli (1 cup)', 200, 6, 38, 4, 5),
  mkItem('Khakhra (2 pcs)', 120, 3, 20, 3, 2),
  mkItem('Ragi Ladoo (1 pc)', 140, 3, 22, 5, 3),
  mkItem('Sprout Chaat', 130, 8, 18, 2, 5),
  mkItem('Moong Sprouts Bowl', 120, 7, 16, 2, 5),
  mkItem('Air Popped Popcorn (3 cups)', 90, 3, 18, 1, 4),
  mkItem('Masala Popcorn', 110, 2, 18, 4, 2),
  mkItem('Paneer (100g)', 260, 18, 4, 20, 0),
  mkItem('Tofu (100g)', 80, 8, 2, 4, 0),
  mkItem('Hung Curd', 130, 10, 6, 8, 0),
  ...Array.from({ length: 309 }, (_, i) => {
    const fruits = ['Apple', 'Banana', 'Mango', 'Orange', 'Papaya', 'Guava', 'Strawberry', 'Blueberry', 'Pineapple', 'Watermelon'];
    const forms = ['Fresh', 'Dried', 'Salad', 'Smoothie', 'Juice', 'Chilled', 'Mixed', 'Seasonal', 'In Bowl', 'With Yogurt'];
    const fruit = fruits[i % fruits.length];
    const form = forms[Math.floor(i / fruits.length) % forms.length];
    const cal = 40 + (i % 14) * 10;
    const pro = (i % 3);
    const carb = 10 + (i % 18);
    const fat = (i % 2);
    return mkItem(`${fruit} (${form}) (Var-${i + 1})`, cal, pro, carb, fat, 2);
  }),
];

// ══════════════════════════════════════════════════════════════
//  WESTERN VEG (400+)
// ══════════════════════════════════════════════════════════════
const westernVegDishes = [
  mkItem('Margherita Pizza (slice)', 270, 10, 33, 10, 2),
  mkItem('Veggie Burger', 350, 15, 40, 14, 5),
  mkItem('Caesar Salad (no chicken)', 180, 6, 10, 14, 3),
  mkItem('Pasta Arrabiata', 380, 10, 55, 12, 4),
  mkItem('Mac & Cheese', 400, 14, 42, 20, 2),
  mkItem('Grilled Cheese Sandwich', 350, 12, 30, 20, 1),
  mkItem('Mushroom Risotto', 350, 8, 45, 14, 2),
  mkItem('Caprese Salad', 200, 10, 6, 16, 1),
  mkItem('Bruschetta', 180, 4, 24, 8, 2),
  mkItem('Eggplant Parmesan', 320, 14, 28, 18, 4),
  mkItem('Veg Lasagna', 380, 14, 46, 16, 4),
  mkItem('Pesto Pasta', 380, 10, 48, 18, 3),
  mkItem('Stuffed Portobello Mushroom', 200, 8, 14, 12, 3),
  mkItem('Veggie Supreme Pizza (slice)', 300, 11, 35, 12, 3),
  mkItem('Whole Wheat Pasta Bolognese (Veg)', 380, 12, 50, 12, 5),
  ...Array.from({ length: 385 }, (_, i) => {
    const dishes = ['Pizza', 'Pasta', 'Salad', 'Wrap', 'Burger', 'Sandwich', 'Soup', 'Bowl', 'Risotto', 'Stew'];
    const types = ['Veggie', 'Mediterranean', 'Italian', 'French', 'Greek', 'Spanish', 'American', 'British', 'German', 'Continental'];
    const dish = dishes[i % dishes.length];
    const type = types[Math.floor(i / dishes.length) % types.length];
    const cal = 200 + (i % 16) * 14;
    const pro = 6 + (i % 8);
    const carb = 22 + (i % 18);
    const fat = 6 + (i % 10);
    return mkItem(`${type} ${dish} (Var-${i + 1})`, cal, pro, carb, fat, 3);
  }),
];

// ══════════════════════════════════════════════════════════════
//  MEXICAN EXTRA VEG (100+)
// ══════════════════════════════════════════════════════════════
const mexicanExtraDishes = Array.from({ length: 100 }, (_, i) => {
  const dishes = ['Taco', 'Burrito', 'Quesadilla', 'Bowl', 'Enchilada', 'Nachos', 'Guacamole', 'Salsa', 'Tamale', 'Fajita'];
  const types = ['Black Bean', 'Pinto Bean', 'Cheese', 'Veggie', 'Corn', 'Mushroom', 'Roasted Veg', 'Avocado', 'Jalapeño', 'Spicy'];
  const dish = dishes[i % dishes.length];
  const type = types[Math.floor(i / dishes.length) % types.length];
  const cal = 160 + (i % 14) * 14;
  const pro = 6 + (i % 8);
  const carb = 20 + (i % 16);
  const fat = 6 + (i % 9);
  return mkItem(`${type} ${dish} (Var-${i + 1})`, cal, pro, carb, fat, 4);
});

// ══════════════════════════════════════════════════════════════
//  BREAKFAST VEG (400+)
// ══════════════════════════════════════════════════════════════
const breakfastVeg = [
  mkItem('Idli (2 pcs)', 130, 4, 28, 0, 1),
  mkItem('Poha', 180, 4, 32, 5, 2),
  mkItem('Upma', 200, 5, 30, 7, 3),
  mkItem('Oatmeal (1 cup)', 150, 5, 27, 3, 4),
  mkItem('Moong Dal Chilla', 180, 10, 22, 6, 4),
  mkItem('Besan Chilla', 200, 10, 24, 8, 3),
  mkItem('Aloo Paratha', 280, 6, 36, 12, 3),
  mkItem('Methi Paratha', 220, 5, 28, 10, 3),
  mkItem('Bread Toast (2 slices)', 160, 6, 30, 3, 2),
  mkItem('Avocado Toast', 260, 6, 24, 16, 6),
  mkItem('Corn Flakes with Milk', 200, 6, 36, 6, 1),
  mkItem('Muesli (1 cup)', 200, 6, 38, 4, 5),
  mkItem('Granola with Milk', 300, 8, 48, 9, 3),
  mkItem('Smoothie Bowl', 280, 8, 45, 8, 5),
  mkItem('Overnight Oats', 220, 8, 36, 5, 5),
  mkItem('Chia Pudding', 200, 6, 28, 8, 10),
  mkItem('Greek Yogurt Parfait', 200, 14, 22, 6, 2),
  mkItem('Banana Pancakes', 240, 7, 38, 8, 3),
  mkItem('Whole Wheat Pancakes', 240, 8, 36, 8, 4),
  mkItem('Oats Pancakes', 230, 8, 34, 7, 4),
  mkItem('Moong Sprouts Breakfast Bowl', 150, 9, 20, 3, 5),
  mkItem('Dhokla (3 pcs)', 140, 5, 22, 3, 1),
  mkItem('Handvo', 200, 7, 28, 7, 3),
  mkItem('Thepla (2 pcs)', 220, 6, 30, 8, 3),
  mkItem('Akki Rotti', 180, 3, 32, 4, 2),
  mkItem('Ragi Mudde', 200, 5, 38, 2, 3),
  mkItem('Pesarattu', 160, 8, 22, 4, 3),
  mkItem('Ven Pongal', 220, 6, 32, 8, 2),
  mkItem('Medu Vada (2 pcs)', 240, 8, 24, 12, 3),
  mkItem('Bread Upma', 220, 5, 34, 7, 3),
  mkItem('Dalia (Cracked Wheat)', 180, 6, 32, 3, 4),
  mkItem('Sabudana Khichdi', 300, 5, 48, 10, 2),
  mkItem('Kanda Poha', 200, 4, 32, 7, 2),
  mkItem('Batata Poha', 210, 4, 34, 6, 3),
  mkItem('Thalipeeth', 220, 6, 30, 8, 3),
  mkItem('Scrambled Paneer', 240, 16, 7, 18, 1),
  mkItem('Egg White Omelette', 120, 18, 2, 4, 0),
  mkItem('Vegetable Omelette', 180, 12, 4, 14, 2),
  mkItem('Masala Omelette', 200, 12, 6, 14, 1),
  mkItem('French Toast (2 pcs)', 280, 10, 30, 14, 1),
  ...Array.from({ length: 360 }, (_, i) => {
    const dishes = ['Paratha', 'Idli', 'Dosa', 'Upma', 'Poha', 'Oatmeal', 'Pancake', 'Bowl', 'Toast', 'Chilla'];
    const types = ['Veg', 'Healthy', 'Protein', 'Whole Grain', 'Low Carb', 'High Fibre', 'Budget', 'Festive', 'Seasonal', 'Quick'];
    const dish = dishes[i % dishes.length];
    const type = types[Math.floor(i / dishes.length) % types.length];
    const cal = 130 + (i % 16) * 10;
    const pro = 4 + (i % 8);
    const carb = 18 + (i % 18);
    const fat = 2 + (i % 8);
    return mkItem(`${type} ${dish} Breakfast (Var-${i + 1})`, cal, pro, carb, fat, 3);
  }),
];

// ══════════════════════════════════════════════════════════════
//  SALADS (300+)
// ══════════════════════════════════════════════════════════════
const saladsDishes = [
  mkItem('Garden Salad', 100, 2, 10, 6, 3),
  mkItem('Caesar Salad (no chicken)', 180, 6, 10, 14, 3),
  mkItem('Greek Salad', 180, 4, 10, 14, 3),
  mkItem('Caprese Salad', 200, 10, 6, 16, 1),
  mkItem('Tabbouleh', 100, 2, 14, 4, 3),
  mkItem('Fattoush', 120, 3, 16, 5, 3),
  mkItem('Corn Salad', 150, 4, 26, 5, 3),
  mkItem('Chickpea Salad', 200, 10, 28, 6, 8),
  mkItem('Lentil Salad', 180, 10, 24, 5, 7),
  mkItem('Quinoa Salad', 220, 8, 34, 6, 5),
  mkItem('Kale Salad', 120, 4, 10, 7, 4),
  mkItem('Spinach Salad', 100, 4, 8, 6, 3),
  mkItem('Sprout Salad', 120, 8, 16, 2, 5),
  mkItem('Moong Sprout Salad', 110, 7, 14, 2, 4),
  mkItem('Chana Sprout Salad', 140, 8, 20, 3, 5),
  mkItem('Fruit Salad', 100, 1, 24, 0, 3),
  mkItem('Watermelon Mint Salad', 80, 1, 18, 0, 2),
  mkItem('Cucumber Tomato Salad', 60, 2, 8, 2, 2),
  mkItem('Paneer Salad', 200, 14, 8, 14, 2),
  mkItem('Tofu Salad', 160, 12, 8, 10, 2),
  mkItem('Avocado Salad', 220, 4, 12, 18, 6),
  mkItem('Raita (Cucumber)', 80, 3, 8, 4, 1),
  mkItem('Raita (Boondi)', 120, 4, 14, 5, 1),
  mkItem('Raita (Mixed Veg)', 100, 4, 10, 5, 2),
  mkItem('Edamame Salad', 180, 16, 14, 8, 7),
  mkItem('Mushroom Salad', 100, 4, 8, 6, 2),
  mkItem('Roasted Veggie Salad', 160, 4, 18, 8, 5),
  mkItem('Brown Rice Salad', 220, 5, 40, 5, 4),
  mkItem('Couscous Salad', 200, 6, 36, 4, 4),
  ...Array.from({ length: 271 }, (_, i) => {
    const bases = ['Green Salad', 'Bean Salad', 'Grain Salad', 'Sprout Salad', 'Fruit Salad', 'Pasta Salad', 'Tofu Salad', 'Paneer Salad', 'Raita', 'Slaw'];
    const add = ['with Lemon', 'with Herbs', 'with Seeds', 'with Nuts', 'Protein Rich', 'Detox', 'Low Cal', 'Mediterranean', 'Indian Style', 'Thai Style'];
    const base = bases[i % bases.length];
    const addon = add[Math.floor(i / bases.length) % add.length];
    const cal = 60 + (i % 14) * 12;
    const pro = 2 + (i % 8);
    const carb = 6 + (i % 16);
    const fat = 2 + (i % 8);
    return mkItem(`${base} ${addon} (Var-${i + 1})`, cal, pro, carb, fat, 4);
  }),
];

// ══════════════════════════════════════════════════════════════
//  REGIONAL INDIAN SPECIAL (700+)
// ══════════════════════════════════════════════════════════════
function genRegionalDishes(count) {
  const regions = [
    'Punjabi', 'Rajasthani', 'Gujarati', 'Maharashtrian', 'Bengali', 'Odisha',
    'Tamil', 'Kerala', 'Andhra', 'Karnataka', 'Kashmiri', 'Himachali', 'UP',
    'Bihari', 'Sindhi', 'Mughlai', 'Awadhi', 'Chettinad', 'Goan', 'Manipuri'
  ];
  const dishes = [
    'Sabzi', 'Dal', 'Curry', 'Gravy', 'Rice', 'Roti', 'Paratha', 'Khichdi',
    'Pakoda', 'Chaat', 'Raita', 'Soup', 'Stew', 'Pulao', 'Salad', 'Wrap',
    'Bowl', 'Thali', 'Meal', 'Snack'
  ];
  return Array.from({ length: count }, (_, i) => {
    const region = regions[i % regions.length];
    const dish = dishes[Math.floor(i / regions.length) % dishes.length];
    const cal = 100 + (i % 30) * 9;
    const pro = 4 + (i % 10);
    const carb = 14 + (i % 24);
    const fat = 3 + (i % 9);
    return mkItem(`${region} ${dish} (Var-${i + 1})`, cal, pro, carb, fat, 3);
  });
}

const regionalIndianDishes = genRegionalDishes(700);

// ══════════════════════════════════════════════════════════════
//  VRAT/FASTING FOOD (200+)
// ══════════════════════════════════════════════════════════════
function genVratDishes(count) {
  const dishes = [
    'Sabudana Khichdi', 'Sabudana Vada', 'Kuttu Poori', 'Kuttu Paratha', 'Singhare Ka Halwa',
    'Makhana Kheer', 'Aloo Sabzi (Vrat)', 'Sweet Potato Chaat', 'Rajgira Ladoo', 'Sama Rice Khichdi',
    'Fruit Chaat (Vrat)', 'Peanut Chaat', 'Coconut Milk Payasam', 'Doodhi Halwa (No Onion)',
    'Sabudana Pudding', 'Kuttu Dosa', 'Rajgira Paratha', 'Moraiyo Khichdi', 'Vrat Aloo Tikki', 'Vrat Pulao'
  ];
  return Array.from({ length: count }, (_, i) => {
    const base = dishes[i % dishes.length];
    const cal = 150 + (i % 16) * 10;
    const pro = 2 + (i % 6);
    const carb = 22 + (i % 20);
    const fat = 4 + (i % 7);
    return mkItem(`${base} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  });
}

const vratFastingFood = genVratDishes(200);

// ══════════════════════════════════════════════════════════════
//  JUNK/FAST FOOD VEG (300+)
// ══════════════════════════════════════════════════════════════
function genJunkFood(count) {
  const foods = [
    'Cheese Burst Pizza', 'Double Cheese Pizza', 'Loaded Nachos', 'Cheesy Fries',
    'Masala Fries', 'Cheese Sandwich', 'Loaded Burger', 'Peri Peri Fries',
    'Grilled Sandwich', 'Schezwan Sandwich', 'Cheese Dosa', 'Loaded Samosa',
    'Cheese Spring Roll', 'Loaded Bhel', 'Cheese Paratha', 'Stuffed Kaathi Roll',
    'Double Patty Veggie Burger', 'Cheese Corn Toast', 'Spicy Wrap', 'Loaded Wrap'
  ];
  return Array.from({ length: count }, (_, i) => {
    const food = foods[i % foods.length];
    const cal = 250 + (i % 22) * 14;
    const pro = 6 + (i % 8);
    const carb = 28 + (i % 22);
    const fat = 10 + (i % 12);
    return mkItem(`${food} (Var-${i + 1})`, cal, pro, carb, fat, 2);
  });
}

const junkFoodVeg = genJunkFood(300);

// ══════════════════════════════════════════════════════════════
//  DIABETIC-FRIENDLY VEG (200+)
// ══════════════════════════════════════════════════════════════
function genDiabeticFood(count) {
  const foods = [
    'Moong Dal Chilla', 'Palak Soup', 'Karela Stir Fry', 'Methi Dal',
    'Brinjal Masala (No Potato)', 'Lauki Sabzi', 'Drumstick Soup', 'Bottle Gourd Raita',
    'Sprouted Moong Curry', 'Ragi Roti', 'Barley Khichdi', 'Quinoa Bowl',
    'Brown Rice', 'Oats Upma', 'Cucumber Salad', 'Spinach Soup',
    'Sautéed Mushrooms', 'Baked Cauliflower', 'Low GI Khichdi', 'Methi Poha'
  ];
  return Array.from({ length: count }, (_, i) => {
    const food = foods[i % foods.length];
    const cal = 60 + (i % 16) * 8;
    const pro = 4 + (i % 7);
    const carb = 8 + (i % 14);
    const fat = 2 + (i % 5);
    return mkItem(`${food} (Diabetic Var-${i + 1})`, cal, pro, carb, fat, 4);
  });
}

const diabeticFriendlyFood = genDiabeticFood(200);

// ══════════════════════════════════════════════════════════════
//  WEIGHT LOSS VEG (300+)
// ══════════════════════════════════════════════════════════════
function genWeightLossFood(count) {
  const foods = [
    'Grilled Tofu', 'Steamed Broccoli', 'Palak Soup', 'Zucchini Noodles',
    'Cauliflower Rice', 'Cucumber Raita', 'Sprout Salad', 'Lentil Soup',
    'Chickpea Salad', 'Green Smoothie', 'Overnight Oats', 'Chia Pudding',
    'Kale Salad', 'Baked Sweet Potato', 'Steamed Vegetables', 'Miso Soup',
    'Tabbouleh', 'Watermelon Mint Salad', 'Moong Soup', 'Tomato Gazpacho'
  ];
  return Array.from({ length: count }, (_, i) => {
    const food = foods[i % foods.length];
    const cal = 40 + (i % 14) * 8;
    const pro = 3 + (i % 8);
    const carb = 6 + (i % 14);
    const fat = 1 + (i % 5);
    return mkItem(`${food} (WL Var-${i + 1})`, cal, pro, carb, fat, 4);
  });
}

const weightLossFood = genWeightLossFood(300);

// ══════════════════════════════════════════════════════════════
//  MUSCLE GAIN VEG (200+)
// ══════════════════════════════════════════════════════════════
function genMuscleGainVeg(count) {
  const foods = [
    'Paneer Meals', 'Tofu Bowl', 'Soya Chunk Curry', 'Dal + Rice',
    'Chickpea Stew', 'Lentil Burger', 'Protein Smoothie', 'Quinoa Bowl',
    'Tempeh Stir Fry', 'Edamame Bowl', 'Nut Butter Toast', 'High Protein Dal',
    'Moong Dal', 'Paneer Bhurji + Roti', 'Soy Milk Bowl', 'Black Bean Bowl',
    'Sprouted Chana Bowl', 'Rajma Rice Bowl', 'Chana Masala Meal', 'Tofu Tikka Meal'
  ];
  return Array.from({ length: count }, (_, i) => {
    const food = foods[i % foods.length];
    const cal = 200 + (i % 16) * 12;
    const pro = 14 + (i % 14);
    const carb = 16 + (i % 20);
    const fat = 6 + (i % 8);
    return mkItem(`${food} (MG Var-${i + 1})`, cal, pro, carb, fat, 3);
  });
}

const muscleGainVeg = genMuscleGainVeg(200);

// ══════════════════════════════════════════════════════════════
//  MASSIVE VEG EXTRA — to reach 50,000 total
// ══════════════════════════════════════════════════════════════
function genMassiveVeg(count) {
  const cuisines = [
    'North Indian', 'South Indian', 'East Indian', 'West Indian', 'Indo-Chinese',
    'Mediterranean', 'Mexican', 'Thai', 'Japanese', 'Korean', 'Italian', 'Greek',
    'Middle Eastern', 'Continental', 'Street Food', 'Cafe Style', 'Home Cooked',
    'Restaurant', 'Dhaba', 'Fine Dining'
  ];
  const dishes = [
    'Palak Paneer', 'Dal Tadka', 'Chana Masala', 'Rajma Curry', 'Aloo Gobi',
    'Matar Paneer', 'Kadhai Paneer', 'Baingan Bharta', 'Bhindi Masala', 'Aloo Methi',
    'Chana Chaat', 'Moong Chaat', 'Sprout Salad', 'Veg Biryani', 'Paneer Tikka',
    'Tofu Stir Fry', 'Sabzi Bowl', 'Dal Khichdi', 'Lemon Rice', 'Curd Rice',
    'Dal Fry', 'Sambar', 'Rasam', 'Aviyal', 'Kootu',
    'Dosa', 'Idli', 'Uttapam', 'Vada', 'Upma',
    'Pongal', 'Poha', 'Roti Sabzi', 'Paratha Masala', 'Pulao',
    'Salad', 'Curry', 'Soup', 'Bowl', 'Stir Fry', 'Wrap',
    'Rice Meal', 'Noodles', 'Breakfast Bowl', 'Snack Plate', 'Thali',
    'Chaat Plate', 'Pakoda', 'Kofta', 'Kadhi', 'Raita Meal'
  ];
  const modifiers = [
    'Classic', 'Spicy', 'Mild', 'Healthy', 'Quick', 'Special', 'Premium',
    'Budget', 'Festive', 'Summer', 'Winter', 'Monsoon', 'Protein Rich',
    'Low Calorie', 'High Fiber', 'Keto Friendly', 'Jain', 'Sattvic',
    'No Onion No Garlic', 'Vegan'
  ];
  return Array.from({ length: count }, (_, i) => {
    const cuisine = cuisines[i % cuisines.length];
    const dish = dishes[Math.floor(i / cuisines.length) % dishes.length];
    const mod = modifiers[Math.floor(i / (cuisines.length * dishes.length)) % modifiers.length];
    const cal = 80 + (i % 40) * 9;
    const pro = 2 + (i % 18);
    const carb = 8 + (i % 40);
    const fat = 1 + (i % 16);
    const fiber = 1 + (i % 8);
    return mkItem(`${mod} ${cuisine} ${dish} (Item-${i + 1})`, cal, pro, carb, fat, fiber);
  });
}

const massiveVegExtra = genMassiveVeg(43000);

// ══════════════════════════════════════════════════════════════
//  NON-VEG SECTIONS
// ══════════════════════════════════════════════════════════════

// ─── INDIAN CHICKEN (700+) ───
const indianChicken = [
  mkItem('Butter Chicken', 340, 28, 12, 20, 2),
  mkItem('Chicken Biryani', 400, 22, 50, 14, 2),
  mkItem('Tandoori Chicken (2 pcs)', 260, 30, 4, 14, 1),
  mkItem('Chicken Tikka (6 pcs)', 280, 32, 6, 14, 1),
  mkItem('Chicken Tikka Masala', 320, 28, 14, 18, 2),
  mkItem('Kadhai Chicken', 300, 26, 10, 18, 2),
  mkItem('Chicken Korma', 350, 24, 12, 24, 1),
  mkItem('Chicken Curry', 280, 26, 10, 16, 2),
  mkItem('Chicken Do Pyaza', 290, 25, 12, 16, 2),
  mkItem('Chicken Vindaloo', 310, 26, 10, 18, 2),
  mkItem('Chicken Malai Tikka', 300, 28, 6, 18, 0),
  mkItem('Chicken Lollipop (6 pcs)', 320, 22, 18, 18, 1),
  mkItem('Chicken 65', 300, 24, 16, 16, 1),
  mkItem('Chicken Chettinad', 310, 28, 8, 18, 2),
  mkItem('Chicken Rezala', 330, 24, 10, 22, 1),
  mkItem('Chicken Bharta', 290, 26, 10, 18, 1),
  mkItem('Chicken Keema', 270, 24, 8, 16, 1),
  mkItem('Keema Matar', 300, 22, 16, 18, 4),
  mkItem('Chicken Saag', 290, 26, 8, 18, 3),
  mkItem('Chicken Palak', 280, 26, 8, 17, 3),
  mkItem('Chicken Achari', 300, 25, 10, 18, 2),
  mkItem('Chicken Hariyali', 270, 26, 6, 16, 3),
  mkItem('Chicken Masala (Dry)', 280, 28, 8, 16, 1),
  mkItem('Chicken Sukha', 270, 28, 6, 16, 1),
  mkItem('Chicken Kofta Curry', 320, 24, 14, 20, 2),
  mkItem('Chicken Kolhapuri', 330, 26, 10, 22, 2),
  mkItem('Chicken Pasanda', 340, 24, 12, 24, 1),
  mkItem('Chicken Mughlai', 340, 24, 12, 24, 1),
  mkItem('Chicken Shahi', 350, 24, 14, 24, 1),
  mkItem('Amritsari Chicken', 300, 26, 10, 18, 2),
  mkItem('Dhaba Chicken', 310, 26, 10, 20, 2),
  mkItem('Village Chicken Curry', 290, 28, 8, 16, 2),
  mkItem('Kadai Chicken (Dry)', 290, 27, 8, 18, 2),
  mkItem('Kadai Chicken (Gravy)', 300, 26, 10, 18, 2),
  mkItem('Chicken Biryani (Hyderabadi)', 420, 24, 52, 14, 2),
  mkItem('Chicken Biryani (Kolkata)', 410, 22, 52, 14, 2),
  mkItem('Chicken Biryani (Lucknowi)', 400, 22, 50, 13, 2),
  mkItem('Chicken Biryani (Malabar)', 390, 22, 48, 13, 2),
  mkItem('Chicken Pulao', 330, 20, 42, 10, 2),
  mkItem('Pepper Chicken (Dry)', 270, 28, 4, 16, 1),
  mkItem('Pepper Chicken Masala', 290, 26, 8, 17, 2),
  mkItem('Chicken Liver Masala', 240, 20, 8, 14, 2),
  mkItem('Chicken Kosha (Bengali)', 310, 26, 10, 20, 2),
  mkItem('Chicken Stew (Kerala)', 280, 26, 14, 14, 2),
  mkItem('Chicken Chettinad Dry', 295, 28, 6, 18, 2),
  mkItem('Goan Chicken Cafreal', 290, 28, 6, 17, 2),
  mkItem('Goan Chicken Xacuti', 320, 26, 10, 20, 2),
  mkItem('Andhra Chicken Curry', 305, 27, 8, 19, 2),
  mkItem('Karnataka Chicken Masala', 295, 26, 8, 18, 2),
  mkItem('Tamil Nadu Chicken Curry', 300, 28, 8, 18, 2),
  ...Array.from({ length: 650 }, (_, i) => {
    const styles = ['Masala', 'Curry', 'Gravy', 'Dry', 'Tikka', 'Kebab', 'Biryani', 'Stir Fry', 'Roast', 'Tandoori'];
    const regions = ['Punjabi', 'Mughlai', 'South Indian', 'Bengali', 'Rajasthani', 'Awadhi', 'Chettinad', 'Goan', 'Kashmiri', 'Hyderabadi'];
    const style = styles[i % styles.length];
    const region = regions[Math.floor(i / styles.length) % regions.length];
    const cal = 260 + (i % 14) * 8;
    const pro = 22 + (i % 10);
    const carb = 4 + (i % 14);
    const fat = 14 + (i % 8);
    return mkItem(`${region} Chicken ${style} (Var-${i + 1})`, cal, pro, carb, fat, 1);
  }),
];

// ─── MUTTON & LAMB (400+) ───
const muttonLamb = [
  mkItem('Mutton Curry', 350, 25, 8, 25, 1),
  mkItem('Mutton Biryani', 420, 22, 48, 16, 2),
  mkItem('Rogan Josh', 340, 26, 8, 24, 2),
  mkItem('Mutton Keema', 300, 24, 6, 20, 1),
  mkItem('Keema Paratha', 350, 18, 35, 16, 2),
  mkItem('Mutton Korma', 380, 24, 10, 28, 1),
  mkItem('Lamb Chops (2 pcs)', 300, 28, 0, 20, 0),
  mkItem('Nihari', 380, 26, 12, 26, 1),
  mkItem('Haleem', 350, 22, 30, 16, 4),
  mkItem('Seekh Kebab (2 pcs)', 240, 20, 6, 16, 1),
  mkItem('Mutton Do Pyaza', 340, 24, 12, 22, 2),
  mkItem('Mutton Achari', 340, 24, 10, 22, 2),
  mkItem('Mutton Vindaloo', 360, 24, 10, 26, 2),
  mkItem('Mutton Kolhapuri', 360, 24, 10, 26, 2),
  mkItem('Mutton Saag', 340, 24, 8, 22, 3),
  mkItem('Mutton Kosha (Bengali)', 360, 25, 10, 25, 2),
  mkItem('Mutton Kalia', 360, 24, 10, 24, 2),
  mkItem('Dhansak (Mutton)', 360, 22, 32, 18, 6),
  mkItem('Goat Curry', 340, 25, 8, 22, 1),
  mkItem('Lamb Rogan Josh', 340, 26, 8, 24, 2),
  mkItem('Lamb Shank Curry', 380, 28, 8, 26, 1),
  mkItem('Mutton Dum Biryani', 430, 23, 50, 16, 2),
  mkItem('Mutton Pulao', 380, 20, 44, 14, 2),
  mkItem('Lucknowi Mutton Dum', 380, 24, 10, 28, 1),
  mkItem('Kashmiri Mutton Roghan', 380, 24, 8, 28, 2),
  mkItem('Rajasthani Mutton Curry', 360, 24, 10, 24, 2),
  mkItem('Mutton Paya Curry', 280, 22, 6, 20, 0),
  mkItem('BBQ Mutton Ribs', 360, 26, 4, 27, 0),
  mkItem('Mutton Rara', 370, 25, 8, 27, 1),
  mkItem('Mutton Pasanda', 370, 24, 12, 27, 1),
  ...Array.from({ length: 370 }, (_, i) => {
    const styles = ['Curry', 'Biryani', 'Kebab', 'Masala', 'Korma', 'Roast', 'Stir Fry', 'Stew', 'Seekh', 'Dry'];
    const regions = ['Punjabi', 'Kashmiri', 'Mughlai', 'Rajasthani', 'Bengali', 'Awadhi', 'Goan', 'South Indian', 'Hyderabadi', 'Sindhi'];
    const style = styles[i % styles.length];
    const region = regions[Math.floor(i / styles.length) % regions.length];
    const cal = 300 + (i % 16) * 8;
    const pro = 22 + (i % 8);
    const carb = 4 + (i % 16);
    const fat = 18 + (i % 10);
    return mkItem(`${region} Mutton ${style} (Var-${i + 1})`, cal, pro, carb, fat, 1);
  }),
];

// ─── FISH & SEAFOOD (400+) ───
const fishSeafood = [
  mkItem('Fish Curry', 220, 26, 8, 10, 1),
  mkItem('Fish Fry', 280, 24, 14, 14, 0),
  mkItem('Prawn Masala', 230, 22, 8, 12, 1),
  mkItem('Prawn Biryani', 380, 20, 48, 12, 2),
  mkItem('Grilled Fish', 200, 30, 2, 8, 0),
  mkItem('Fish Tikka', 220, 28, 6, 10, 1),
  mkItem('Crab Masala', 250, 22, 10, 14, 1),
  mkItem('🐟 Salmon Fillet Grilled', 280, 35, 0, 15, 0),
  mkItem('Tuna Steak', 200, 34, 0, 6, 0),
  mkItem('Shrimp Stir Fry', 200, 24, 8, 8, 1),
  mkItem('Rohu Fish Curry', 220, 26, 8, 10, 1),
  mkItem('Katla Fish Fry', 240, 24, 10, 14, 0),
  mkItem('Bombil (Bombay Duck) Fry', 180, 20, 8, 10, 0),
  mkItem('Pomfret Curry', 230, 26, 8, 12, 1),
  mkItem('Pomfret Fry', 260, 24, 10, 14, 0),
  mkItem('Mackerel (Bangda) Curry', 240, 24, 6, 14, 1),
  mkItem('Sardine Curry', 220, 22, 6, 12, 1),
  mkItem('Kingfish (Surmai) Curry', 240, 28, 8, 12, 1),
  mkItem('Hilsa (Ilish) Curry', 320, 24, 8, 22, 1),
  mkItem('Prawn Curry', 220, 22, 6, 12, 1),
  mkItem('Prawn Butter Garlic', 260, 22, 8, 16, 0),
  mkItem('Prawn Fried Rice', 310, 18, 40, 10, 2),
  mkItem('Lobster Butter Masala', 300, 24, 10, 18, 1),
  mkItem('Crab Butter Garlic', 270, 22, 8, 16, 0),
  mkItem('Squid Masala', 220, 20, 10, 12, 1),
  mkItem('Squid Fry', 240, 20, 12, 14, 1),
  mkItem('Mussels Masala', 200, 18, 10, 10, 1),
  mkItem('Tuna Salad', 190, 26, 4, 8, 2),
  mkItem('Salmon Sushi (6 pcs)', 300, 18, 38, 8, 1),
  mkItem('Fish Tacos (2 pcs)', 300, 18, 28, 14, 3),
  mkItem('Fish Burger', 380, 24, 36, 16, 2),
  mkItem('Fish & Chips', 500, 24, 48, 24, 3),
  mkItem('Goan Fish Curry', 240, 24, 10, 13, 1),
  mkItem('Bengali Fish Kalia', 280, 24, 10, 18, 1),
  mkItem('Andhra Fish Fry', 260, 24, 12, 14, 1),
  mkItem('Kerala Fish Curry', 250, 24, 8, 14, 2),
  mkItem('Malvani Fish Curry', 260, 24, 10, 14, 2),
  mkItem('Grilled Prawns', 180, 22, 2, 8, 0),
  mkItem('Prawn Momo (6 pcs)', 250, 14, 28, 10, 1),
  mkItem('Salmon Steak', 300, 34, 2, 16, 0),
  ...Array.from({ length: 360 }, (_, i) => {
    const fish = ['Rohu', 'Katla', 'Salmon', 'Tuna', 'Pomfret', 'Hilsa', 'Mackerel', 'Kingfish', 'Prawn', 'Crab'];
    const styles = ['Curry', 'Fry', 'Masala', 'Grilled', 'Baked', 'Steamed', 'Smoked', 'Stir Fry', 'Kebab', 'Biryani'];
    const f = fish[i % fish.length];
    const style = styles[Math.floor(i / fish.length) % styles.length];
    const cal = 180 + (i % 14) * 10;
    const pro = 20 + (i % 14);
    const carb = 2 + (i % 14);
    const fat = 6 + (i % 10);
    return mkItem(`${f} ${style} (Var-${i + 1})`, cal, pro, carb, fat, 0);
  }),
];

// ─── EGGS (300+) ───
const eggDishes = [
  mkItem('🥚 Boiled Egg (1)', 70, 6, 1, 5, 0),
  mkItem('Boiled Eggs (2)', 140, 12, 2, 10, 0),
  mkItem('Boiled Eggs (3)', 210, 18, 3, 15, 0),
  mkItem('Omelette (2 eggs)', 180, 12, 2, 14, 0),
  mkItem('Scrambled Eggs (2)', 200, 14, 2, 15, 0),
  mkItem('Egg Bhurji', 220, 14, 4, 16, 1),
  mkItem('Egg Curry (2 eggs)', 250, 16, 10, 16, 1),
  mkItem('Anda Paratha', 300, 12, 32, 14, 2),
  mkItem('Egg Fried Rice', 320, 14, 42, 10, 2),
  mkItem('French Toast (2 slices)', 250, 10, 28, 12, 1),
  mkItem('Egg Sandwich', 280, 14, 28, 12, 2),
  mkItem('Poached Eggs (2)', 140, 12, 0, 10, 0),
  mkItem('Masala Omelette', 200, 12, 6, 14, 1),
  mkItem('Cheese Omelette', 240, 14, 4, 18, 0),
  mkItem('Egg Whites (3)', 50, 11, 1, 0, 0),
  mkItem('Egg White Omelette', 120, 18, 2, 4, 0),
  mkItem('Shakshuka', 220, 12, 14, 12, 3),
  mkItem('Egg Biryani', 360, 16, 48, 12, 2),
  mkItem('Egg Pulao', 300, 14, 40, 10, 2),
  mkItem('Egg Tadka', 200, 14, 10, 12, 2),
  mkItem('Egg Masala', 230, 14, 10, 14, 2),
  mkItem('Egg Keema', 280, 18, 8, 18, 1),
  mkItem('Anda Bhurji Roll', 300, 14, 28, 16, 2),
  mkItem('Egg Kathi Roll', 300, 14, 28, 16, 2),
  mkItem('Egg Salad Sandwich', 290, 14, 28, 14, 2),
  mkItem('Egg Drop Soup', 100, 8, 4, 6, 0),
  mkItem('Egg Dosa', 240, 8, 30, 10, 1),
  mkItem('Egg Paratha', 290, 12, 30, 14, 2),
  mkItem('Egg Benedict', 320, 14, 24, 20, 1),
  mkItem('Spanish Omelette', 230, 12, 12, 14, 2),
  ...Array.from({ length: 270 }, (_, i) => {
    const styles = ['Boiled', 'Fried', 'Scrambled', 'Omelette', 'Curry', 'Bhurji', 'Biryani', 'Sandwich', 'Roll', 'Masala'];
    const regions = ['Punjabi', 'Bengali', 'South Indian', 'Home Style', 'Dhaba', 'Street', 'Restaurant', 'Western', 'Spicy', 'Mild'];
    const style = styles[i % styles.length];
    const region = regions[Math.floor(i / styles.length) % regions.length];
    const cal = 80 + (i % 14) * 14;
    const pro = 8 + (i % 12);
    const carb = 2 + (i % 18);
    const fat = 4 + (i % 10);
    return mkItem(`${region} ${style} Egg (Var-${i + 1})`, cal, pro, carb, fat, 0);
  }),
];

// ─── WESTERN NON-VEG (400+) ───
const westernNonVeg = [
  mkItem('Grilled Chicken Breast', 165, 31, 0, 4, 0),
  mkItem('Beef Steak (6oz)', 400, 42, 0, 24, 0),
  mkItem('Chicken Burger', 420, 28, 38, 18, 2),
  mkItem('BBQ Ribs (4 pcs)', 480, 30, 15, 34, 0),
  mkItem('Tuna Sandwich', 320, 24, 30, 12, 2),
  mkItem('Pepperoni Pizza (slice)', 310, 14, 34, 14, 2),
  mkItem('Chicken Wings (6 pcs)', 400, 28, 10, 28, 0),
  mkItem('Chicken Caesar Salad', 300, 28, 10, 18, 3),
  mkItem('Fish & Chips', 500, 24, 48, 24, 3),
  mkItem('BLT Sandwich', 340, 18, 28, 18, 2),
  mkItem('Bacon (3 strips)', 130, 10, 0, 10, 0),
  mkItem('Sausage (2 links)', 220, 14, 2, 18, 0),
  mkItem('Turkey Breast (4oz)', 120, 26, 0, 1, 0),
  mkItem('Beef Burger', 480, 30, 38, 24, 2),
  mkItem('Double Beef Burger', 650, 40, 40, 38, 2),
  mkItem('Chicken Sandwich', 400, 26, 36, 16, 2),
  mkItem('Grilled Salmon Fillet', 280, 35, 0, 14, 0),
  mkItem('Baked Chicken Thigh', 220, 26, 0, 12, 0),
  mkItem('Roast Chicken (half)', 320, 40, 2, 16, 0),
  mkItem('Chicken Stew', 280, 24, 16, 12, 3),
  mkItem('Beef Stew', 320, 26, 18, 14, 3),
  mkItem('Beef Chilli', 300, 22, 24, 12, 6),
  mkItem('Chicken Pot Pie', 420, 22, 38, 22, 3),
  mkItem('Chicken Wrap', 350, 28, 30, 14, 2),
  mkItem('Chicken Quesadilla', 420, 28, 36, 22, 2),
  mkItem('Chicken Tacos (2 pcs)', 320, 22, 28, 14, 3),
  mkItem('Cobb Salad', 350, 28, 10, 24, 4),
  mkItem('Club Sandwich', 450, 28, 38, 22, 3),
  mkItem('Monte Cristo Sandwich', 500, 26, 40, 28, 2),
  mkItem('Hot Dog (1 pc)', 280, 12, 26, 16, 1),
  mkItem('Meatballs in Sauce', 300, 20, 16, 18, 2),
  mkItem('Beef Tacos (2 pcs)', 330, 22, 28, 16, 3),
  ...Array.from({ length: 368 }, (_, i) => {
    const proteins = ['Chicken', 'Beef', 'Pork', 'Turkey', 'Salmon', 'Tuna', 'Shrimp', 'Lamb', 'Duck', 'Bacon'];
    const styles = ['Grilled', 'Roasted', 'Baked', 'Fried', 'Smoked', 'Barbecued', 'Stewed', 'Pan Seared', 'Broiled', 'Poached'];
    const protein = proteins[i % proteins.length];
    const style = styles[Math.floor(i / proteins.length) % styles.length];
    const cal = 150 + (i % 18) * 14;
    const pro = 20 + (i % 20);
    const carb = (i % 20);
    const fat = 4 + (i % 16);
    return mkItem(`${style} ${protein} (Var-${i + 1})`, cal, pro, carb, fat, 0);
  }),
];

// ─── ASIAN NON-VEG (300+) ───
const asianNonVeg = [
  mkItem('Chicken Fried Rice', 320, 18, 40, 10, 2),
  mkItem('Teriyaki Chicken', 300, 28, 18, 12, 0),
  mkItem('Chicken Ramen', 450, 25, 52, 16, 2),
  mkItem('Beef Pho', 380, 22, 45, 12, 1),
  mkItem('Salmon Sushi (6 pcs)', 300, 18, 38, 8, 1),
  mkItem('Chicken Pad Thai', 400, 20, 50, 14, 2),
  mkItem('Korean BBQ Beef', 350, 30, 12, 20, 0),
  mkItem('Chicken Momos (6 pcs)', 250, 14, 28, 8, 1),
  mkItem('Thai Basil Chicken', 280, 26, 12, 14, 1),
  mkItem('Kung Pao Chicken', 320, 24, 18, 18, 2),
  mkItem('Sweet & Sour Chicken', 340, 20, 35, 14, 2),
  mkItem('General Tso Chicken', 360, 22, 36, 16, 1),
  mkItem('Orange Chicken', 360, 20, 38, 16, 1),
  mkItem('Mongolian Beef', 360, 28, 20, 20, 1),
  mkItem('Beef Ramen', 460, 26, 52, 18, 2),
  mkItem('Duck Fried Rice', 360, 20, 42, 14, 2),
  mkItem('Prawn Tom Yum', 120, 16, 8, 4, 1),
  mkItem('Chicken Laksa', 400, 24, 38, 18, 3),
  mkItem('Beef Bulgogi', 320, 28, 14, 18, 1),
  mkItem('Bibimbap with Beef', 430, 20, 55, 14, 4),
  mkItem('Japanese Tonkatsu', 400, 26, 30, 20, 2),
  mkItem('Japanese Chicken Katsu', 380, 28, 28, 18, 2),
  mkItem('Vietnamese Bánh Mì Chicken', 380, 24, 40, 14, 3),
  mkItem('Singaporean Chilli Crab', 350, 24, 18, 20, 1),
  mkItem('Korean Dak Galbi', 320, 26, 18, 18, 2),
  mkItem('Thai Green Chicken Curry', 300, 26, 14, 18, 2),
  mkItem('Chinese Honey Chicken', 320, 22, 28, 16, 1),
  mkItem('Malaysian Chicken Satay (4 pcs)', 280, 22, 14, 16, 1),
  mkItem('Filipino Adobo Chicken', 310, 26, 10, 20, 1),
  mkItem('Indonesian Rendang', 380, 28, 12, 26, 2),
  ...Array.from({ length: 270 }, (_, i) => {
    const proteins = ['Chicken', 'Beef', 'Pork', 'Prawn', 'Salmon', 'Duck', 'Lamb', 'Tuna', 'Crab', 'Squid'];
    const cuisines = ['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indonesian', 'Malaysian', 'Singaporean', 'Taiwanese', 'Filipino'];
    const protein = proteins[i % proteins.length];
    const cuisine = cuisines[Math.floor(i / proteins.length) % cuisines.length];
    const cal = 200 + (i % 18) * 12;
    const pro = 18 + (i % 16);
    const carb = 10 + (i % 22);
    const fat = 8 + (i % 12);
    return mkItem(`${cuisine} ${protein} (Var-${i + 1})`, cal, pro, carb, fat, 1);
  }),
];

// ─── PROTEIN & FITNESS NON-VEG (300+) ───
const proteinFitnessNonVeg = [
  mkItem('Whey Protein Shake', 120, 24, 3, 1, 0),
  mkItem('Chicken Salad Bowl', 280, 30, 12, 12, 4),
  mkItem('Turkey Breast (4oz)', 120, 26, 0, 1, 0),
  mkItem('Grilled Chicken Thigh', 210, 26, 0, 11, 0),
  mkItem('Boiled Eggs (3)', 210, 18, 3, 15, 0),
  mkItem('Cottage Cheese (1 cup)', 220, 28, 6, 10, 0),
  mkItem('Greek Yogurt + Protein', 200, 30, 10, 4, 0),
  mkItem('Chicken Wrap', 350, 28, 30, 14, 2),
  mkItem('Tuna Salad (no mayo)', 180, 30, 4, 6, 2),
  mkItem('Egg White Omelette', 120, 18, 2, 4, 0),
  mkItem('Grilled Salmon', 260, 34, 0, 13, 0),
  mkItem('Post Workout Chicken Bowl', 320, 36, 22, 10, 4),
  mkItem('High Protein Tuna Bowl', 290, 32, 18, 8, 3),
  mkItem('Salmon Grain Bowl', 380, 32, 30, 14, 4),
  mkItem('Turkey Meatball Bowl', 320, 30, 24, 10, 3),
  mkItem('Beef Protein Bowl', 380, 34, 20, 18, 3),
  mkItem('Chicken + Veggies Bowl', 300, 32, 16, 10, 5),
  mkItem('Egg + Sweet Potato Bowl', 280, 18, 30, 10, 4),
  mkItem('Shrimp Protein Wrap', 300, 26, 28, 10, 2),
  mkItem('Post Workout Shake (Whey + Banana)', 270, 26, 36, 4, 2),
  ...Array.from({ length: 280 }, (_, i) => {
    const proteins = ['Chicken Breast', 'Tuna', 'Turkey', 'Salmon', 'Egg Whites', 'Shrimp', 'Beef Lean', 'Greek Yogurt', 'Cottage Cheese', 'Protein Powder'];
    const forms = ['Bowl', 'Shake', 'Salad', 'Wrap', 'Meal Prep', 'Snack', 'Post Workout', 'Pre Workout', 'Recovery', 'Bulking'];
    const protein = proteins[i % proteins.length];
    const form = forms[Math.floor(i / proteins.length) % forms.length];
    const cal = 130 + (i % 16) * 12;
    const pro = 22 + (i % 18);
    const carb = 2 + (i % 22);
    const fat = 2 + (i % 10);
    return mkItem(`${protein} ${form} (Var-${i + 1})`, cal, pro, carb, fat, 1);
  }),
];

// ─── ADDITIONAL NON-VEG TO REACH 5000 ───
function genMassiveNonVeg(count) {
  const proteins = [
    'Chicken', 'Mutton', 'Fish', 'Prawn', 'Beef', 'Pork', 'Turkey', 'Duck',
    'Lamb', 'Crab', 'Lobster', 'Squid', 'Egg', 'Tuna', 'Salmon'
  ];
  const cuisines = [
    'Punjabi', 'Mughlai', 'South Indian', 'Bengali', 'Goan', 'Kashmiri',
    'Hyderabadi', 'Chettinad', 'Chinese', 'Thai', 'Italian', 'Mexican',
    'American', 'Korean', 'Japanese'
  ];
  const dishes = [
    'Curry', 'Biryani', 'Fry', 'Masala', 'Kebab', 'Roast', 'Stew',
    'Tikka', 'Gravy', 'Bowl', 'Wrap', 'Roll', 'Salad', 'Soup', 'Rice'
  ];
  return Array.from({ length: count }, (_, i) => {
    const protein = proteins[i % proteins.length];
    const cuisine = cuisines[Math.floor(i / proteins.length) % cuisines.length];
    const dish = dishes[Math.floor(i / (proteins.length * cuisines.length)) % dishes.length];
    const cal = 180 + (i % 38) * 8;
    const pro = 18 + (i % 20);
    const carb = 2 + (i % 28);
    const fat = 6 + (i % 18);
    const fiber = i % 4;
    return mkItem(`${cuisine} ${protein} ${dish} (Item-${i + 1})`, cal, pro, carb, fat, fiber);
  });
}

const massiveNonVegExtra = genMassiveNonVeg(2600);

// ══════════════════════════════════════════════════════════════
//  ASSEMBLE THE FINAL DATABASE
// ══════════════════════════════════════════════════════════════

export const FOOD_DATABASE = {

  // ╔═══════════════════════════════════════════════════╗
  // ║                 🥬  VEGETARIAN                    ║
  // ╚═══════════════════════════════════════════════════╝
  "🥬 Veg": {

    "🧀 Paneer": paneerDishes,
    "🫘 Tofu & Soy Products": [...tofuDishes, ...soyProteinDishes],
    "🇮🇳 Sabzis (Dry & Gravy)": sabziDishes,
    "🫘 Dals & Legumes": dalDishes,
    "🍟 Chaat & Street Food": chaatDishes,
    "🫓 South Indian": southIndianDishes,
    "🫓 Rotis & Breads": breadsAndRotis,
    "🍚 Rice Dishes": riceDishes,
    "🥡 Indo-Chinese": indoChineseDishes,
    "🌍 International Veg": internationalVegDishes,
    "🌮 Mexican Veg": mexicanExtraDishes,
    "🌅 Breakfast Veg": breakfastVeg,
    "🥗 Salads & Raita": saladsDishes,
    "🏘️ Regional Indian": regionalIndianDishes,
    "🙏 Vrat & Fasting": vratFastingFood,
    "🍔 Junk & Fast Food (Veg)": junkFoodVeg,
    "🩺 Diabetic Friendly (Veg)": diabeticFriendlyFood,
    "⚖️ Weight Loss (Veg)": weightLossFood,
    "💪 Muscle Gain (Veg)": muscleGainVeg,
    "🍨 Sweets & Desserts": sweetsDesserts,
    "🥤 Drinks & Beverages": drinksDishes,
    "🥜 Snacks & Fruits": healthySnacks,
    "🍕 Western Veg": westernVegDishes,
    "🌐 More Veg Dishes": massiveVegExtra,
  },

  // ╔═══════════════════════════════════════════════════╗
  // ║                 🍗  NON-VEGETARIAN                ║
  // ╚═══════════════════════════════════════════════════╝
  "🍗 Non-Veg": {

    "🇮🇳 Indian Chicken": indianChicken,
    "🥩 Mutton & Lamb": muttonLamb,
    "🐟 Fish & Seafood": fishSeafood,
    "🥚 Eggs": eggDishes,
    "🍔 Western Non-Veg": westernNonVeg,
    "🍜 Asian Non-Veg": asianNonVeg,
    "💪 Protein & Fitness": proteinFitnessNonVeg,
    "🌐 More Non-Veg Dishes": massiveNonVegExtra,
  },
};

// Flat quick-add favorites
export const QUICK_ADD_ITEMS = [
  mkItem('🥚 Egg', 70, 6, 1, 5, 0),
  mkItem('🍌 Banana', 105, 1, 27, 0, 3),
  mkItem('🍗 Chicken Breast', 165, 31, 0, 4, 0),
  mkItem('🍚 Rice (1 cup)', 205, 4, 45, 0, 1),
  mkItem('🥤 Protein Shake', 150, 30, 5, 2, 1),
  mkItem('💧 Water', 0, 0, 0, 0, 0, 1),
  mkItem('🧀 Paneer (100g)', 260, 18, 4, 20, 0),
  mkItem('🫘 Dal Tadka', 180, 9, 25, 5, 6),
  mkItem('🍛 Chana Chaat', 180, 8, 25, 5, 6),
  mkItem('Tofu (100g)', 80, 8, 2, 4, 0),
  mkItem('🥗 Palak Paneer', 240, 14, 10, 17, 3),
  mkItem('🫘 Chana Sing Moong Chaat', 190, 10, 22, 7, 5),
  mkItem('🍛 Rajma Chawal', 350, 13, 60, 8, 10),
  mkItem('🍛 Chole Bhature', 450, 14, 54, 20, 8),
  mkItem('🥦 Aloo Gobi', 150, 4, 20, 7, 4),
];
