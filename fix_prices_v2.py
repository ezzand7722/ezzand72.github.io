import re

prices = {
    "Papaw's Big Burger": ".99",
    # ... just test one ...
}

print("Starting...")
with open('index.html', 'r') as f:
    content = f.read()

# Debug first item
name = "Papaw's Big Burger"
esc_name = re.escape(name)
regex = r'(' + esc_name + r'.*?class="menu-price">)(.*?)(</span>)'
match = re.search(regex, content, re.DOTALL)
if match:
    print(f"Found {name}")
    print(f"Group 1: {match.group(1)}")
    print(f"Group 2: {match.group(2)}")
    print(f"Group 3: {match.group(3)}")
else:
    print(f"Not found {name}")
