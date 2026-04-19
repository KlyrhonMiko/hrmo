import os

file_path = 'src/app/hrmo/onboard/page.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    # Check if this line ends with a broken logic string
    if i < len(lines) - 1:
        sline = line.strip()
        if (sline.endswith('|| "') or sline.endswith(': "')) and not sline.endswith('""'):
            next_line = lines[i+1].strip()
            # If next line starts with the closing parts, join them
            if next_line.startswith('"}') or next_line.startswith('"} />') or next_line.startswith('" } />') or next_line.startswith('"}</span>') or next_line.startswith('"}</td>') or next_line == '"':
                new_lines.append(line.rstrip('\n') + next_line + '\n')
                i += 2
                continue
            # Special case for multilne ternary
            if next_line.startswith('} />') or next_line.startswith('}'):
                 new_lines.append(line.rstrip('\n') + next_line + '\n')
                 i += 2
                 continue

    new_lines.append(line)
    i += 1

with open(file_path, 'w') as f:
    f.writelines(new_lines)
