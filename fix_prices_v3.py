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

print("Reading file...")
with open('index.html', 'r') as f:
    content = f.read()

changes = 0
for name, price in prices.items():
    esc_name = re.escape(name)
    regex = r'(' + esc_name + r'.*?class="menu-price">)(.*?)(</span>)'

    if re.search(regex, content, re.DOTALL):
        print(f"Fixing {name} to {price}")
        content = re.sub(regex, lambda m: m.group(1) + price + m.group(3), content, count=1, flags=re.DOTALL)
        changes += 1
    else:
        print(f"Could not find {name}")

print(f"Total changes: {changes}")
with open('index.html', 'w') as f:
    f.write(content)
print("File written.")
