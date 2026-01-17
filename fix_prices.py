import re

prices = {
    "Papaw's Big Burger": ".99",
    "Papaw's Flat Burger": ".99",
    "Philly Steak Sandwich": ".59",
    "Club Sandwich": ".99",
    "Breaded Pork Tenderloin": ".39",
    "Hot Ham & Cheese": ".59",
    "B.L.T. Sandwich": ".99",
    "8\" Stromboli": ".59",
    "Chicken Salad Sandwich": ".99",
    "21 Pc. Breaded Shrimp": ".99",
    "Chicken Tenders": ".99",
    "Butterfly Shrimp": ".99",
    "8 oz. Chopped Steak": ".99",
    "Chicken Livers": ".59",
    "Gizzards": ".59",
    "2 Catfish Fillets": ".99",
    "1 Catfish Fillet": ".99",
    "Breaded Catfish Sandwich": ".99",
    "Add Sweet Potato": "+.00",
    "French Fries / Tator Tots": ".19",
    "Onion Rings": ".99",
    "Breaded Cheese Curds": ".99",
    "Mozzarella Cheese Sticks": ".99",
    "Fried Mushrooms": ".99",
    "Bowl of Chili": ".99",
    "Chef Salad": ".99",
    "Taco Salad": ".99",
    "Chicken Salad": ".99",
    "Soft Drinks / Tea": ".29",
    "Coffee": ".89",
    "Slice of Pie": "Ask",
    "Cobbler of the Day": "Ask"
}

with open('index.html', 'r') as f:
    content = f.read()

for name, price in prices.items():
    # Escape special regex chars in name (like quotes or parens if any)
    escaped_name = re.escape(name)

    # Pattern: match name, followed by any characters until menu-price span, then the span itself.
    # We use non-greedy .*?
    pattern = re.compile(f'({escaped_name}.*?<span class="menu-price">)(.*?)(</span>)', re.DOTALL)

    # We replace group 2 (the old price) with the new price
    content = pattern.sub(f'\g<1>{price}\g<3>', content)

with open('index.html', 'w') as f:
    f.write(content)
