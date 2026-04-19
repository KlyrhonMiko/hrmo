file_path = 'src/app/hrmo/onboard/page.tsx'
with open(file_path, 'r') as f:
    content = f.read()

count = 0
for i, char in enumerate(content):
    if char == '{':
        count += 1
    elif char == '}':
        count -= 1
    if count < 0:
        print(f"Brace count went negative at index {i}")
        line = content.count('\n', 0, i) + 1
        print(f"Line number: {line}")
        # print some context
        start = max(0, i-20)
        end = min(len(content), i+20)
        print(f"Context: {repr(content[start:end])}")
        break
print(f"Final brace count: {count}")
