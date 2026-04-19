import re

file_path = 'src/app/hrmo/onboard/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Strip template literals first (they can contain single/double quotes)
content = re.sub(r'`(?:\\.|[^`\\])*`', '``', content, flags=re.DOTALL)
# Strip strings (double quote)
content = re.sub(r'"(?:\\.|[^"\\])*"', '""', content)
# Strip strings (single quote)
content = re.sub(r"'(?:\\.|[^'\\])*'", "''", content)
# Strip single line comments
content = re.sub(r'//.*', '', content)
# Strip multi-line comments
content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

count = 0
for i, char in enumerate(content):
    if char == '{':
        count += 1
    elif char == '}':
        count -= 1
    if count < 0:
        print(f"Brace count went negative at index {i}")
        # index in cleaned content, won't match line number in original easily
        break

print(f"Cleaned brace count: {count}")
