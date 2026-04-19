file_path = 'src/app/hrmo/onboard/page.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

count = 0
for i, line in enumerate(lines):
    # Very simple comment/string stripping
    sline = line.split('//')[0]
    # This is rough but might show the trend
    count += sline.count('{')
    count -= sline.count('}')
    if count != 0 and (i < 500 or i > 2000 or i % 100 == 0):
        print(f"{i+1}: {count}")
